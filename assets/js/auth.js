// ===========================
// EduFun — auth.js (v3 — Firebase)
// Auth pakai Firebase Authentication + Firestore
// ===========================

const Auth = (() => {

  const SESSION_KEY = 'edufun_session';
  const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

  function _saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
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

    // Cek username availability — dengan retry & error detail
    try {
      const snap = await fbDB.collection('usernames').doc(username.toLowerCase()).get();
      if (snap.exists) return { ok: false, msg: 'Username sudah dipakai, coba yang lain.' };
    } catch (e) {
      console.warn('[Auth] cek username error:', e.code, e.message);
      // Jika permission-denied → Firestore Rules belum diupdate
      if (e.code === 'permission-denied') {
        return { ok: false, msg: '⚠️ Firestore Rules belum diupdate. Buka FIRESTORE_RULES.txt lalu publish rules di Firebase Console.' };
      }
      // Jika unavailable (offline) → lanjut saja, biarkan Firebase Auth cek duplikat
      if (e.code !== 'unavailable') {
        return { ok: false, msg: 'Gagal cek username (' + (e.code || 'unknown') + '). Cek koneksi lalu coba lagi.' };
      }
    }

    const fakeEmail = username.toLowerCase() + '@edufun.app';
    try {
      const cred = await fbAuth.createUserWithEmailAndPassword(fakeEmail, password);
      const uid  = cred.user.uid;
      const now  = Date.now();
      const userData = {
        username, role: role || 'siswa', createdAt: now,
        character: null, xp: 0, level: 1, streak: 0, lastLogin: now,
      };
      await fbDB.collection('users').doc(uid).set(userData);
      // Simpan username mapping — tidak fatal jika gagal
      try { await fbDB.collection('usernames').doc(username.toLowerCase()).set({ uid }); } catch(e2) { console.warn('[Auth] simpan username mapping gagal:', e2); }
      const session = _buildSession(uid, userData, now);
      _saveSession(session);
      return { ok: true, msg: 'Akun berhasil dibuat!', user: session };
    } catch (e) { return { ok: false, msg: _fbErrorMsg(e.code) }; }
  }

  // ---- Login ----
  async function login(username, password, rememberMe = false) {
    username = (username || '').trim();
    if (!username || !password) return { ok: false, msg: 'Username dan password wajib diisi.' };

    // ---- Admin bypass (local, tanpa Firebase) ----
    if (username.toLowerCase() === 'user' && password === '123456') {
      const now = Date.now();
      const session = {
        uid       : 'admin-local',
        username  : 'user',
        role      : 'admin',
        xp        : 0,
        level     : 1,
        streak    : 0,
        character : null,
        loginAt   : now,
        expiresAt : now + SESSION_TTL,
      };
      const store = rememberMe ? localStorage : sessionStorage;
      store.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true, msg: 'Login admin berhasil!', user: session };
    }
    // ---- End admin bypass ----

    const fakeEmail = username.toLowerCase() + '@edufun.app';
    try {
      const cred = await fbAuth.signInWithEmailAndPassword(fakeEmail, password);
      const uid  = cred.user.uid;
      const now  = Date.now();
      const doc  = await fbDB.collection('users').doc(uid).get();
      if (!doc.exists) return { ok: false, msg: 'Data user tidak ditemukan.' };
      const data = doc.data();

      const lastDay   = data.lastLogin ? new Date(data.lastLogin).toDateString() : null;
      const today     = new Date(now).toDateString();
      const yesterday = new Date(now - 86400000).toDateString();
      let newStreak   = data.streak || 0;
      if      (lastDay === today)     { /* no change */ }
      else if (lastDay === yesterday) { newStreak += 1; }
      else                            { newStreak = 1; }

      await fbDB.collection('users').doc(uid).update({ streak: newStreak, lastLogin: now });
      const session = _buildSession(uid, { ...data, streak: newStreak, lastLogin: now }, now);
      const store   = rememberMe ? localStorage : sessionStorage;
      store.setItem(SESSION_KEY, JSON.stringify(session));
      return { ok: true, msg: 'Login berhasil!', user: session };
    } catch (e) { return { ok: false, msg: _fbErrorMsg(e.code) }; }
  }

  // ---- Logout ----
  // Semua key localStorage yang spesifik per-user
  const USER_STORAGE_KEYS = [
    'ef_xp_history', 'edufun_activity_logs',
    'ef_cards', 'edufun_agenda_v1', 'ef_streak_data',
    'ef_stat_arena', 'ef_stat_materi', 'ef_stat_pomo',
    'ef_fc_progress', 'ef_char', 'ef_accent',
  ];

  function clearUserStorage() {
    USER_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
  }

  async function logout() {
    // Stop Firestore listener dulu supaya tidak ada write setelah clear
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

  // ---- Simpan karakter ----
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

  // ---- Update XP / Level / Streak ----
  async function updateStats(xp, level, streak) {
    const session = getSession();
    if (!session) return;
    try {
      await fbDB.collection('users').doc(session.uid).update({ xp, level, streak });
      session.xp = xp; session.level = level; session.streak = streak;
      _saveSession(session);
    } catch (e) { console.warn('updateStats:', e); }
  }

  function _buildSession(uid, data, now) {
    return {
      uid,
      username  : data.username,
      role      : data.role      || 'siswa',
      xp        : data.xp        || 0,
      level     : data.level     || 1,
      streak    : data.streak    || 0,
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
