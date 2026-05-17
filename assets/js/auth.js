// ===========================
// EduFun — auth.js (v4 — Single Collection)
// Satu koleksi: 'users/{uid}' untuk semua data.
// Koleksi 'userdata' dihapus — tidak ada lagi duplikasi.
// ===========================

const Auth = (() => {

  const SESSION_KEY = 'edufun_session';
  const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

  function _saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (s.expiresAt && Date.now() > s.expiresAt) { _clearSession(); return null; }
      return s;
    } catch { return null; }
  }

  function _clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  // ---- Register ----
  async function register(username, password, role) {
    username = (username || '').trim();
    if (!username || username.length < 3) return { ok: false, msg: 'Username minimal 3 karakter.' };
    if (username.length > 30)             return { ok: false, msg: 'Username maksimal 30 karakter.' };
    if (!password || password.length < 6) return { ok: false, msg: 'Password minimal 6 karakter.' };
    if (!/^[a-zA-Z0-9_.]+$/.test(username)) return { ok: false, msg: 'Username hanya boleh huruf, angka, titik, atau underscore.' };

    try {
      const snap = await fbDB.collection('usernames').doc(username.toLowerCase()).get({ source: 'server' });
      if (snap.exists) return { ok: false, msg: 'Username sudah dipakai, coba yang lain.' };
    } catch (e) {
      console.warn('[Auth] cek username error:', e.code, e.message);
      if (e.code === 'permission-denied') {
        return { ok: false, msg: '⚠️ Firestore Rules belum diupdate. Buka FIRESTORE_RULES.txt dan publish rules di Firebase Console.' };
      }
      if (e.code !== 'unavailable') {
        return { ok: false, msg: 'Gagal cek username (' + (e.code || 'network') + '). Pastikan koneksi internet aktif.' };
      }
    }

    const fakeEmail = username.toLowerCase() + '@edufun.app';
    try {
      const cred = await fbAuth.createUserWithEmailAndPassword(fakeEmail, password);
      const uid  = cred.user.uid;
      const now  = Date.now();

      // Satu dokumen lengkap di koleksi 'users'
      const userData = {
        username, role: role || 'siswa', createdAt: now, lastLogin: now,
        character: null,
        accent: '#3b82f6',
        coins: 0,
        shop: { owned: ['skin-1'], activeSkin: 'skin-1', activeAcc: '' },
        stats: {
          xp: 0, level: 1, streakCount: 0,
          battleTotal: 0, battleWins: 0, battleXP: 0,
          materiTotal: 0,
          pomodoroTotal: 0, pomodoroToday: 0, pomodoroTodayMnt: 0,
        },
        cards: [],
        agenda: {},
        streak: { days: [], lastShown: null },
        xpHistory: [],
        activityLogs: [],
      };

      await fbDB.collection('users').doc(uid).set(userData);

      try {
        await fbDB.collection('usernames').doc(username.toLowerCase()).set({ uid, createdAt: now });
      } catch(e2) { console.warn('[Auth] simpan username mapping gagal:', e2); }

      const session = _buildSession(uid, userData, now);
      _saveSession(session);
      return { ok: true, msg: 'Akun berhasil dibuat!', user: session };
    } catch (e) { return { ok: false, msg: _fbErrorMsg(e.code) }; }
  }

  // ---- Login ----
  async function login(username, password, rememberMe = false) {
    username = (username || '').trim();
    if (!username || !password) return { ok: false, msg: 'Username dan password wajib diisi.' };

    const fakeEmail = username.toLowerCase() + '@edufun.app';
    try {
      const cred = await fbAuth.signInWithEmailAndPassword(fakeEmail, password);
      const uid  = cred.user.uid;
      const now  = Date.now();

      // Satu get() untuk semua data
      const doc = await fbDB.collection('users').doc(uid).get();
      if (!doc.exists) return { ok: false, msg: 'Data user tidak ditemukan.' };
      const data = doc.data();

      // Update lastLogin & lastOnlineTs
      await fbDB.collection('users').doc(uid).update({
        lastLogin: now,
        'stats.lastOnlineTs': now,
      });

      const session = _buildSession(uid, data, now);
      const ttl = rememberMe ? SESSION_TTL : 24 * 60 * 60 * 1000;
      session.expiresAt = now + ttl;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true, msg: 'Login berhasil!', user: session };
    } catch (e) { return { ok: false, msg: _fbErrorMsg(e.code) }; }
  }

  // ---- Logout ----
  function clearUserStorage() {
    localStorage.removeItem('edufun_session');
    sessionStorage.removeItem('edufun_session');
    Object.keys(localStorage)
      .filter(k => k.startsWith('ef_') || k.startsWith('edufun_'))
      .forEach(k => localStorage.removeItem(k));
    if (typeof window !== 'undefined') {
      window._xpHistory      = [];
      window._activityLogs   = [];
      window._streakData     = { days: [], lastShown: null };
      window._statArena      = null;
      window._statMateri     = null;
      window._statPomo       = null;
      window._shopOwned      = ['skin-1'];
      window._shopActiveSkin = 'skin-1';
      window._shopActiveAcc  = '';
    }
  }

  async function logout() {
    if (typeof StreakSystem !== 'undefined' && StreakSystem.resetCheckFlag) StreakSystem.resetCheckFlag();
    if (typeof FirebaseSync !== 'undefined') FirebaseSync.stop();
    clearUserStorage();
    await fbAuth.signOut();
    _clearSession();
    window.location.href = '../pages/auth.html';
  }

  function requireAuth() {
    if (!getSession()) { window.location.href = '../pages/auth.html'; return false; }
    return true;
  }

  async function saveCharacter(charData) {
    const session = getSession();
    if (!session) return;
    try {
      await fbDB.collection('users').doc(session.uid).update({ character: charData });
      session.character = charData;
      _saveSession(session);
    } catch (e) { console.warn('saveCharacter:', e); }
  }

  function getCharacter() {
    const session = getSession();
    return session ? session.character : null;
  }

  // Hanya update session lokal; tulis Firestore dilakukan FirebaseSync
  function updateStats(xp, level, streak) {
    const session = getSession();
    if (!session) return;
    session.xp = xp; session.level = level; session.streak = streak;
    _saveSession(session);
  }

  function _buildSession(uid, data, now) {
    // Session hanya simpan info auth & karakter.
    // xp, level, streak, coins, accent, stats, shop, agenda → selalu dari Firestore via FirebaseSync.
    return {
      uid,
      username  : data.username,
      role      : data.role      || 'siswa',
      character : data.character || null,
      loginAt   : now,
      expiresAt : now + SESSION_TTL,
    };
  }

  function _fbErrorMsg(code) {
    const map = {
      'auth/email-already-in-use'  : 'Username sudah dipakai.',
      'auth/invalid-email'         : 'Format tidak valid.',
      'auth/weak-password'         : 'Password minimal 6 karakter.',
      'auth/user-not-found'        : 'Username tidak ditemukan.',
      'auth/wrong-password'        : 'Password salah.',
      'auth/invalid-credential'    : 'Username atau password salah.',
      'auth/too-many-requests'     : 'Terlalu banyak percobaan. Coba lagi nanti.',
      'auth/network-request-failed': 'Tidak ada koneksi internet.',
    };
    return map[code] || 'Terjadi kesalahan. Coba lagi.';
  }

  return { register, login, logout, getSession, requireAuth, saveCharacter, getCharacter, updateStats, clearUserStorage };
})();
