// ===========================
// EduFun — firebase-sync.js (v4 — Single Source of Truth)
// Konsep: Firestore adalah satu-satunya sumber kebenaran.
// LOGIN  → tarik SEMUA data user dari Firestore → isi state app
// LOGOUT → tidak perlu flush (setiap aksi sudah langsung tulis ke Firestore)
// localStorage TIDAK dipakai sebagai state — hanya cache render sementara
// ===========================

const FirebaseSync = (() => {

  let _uid = null;
  let _unsubscribe = null;
  let _ready = false;

  // ─────────────────────────────────────────────
  // INIT: dipanggil setelah login berhasil
  // ─────────────────────────────────────────────
  function init() {
    const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
    if (!session || !session.uid) return;

    _uid = session.uid;
    _ready = false;

    // Hentikan listener lama kalau ada
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }

    // Tarik data lengkap dari Firestore SEKALI saat init (guaranteed fresh)
    _pullAllFromFirestore().then(() => {
      // Setelah data masuk, pasang realtime listener untuk perubahan berikutnya
      _startRealtimeListener();
    });
  }

  // ─────────────────────────────────────────────
  // PULL: tarik semua data user dari Firestore
  // ─────────────────────────────────────────────
  async function _pullAllFromFirestore() {
    if (!_uid) return;
    try {
      const doc = await fbDB.collection('userdata').doc(_uid).get();
      const data = doc.exists ? doc.data() : {};
      _applyAllToApp(data);
      _ready = true;
      console.log('[FirebaseSync] Pull selesai — data diterapkan ke app');
    } catch (e) {
      console.warn('[FirebaseSync] Pull gagal:', e);
      _ready = true;
    }
  }

  // ─────────────────────────────────────────────
  // REALTIME LISTENER: untuk update mid-session
  // ─────────────────────────────────────────────
  function _startRealtimeListener() {
    if (!_uid) return;
    _unsubscribe = fbDB.collection('userdata').doc(_uid)
      .onSnapshot({ includeMetadataChanges: false }, (doc) => {
        // Hanya apply jika bukan dari write kita sendiri (server changes saja)
        if (doc.metadata.hasPendingWrites) return;
        const data = doc.exists ? doc.data() : {};
        _applyAllToApp(data);
      }, (err) => {
        console.warn('[FirebaseSync] listener error:', err);
      });
    console.log('[FirebaseSync] Realtime listener aktif v4');
  }

  // ─────────────────────────────────────────────
  // APPLY: terapkan semua data Firestore ke state app & DOM
  // ─────────────────────────────────────────────
  function _applyAllToApp(data) {
    if (!data) data = {};

    // ── 1. Accent / Theme ──
    const accent = data.accent || '#3b82f6';
    localStorage.setItem('ef_ac', accent);
    if (typeof _applyAccentOnly === 'function') _applyAccentOnly(accent);

    // ── 2. Karakter ──
    if (data.character && typeof ch !== 'undefined') {
      Object.assign(ch, data.character);
      if (typeof renderAv === 'function') {
        ['mini-av-svg','profile-av-svg','profile-av-svg-mob'].forEach(id => renderAv(id));
      }
    }

    // ── 3. Flashcards ──
    const cards = Array.isArray(data.cards) ? data.cards : [];
    localStorage.setItem('ef_cards', JSON.stringify(cards));
    // Update variabel global cards jika ada
    if (typeof window.cards !== 'undefined') window.cards = cards;
    if (typeof window._refreshFlashCards === 'function') window._refreshFlashCards();

    // ── 4. Agenda ──
    const agenda = (data.agenda && typeof data.agenda === 'object') ? data.agenda : {};
    localStorage.setItem('edufun_agenda_v1', JSON.stringify(agenda));
    if (typeof AgendaSystem !== 'undefined' && AgendaSystem.refresh) AgendaSystem.refresh();

    // ── 5. Streak ──
    const streak = data.streak || { days: [], lastShown: null };
    if (!Array.isArray(streak.days)) streak.days = [];
    localStorage.setItem('ef_streak_data', JSON.stringify(streak));
    if (typeof StreakSystem !== 'undefined') {
      StreakSystem.updateAllStreakUI(StreakSystem.calcStreak(streak.days));
    }

    // ── 6. Stats (XP, Level, Streak count, dll) ──
    const stats = data.stats || {};
    _applyStatsToApp(stats);

    // ── 7. XP History & Activity Logs ──
    if (Array.isArray(data.xpHistory))
      localStorage.setItem('ef_xp_history', JSON.stringify(data.xpHistory));
    if (Array.isArray(data.activityLogs))
      localStorage.setItem('edufun_activity_logs', JSON.stringify(data.activityLogs));
  }

  // ─────────────────────────────────────────────
  // APPLY STATS: terapkan stats ke DOM & localStorage
  // ─────────────────────────────────────────────
  function _applyStatsToApp(stats) {
    // XP & Level
    const xpVal    = stats.xp    != null ? stats.xp    : 0;
    const levelVal = stats.level != null ? stats.level : 1;
    if (typeof xp    !== 'undefined') xp    = xpVal;
    if (typeof level !== 'undefined') level = levelVal;
    const pct = Math.min(100, Math.round(xpVal / 10));
    _setEl('xp-bar-top',    el => el.style.width = pct + '%');
    _setEl('xp-top-lbl',    el => el.textContent = xpVal);
    _setEl('lvl-badge',     el => el.textContent = levelVal);
    _setEl('mob-xp-lbl',    el => el.textContent = xpVal);
    _setEl('mob-lvl-badge', el => el.textContent = levelVal);
    _setEl('mob-xp-bar',    el => el.style.width = pct + '%');
    if (typeof userRole !== 'undefined') {
      const label = (userRole === 'guru' ? 'Guru' : 'Siswa') + ' · Level ' + levelVal;
      _setEl('pd-role',     el => el.textContent = label);
      _setEl('pd-role-mob', el => el.textContent = label);
    }

    // Streak count
    const sv = stats.streakCount != null ? stats.streakCount : 0;
    if (typeof streak !== 'undefined') streak = sv;
    ['streak-lbl','mob-streak-lbl','home-streak-num','p-streak-lbl'].forEach(id =>
      _setEl(id, el => el.textContent = sv));

    // Pomodoro today
    const pomoToday = stats.pomodoroToday != null ? stats.pomodoroToday : 0;
    if (typeof pSessions !== 'undefined') pSessions = pomoToday;
    _setEl('p-sessions',  el => el.textContent = pomoToday);
    _setEl('h-pomo-stat', el => el.textContent = pomoToday + ' sesi hari ini');

    // Flash card count
    if (stats.flashCardCount != null)
      _setEl('h-flash-stat', el => el.textContent = stats.flashCardCount + ' kartu');

    // Battle XP leaderboard
    if (stats.battleXP != null)
      _setEl('lb-my-xp', el => el.textContent = stats.battleXP);

    // ── Simpan ke localStorage agar render widget bekerja ──
    localStorage.setItem('ef_stat_arena', JSON.stringify({
      total:     stats.battleTotal     ?? 0,
      wins:      stats.battleWins      ?? 0,
      lastTs:    stats.lastBattleTs    ?? null,
      lastMapel: (stats.lastBattleMapel || stats.lastBattleSubj) ?? null,
    }));

    localStorage.setItem('ef_stat_materi', JSON.stringify({
      total:     stats.materiTotal     ?? 0,
      lastMapel: stats.lastMateriMapel ?? null,
      lastBab:   stats.lastMateriBab   ?? null,
      lastTs:    stats.lastMateriTs    ?? null,
    }));
    // Update pomo lastTs untuk render
    if (typeof window._lastMateriTs === 'undefined' || stats.lastMateriTs) {
      window._lastMateriTs = stats.lastMateriTs || null;
    }

    const today = new Date().toDateString();
    localStorage.setItem('ef_stat_pomo', JSON.stringify({
      total:      stats.pomodoroTotal    ?? 0,
      todayDate:  stats.lastPomoDate === today ? today : null,
      todayCount: stats.lastPomoDate === today ? (stats.pomodoroToday    || 0) : 0,
      todayMnt:   stats.lastPomoDate === today ? (stats.pomodoroTodayMnt || 0) : 0,
      lastTs:     stats.lastPomoTs    ?? null,
      lastMapel:  stats.lastPomoMapel ?? null,
    }));

    // Render semua widget stat
    if (typeof renderArenaStatWidget  === 'function') renderArenaStatWidget();
    if (typeof renderMateriStatWidget === 'function') renderMateriStatWidget();
    if (typeof renderPomoStatWidget   === 'function') renderPomoStatWidget();

    // Mapel progress bars
    if (stats.mapelProgress && typeof stats.mapelProgress === 'object') {
      document.querySelectorAll('[data-prog]').forEach(wrap => {
        const pf  = wrap.querySelector('.pf');
        const lbl = wrap.querySelector('.prog-lbl');
        if (pf)  pf.style.width  = '0%';
        if (lbl) lbl.textContent = '—';
      });
      Object.keys(stats.mapelProgress).forEach(m => {
        const val = Math.min(100, stats.mapelProgress[m] || 0);
        document.querySelectorAll('[data-prog="' + m + '"]').forEach(wrap => {
          const pf  = wrap.querySelector('.pf');
          const lbl = wrap.querySelector('.prog-lbl');
          if (pf)  pf.style.width  = val + '%';
          if (lbl) lbl.textContent = val > 0 ? val + ' mnt' : '—';
        });
      });
    }
  }

  // ─────────────────────────────────────────────
  // FLUSH: simpan semua data penting ke Firestore SEKARANG (tanpa debounce)
  // Dipanggil sebelum navigasi halaman / unload
  // ─────────────────────────────────────────────
  function flushAll() {
    if (!_uid) return;

    // Cancel semua debounce timer yang pending
    Object.keys(_timers).forEach(k => clearTimeout(_timers[k]));

    // Kumpulkan semua data dari localStorage dan tulis ke Firestore sekarang
    const writes = {};

    // XP & Level dari variabel global app
    const xpVal    = (typeof xp    !== 'undefined') ? xp    : null;
    const levelVal = (typeof level !== 'undefined') ? level : null;
    if (xpVal !== null) writes['stats.xp']    = xpVal;
    if (levelVal !== null) writes['stats.level'] = levelVal;

    // Activity logs
    try {
      const logs = JSON.parse(localStorage.getItem('edufun_activity_logs') || '[]');
      if (logs.length > 0) writes['activityLogs'] = logs.slice(-1000);
    } catch(e) {}

    // XP history
    try {
      const xpH = JSON.parse(localStorage.getItem('ef_xp_history') || '[]');
      if (xpH.length > 0) writes['xpHistory'] = xpH.slice(-500);
    } catch(e) {}

    // Streak
    try {
      const sd = JSON.parse(localStorage.getItem('ef_streak_data') || 'null');
      if (sd) writes['streak'] = sd;
    } catch(e) {}

    // Accent
    try {
      const ac = localStorage.getItem('ef_ac');
      if (ac) writes['accent'] = ac;
    } catch(e) {}

    // Cards
    try {
      const cards = JSON.parse(localStorage.getItem('ef_cards') || 'null');
      if (cards) writes['cards'] = cards;
    } catch(e) {}

    // Stat arena
    try {
      const arena = JSON.parse(localStorage.getItem('ef_stat_arena') || 'null');
      if (arena) {
        writes['stats.battleTotal']     = arena.total     || 0;
        writes['stats.battleWins']      = arena.wins      || 0;
        writes['stats.lastBattleTs']    = arena.lastTs    || null;
        writes['stats.lastBattleMapel'] = arena.lastMapel || null;
      }
    } catch(e) {}

    // Stat materi
    try {
      const materi = JSON.parse(localStorage.getItem('ef_stat_materi') || 'null');
      if (materi) {
        writes['stats.materiTotal']     = materi.total     || 0;
        writes['stats.lastMateriMapel'] = materi.lastMapel || null;
        writes['stats.lastMateriBab']   = materi.lastBab   || null;
        writes['stats.lastMateriTs']    = materi.lastTs    || null;
      }
    } catch(e) {}

    // Stat pomo
    try {
      const pomo = JSON.parse(localStorage.getItem('ef_stat_pomo') || 'null');
      if (pomo) {
        writes['stats.pomodoroTotal']    = pomo.total      || 0;
        writes['stats.pomodoroToday']    = pomo.todayCount || 0;
        writes['stats.pomodoroTodayMnt'] = pomo.todayMnt   || 0;
        if (pomo.todayDate)  writes['stats.lastPomoDate']  = pomo.todayDate;
        if (pomo.lastTs)     writes['stats.lastPomoTs']    = pomo.lastTs;
        if (pomo.lastMapel)  writes['stats.lastPomoMapel'] = pomo.lastMapel;
      }
    } catch(e) {}

    // Kirim semua sekaligus dengan dot-notation fields
    if (Object.keys(writes).length === 0) return;

    // Pisahkan stats fields dari top-level fields
    const statsObj = {};
    const topObj = {};
    Object.keys(writes).forEach(k => {
      if (k.startsWith('stats.')) {
        statsObj[k.slice(6)] = writes[k];
      } else {
        topObj[k] = writes[k];
      }
    });

    const batch = fbDB.batch();
    const ref = fbDB.collection('userdata').doc(_uid);
    if (Object.keys(statsObj).length > 0) {
      batch.set(ref, { stats: statsObj }, { merge: true });
    }
    if (Object.keys(topObj).length > 0) {
      batch.set(ref, topObj, { merge: true });
    }
    batch.commit().catch(e => console.warn('[FirebaseSync] flushAll error:', e));
    console.log('[FirebaseSync] flushAll — data disimpan ke Firestore');
  }


  function stop() {
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    _uid   = null;
    _ready = false;
    console.log('[FirebaseSync] Stopped');
  }

  // ─────────────────────────────────────────────
  // WRITE HELPERS
  // ─────────────────────────────────────────────
  const _timers = {};
  function _debounce(key, fn, delay = 1500) {
    clearTimeout(_timers[key]);
    _timers[key] = setTimeout(fn, delay);
  }

  async function _setField(field, value) {
    if (!_uid) return;
    try {
      await fbDB.collection('userdata').doc(_uid).set({ [field]: value }, { merge: true });
    } catch (e) { console.warn('[FirebaseSync] save error:', field, e); }
  }

  async function _mergeStats(partial) {
    if (!_uid) return;
    try {
      await fbDB.collection('userdata').doc(_uid).set({ stats: partial }, { merge: true });
    } catch (e) { console.warn('[FirebaseSync] mergeStats error:', e); }
  }

  // ─────────────────────────────────────────────
  // PUBLIC SAVE METHODS
  // ─────────────────────────────────────────────

  // Baca streak dari Firestore (untuk StreakSystem.checkAndShow)
  async function getStreakFromFirestore() {
    if (!_uid) return { days: [], lastShown: null };
    try {
      const doc = await fbDB.collection('userdata').doc(_uid).get();
      if (!doc.exists) return { days: [], lastShown: null };
      const d = doc.data().streak;
      if (!d || typeof d !== 'object') return { days: [], lastShown: null };
      return { days: Array.isArray(d.days) ? d.days : [], lastShown: d.lastShown || null };
    } catch (e) {
      try { return JSON.parse(localStorage.getItem('ef_streak_data')) || { days: [], lastShown: null }; }
      catch { return { days: [], lastShown: null }; }
    }
  }

  function saveStreak(streakData) {
    localStorage.setItem('ef_streak_data', JSON.stringify(streakData));
    _debounce('streak', () => _setField('streak', streakData), 500);
  }

  function saveCards(cards) {
    _debounce('cards', () => _setField('cards', cards));
    saveStatsField('flashCardCount', Array.isArray(cards) ? cards.length : 0);
  }

  function saveAgenda(agendaDB) {
    _debounce('agenda', () => _setField('agenda', agendaDB));
  }

  function saveAccent(hex) {
    _debounce('accent', () => _setField('accent', hex), 2000);
  }

  function saveCharacter(charData) {
    _debounce('character', () => _setField('character', charData), 500);
  }

  function saveStats(statsObj) {
    _debounce('stats', () => _setField('stats', statsObj));
  }

  function saveStatsField(field, value) {
    _debounce('stats_' + field, () => _mergeStats({ [field]: value }), 1500);
  }

  function saveXPLevel(xpVal, levelVal) {
    _debounce('xp_level', async () => {
      if (!_uid) return;
      try {
        await fbDB.collection('users').doc(_uid).update({ xp: xpVal, level: levelVal });
        await fbDB.collection('userdata').doc(_uid).set({ stats: { xp: xpVal, level: levelVal } }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] saveXPLevel:', e); }
    }, 2000);
  }

  function onPomodoroComplete() {
    const today = new Date().toISOString().split('T')[0];
    _debounce('pomo_complete', async () => {
      if (!_uid) return;
      try {
        const snap = await fbDB.collection('userdata').doc(_uid).get();
        const existing = (snap.exists && snap.data().stats) ? snap.data().stats : {};
        const pomodoroToday    = existing.lastPomoDate === today ? (existing.pomodoroToday || 0) + 1 : 1;
        const pomodoroTotal    = (existing.pomodoroTotal || 0) + 1;
        const pomodoroTodayMnt = (existing.lastPomoDate === today ? (existing.pomodoroTodayMnt || 0) : 0)
                                 + (typeof pWork !== 'undefined' ? pWork : 25);
        const lastPomoMapel    = (typeof currentPomoMapel !== 'undefined' && currentPomoMapel)
                                 ? currentPomoMapel : (window._lastPomoMapel || null);
        await fbDB.collection('userdata').doc(_uid).set({
          stats: { pomodoroToday, pomodoroTotal, pomodoroTodayMnt, lastPomoDate: today,
                   lastPomoTs: Date.now(), lastPomoMapel: lastPomoMapel }
        }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] onPomodoroComplete:', e); }
    }, 300);
  }

  function onBattleResult(won, xpGained) {
    _debounce('battle_result', async () => {
      if (!_uid) return;
      try {
        const inc = firebase.firestore.FieldValue.increment;
        await fbDB.collection('userdata').doc(_uid).set({
          stats: {
            battleTotal:     inc(1),
            battleWins:      inc(won ? 1 : 0),
            battleXP:        inc(xpGained || 0),
            lastBattleTs:    Date.now(),
            lastBattleMapel: (window._btSubj) ? window._btSubj : null,
          }
        }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] onBattleResult:', e); }
    }, 300);
  }

  function onFlashStudyDone(correct, total) {
    _debounce('flash_study', async () => {
      if (!_uid) return;
      try {
        const inc = firebase.firestore.FieldValue.increment;
        await fbDB.collection('userdata').doc(_uid).set({
          stats: { flashStudySessions: inc(1), flashCorrect: inc(correct||0), flashTotal: inc(total||0) }
        }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] onFlashStudyDone:', e); }
    }, 300);
  }

  function saveMapelProgress(mapel, pct) {
    _debounce('mapel_' + mapel, async () => {
      if (!_uid) return;
      try {
        await fbDB.collection('userdata').doc(_uid).set(
          { stats: { mapelProgress: { [mapel]: pct } } }, { merge: true }
        );
      } catch (e) { console.warn('[FirebaseSync] saveMapelProgress:', e); }
    }, 2000);
  }

  function onMateriOpen(mapel, bab) {
    // Langsung write tanpa debounce — karena setelah ini halaman bisa pindah
    if (!_uid) return;
    const inc = firebase.firestore.FieldValue.increment;
    fbDB.collection('userdata').doc(_uid).set({
      stats: { materiTotal: inc(1), lastMateriMapel: mapel||null, lastMateriBab: bab||null, lastMateriTs: Date.now() }
    }, { merge: true }).catch(e => console.warn('[FirebaseSync] onMateriOpen:', e));
  }

  function saveXPHistory(logs) {
    if (!Array.isArray(logs)) return;
    _debounce('xp_history', () => _setField('xpHistory', logs.slice(-500)), 3000);
  }

  function saveActivityLog(logs) {
    if (!Array.isArray(logs)) return;
    _debounce('activity_logs', () => _setField('activityLogs', logs.slice(-1000)), 3000);
  }

  // ─────────────────────────────────────────────
  // UTILS
  // ─────────────────────────────────────────────
  function _setEl(id, fn) {
    const el = document.getElementById(id);
    if (el) try { fn(el); } catch(e) {}
  }

  function isReady() { return _ready; }

  return {
    init, stop, isReady, flushAll,
    saveCards, saveAgenda, saveStreak, saveAccent,
    saveCharacter, saveStats, saveStatsField, saveXPLevel,
    saveXPHistory, saveActivityLog, saveMapelProgress,
    onPomodoroComplete, onBattleResult, onFlashStudyDone, onMateriOpen,
    getStreakFromFirestore,
  };
})();
