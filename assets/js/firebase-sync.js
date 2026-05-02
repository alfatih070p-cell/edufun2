// ===========================
// EduFun — firebase-sync.js (v2 — Realtime)
// Sync SEMUA data user ke Firestore dengan onSnapshot (realtime)
// Data: flashcards, agenda, streak, accent, karakter, stats
// ===========================

const FirebaseSync = (() => {

  let _uid = null;
  let _unsubscribe = null;   // listener realtime
  let _ready = false;
  let _isFirstLoad = true;   // true sebelum snapshot pertama diterima

  // ============================================================
  // INIT — dipanggil setelah user login
  // ============================================================
  function init() {
    const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
    if (!session || !session.uid) return;

    // Kalau UID berubah (ganti akun), bersihkan data user lama dulu
    // sebelum load data user baru dari Firestore
    if (_uid && _uid !== session.uid) {
      if (typeof Auth !== 'undefined' && Auth.clearUserStorage) Auth.clearUserStorage();
    }

    _uid = session.uid;
    _isFirstLoad = true;
    _ready = false;
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    _startRealtimeListener();
  }

  // ============================================================
  // REALTIME LISTENER
  // ============================================================
  function _startRealtimeListener() {
    if (!_uid) return;
    _unsubscribe = fbDB.collection('userdata').doc(_uid)
      .onSnapshot({ includeMetadataChanges: false }, (doc) => {
        if (!doc.exists) return;
        _applyToApp(doc.data());
      }, (err) => {
        console.warn('[FirebaseSync] listener error:', err);
      });
    console.log('[FirebaseSync] Realtime listener started ✓');
  }

  // ============================================================
  // APPLY DATA → ke localStorage + trigger re-render UI
  // ============================================================
  function _applyToApp(data) {
    if (!data) return;

    // Cards — SELALU overwrite dari Firestore
    const cardsData = Array.isArray(data.cards) ? data.cards : [];
    localStorage.setItem('ef_cards', JSON.stringify(cardsData));
    if (typeof window._refreshFlashCards === 'function') window._refreshFlashCards();

    // Agenda — overwrite dari Firestore jika field ada.
    // Kalau 'agenda' tidak ada di Firestore (user yang belum pernah save),
    // JANGAN hapus data lokal — mungkin user sudah input tapi belum tersync.
    if (data.agenda != null) {
      const agendaData = (typeof data.agenda === 'object') ? data.agenda : {};
      localStorage.setItem('edufun_agenda_v1', JSON.stringify(agendaData));
      if (typeof AgendaSystem !== 'undefined' && AgendaSystem.refresh) AgendaSystem.refresh();
    } else if (_isFirstLoad) {
      // User baru / belum punya agenda di Firestore → bersihkan sisa user lama
      localStorage.removeItem('edufun_agenda_v1');
      if (typeof AgendaSystem !== 'undefined' && AgendaSystem.refresh) AgendaSystem.refresh();
    }

    // Streak — overwrite dari Firestore. Kalau field tidak ada (user lama),
    // jangan hapus data lokal — bisa jadi user sudah check-in tapi Firestore belum sync.
    if (data.streak != null) {
      const streakData = (typeof data.streak === 'object') ? data.streak : {};
      if (!Array.isArray(streakData.days)) streakData.days = [];
      // Pastikan lastShown selalu ada
      if (!streakData.lastShown) streakData.lastShown = null;
      localStorage.setItem('ef_streak_data', JSON.stringify(streakData));
    } else if (_isFirstLoad) {
      // Ganti akun: hapus streak lama supaya tidak bercampur
      localStorage.setItem('ef_streak_data', JSON.stringify({ days: [], lastShown: null }));
    }

    if (data.accent != null) {
      // Firestore punya warna → terapkan
      localStorage.setItem('ef_ac', data.accent);
      if (typeof applyAc === 'function') applyAc(data.accent);
    } else if (_isFirstLoad) {
      // User baru / belum pernah simpan accent → terapkan default HANYA jika
      // ini ganti akun (sehingga warna lama user sebelumnya dibersihkan)
      localStorage.removeItem('ef_ac');
      if (typeof applyAc === 'function') applyAc('#3b82f6');
    }
    // Kalau accent null tapi BUKAN firstLoad: pertahankan warna yang sudah aktif

    if (data.character != null && typeof ch !== 'undefined') {
      Object.assign(ch, data.character);
      if (typeof renderAv === 'function') {
        ['mini-av-svg','profile-av-svg','profile-av-svg-mob'].forEach(id => renderAv(id));
      }
    }

    if (data.stats != null) _applyStats(data.stats);

    // Restore XP history & activity logs dari Firestore
    // Overwrite hanya kalau Firestore punya data (tidak null)
    // Ganti akun (isFirstLoad) → selalu bersihkan data lama
    if (data.xpHistory != null) {
      localStorage.setItem('ef_xp_history', JSON.stringify(Array.isArray(data.xpHistory) ? data.xpHistory : []));
    } else if (_isFirstLoad) {
      localStorage.setItem('ef_xp_history', JSON.stringify([]));
    }
    if (data.activityLogs != null) {
      localStorage.setItem('edufun_activity_logs', JSON.stringify(Array.isArray(data.activityLogs) ? data.activityLogs : []));
    } else if (_isFirstLoad) {
      localStorage.setItem('edufun_activity_logs', JSON.stringify([]));
    }

    _isFirstLoad = false;
    _ready = true;
  }

  // ============================================================
  // APPLY STATS → update variabel global + semua UI
  // Overwrite dari Firestore, tapi SKIP field yang null/undefined
  // supaya data widget tidak terhapus kalau belum tersimpan ke Firestore.
  // ============================================================
  function _applyStats(stats) {
    // ── XP & Level ──
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

    // ── Streak ──
    const streakVal = stats.streakCount != null ? stats.streakCount : 0;
    if (typeof streak !== 'undefined') streak = streakVal;
    ['streak-lbl','mob-streak-lbl','home-streak-num','p-streak-lbl'].forEach(id =>
      _setEl(id, el => el.textContent = streakVal));

    // ── Pomodoro today ──
    const pomoToday = stats.pomodoroToday != null ? stats.pomodoroToday : 0;
    if (typeof pSessions !== 'undefined') pSessions = pomoToday;
    _setEl('p-sessions',  el => el.textContent = pomoToday);
    _setEl('h-pomo-stat', el => el.textContent = pomoToday + ' sesi hari ini');

    // ── Flash card count ──
    if (stats.flashCardCount != null)
      _setEl('h-flash-stat', el => el.textContent = stats.flashCardCount + ' kartu');

    // ── Mapel progress bars ──
    const prog = stats.mapelProgress || {};
    // Reset semua bar dulu ke 0 supaya tidak ada sisa user lama
    document.querySelectorAll('[data-prog]').forEach(wrap => {
      const pf  = wrap.querySelector('.pf');
      const lbl = wrap.querySelector('.prog-lbl');
      if (pf)  pf.style.width  = '0%';
      if (lbl) lbl.textContent = '—';
    });
    Object.keys(prog).forEach(m => {
      const val = Math.min(100, prog[m] || 0);
      document.querySelectorAll('[data-prog="' + m + '"]').forEach(wrap => {
        const pf  = wrap.querySelector('.pf');
        const lbl = wrap.querySelector('.prog-lbl');
        if (pf)  pf.style.width  = val + '%';
        if (lbl) lbl.textContent = val > 0 ? val + ' mnt' : '—';
      });
    });

    // ── Battle XP leaderboard ──
    if (stats.battleXP != null)
      _setEl('lb-my-xp', el => el.textContent = stats.battleXP);

    // ── Arena stat widget — overwrite hanya kalau Firestore punya data ──
    if (stats.battleTotal != null || stats.battleWins != null) {
      const arenaData = {
        total:     stats.battleTotal     != null ? stats.battleTotal     : 0,
        wins:      stats.battleWins      != null ? stats.battleWins      : 0,
        lastTs:    stats.lastBattleTs    != null ? stats.lastBattleTs    : null,
        lastMapel: stats.lastBattleMapel != null ? stats.lastBattleMapel : null,
      };
      localStorage.setItem('ef_stat_arena', JSON.stringify(arenaData));
    }
    if (typeof renderArenaStatWidget === 'function') renderArenaStatWidget();

    // ── Materi stat widget — overwrite hanya kalau Firestore punya data ──
    if (stats.materiTotal != null || stats.lastMateriTs != null) {
      const materiData = {
        total:     stats.materiTotal     != null ? stats.materiTotal     : 0,
        lastMapel: stats.lastMateriMapel != null ? stats.lastMateriMapel : null,
        lastBab:   stats.lastMateriBab   != null ? stats.lastMateriBab   : null,
        lastTs:    stats.lastMateriTs    != null ? stats.lastMateriTs    : null,
      };
      localStorage.setItem('ef_stat_materi', JSON.stringify(materiData));
    }
    if (typeof renderMateriStatWidget === 'function') renderMateriStatWidget();

    // ── Pomo stat widget — overwrite hanya kalau Firestore punya data ──
    if (stats.pomodoroTotal != null || stats.pomodoroToday != null) {
      const today = new Date().toDateString();
      const pomoData = {
        total:      stats.pomodoroTotal    != null ? stats.pomodoroTotal    : 0,
        todayDate:  stats.lastPomoDate     === today ? today : null,
        todayCount: stats.lastPomoDate     === today ? (stats.pomodoroToday    || 0) : 0,
        todayMnt:   stats.lastPomoDate     === today ? (stats.pomodoroTodayMnt || 0) : 0,
      };
      localStorage.setItem('ef_stat_pomo', JSON.stringify(pomoData));
    }
    if (typeof renderPomoStatWidget === 'function') renderPomoStatWidget();
  }

  // ============================================================
  // DEBOUNCE SAVE HELPERS
  // ============================================================
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

  function saveCards(cards) {
    _debounce('cards', () => _setField('cards', cards));
    saveStatsField('flashCardCount', Array.isArray(cards) ? cards.length : 0);
  }

  function saveAgenda(agendaDB) {
    _debounce('agenda', () => _setField('agenda', agendaDB));
  }

  function saveStreak(streakData) {
    _debounce('streak', () => _setField('streak', streakData));
  }

  function saveAccent(hex) {
    _debounce('accent', () => _setField('accent', hex), 3000);
  }

  function saveCharacter(charData) {
    _debounce('character', () => _setField('character', charData), 500);
  }

  function saveStats(statsObj) {
    _debounce('stats', () => _setField('stats', statsObj));
  }

  function saveStatsField(field, value) {
    _debounce('stats_' + field, async () => {
      if (!_uid) return;
      try {
        await fbDB.collection('userdata').doc(_uid).set(
          { stats: { [field]: value } }, { merge: true }
        );
      } catch (e) { console.warn('[FirebaseSync] saveStatsField:', field, e); }
    }, 1500);
  }

  function saveXPLevel(xpVal, levelVal) {
    _debounce('xp_level', async () => {
      if (!_uid) return;
      try {
        await fbDB.collection('users').doc(_uid).update({ xp: xpVal, level: levelVal });
        await fbDB.collection('userdata').doc(_uid).set(
          { stats: { xp: xpVal, level: levelVal } }, { merge: true }
        );
      } catch (e) { console.warn('[FirebaseSync] saveXPLevel:', e); }
    }, 2000);
  }

  function onPomodoroComplete() {
    const today = new Date().toISOString().split('T')[0];
    _debounce('pomo_complete', async () => {
      if (!_uid) return;
      try {
        const docRef = fbDB.collection('userdata').doc(_uid);
        const snap = await docRef.get();
        const existing = (snap.exists && snap.data().stats) ? snap.data().stats : {};
        const pomodoroToday = existing.lastPomoDate === today ? (existing.pomodoroToday || 0) + 1 : 1;
        const pomodoroTotal = (existing.pomodoroTotal || 0) + 1;
        const pomodoroTodayMnt = (existing.lastPomoDate === today ? (existing.pomodoroTodayMnt || 0) : 0) + (typeof pWork !== 'undefined' ? pWork : 25);
        await docRef.set({ stats: { pomodoroToday, pomodoroTotal, pomodoroTodayMnt, lastPomoDate: today } }, { merge: true });
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
            battleTotal:      inc(1),
            battleWins:       inc(won ? 1 : 0),
            battleXP:         inc(xpGained || 0),
            lastBattleTs:     Date.now(),
            lastBattleMapel:  (typeof window !== 'undefined' && window._btSubj) ? window._btSubj : null,
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
          stats: {
            flashStudySessions: inc(1),
            flashCorrect: inc(correct || 0),
            flashTotal:   inc(total   || 0),
          }
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
    _debounce('materi_open', async () => {
      if (!_uid) return;
      try {
        const inc = firebase.firestore.FieldValue.increment;
        const today = new Date().toISOString().split('T')[0];
        await fbDB.collection('userdata').doc(_uid).set({
          stats: {
            materiTotal:     inc(1),
            lastMateriMapel: mapel || null,
            lastMateriBab:   bab   || null,
            lastMateriTs:    Date.now(),
          }
        }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] onMateriOpen:', e); }
    }, 300);
  }


  // ── Save XP history log to Firestore ──────────────────────
  function saveXPHistory(logs) {
    if (!Array.isArray(logs)) return;
    // Keep last 500 entries
    const trimmed = logs.slice(-500);
    _debounce('xp_history', () => _setField('xpHistory', trimmed), 3000);
  }

  // ── Save activity logs to Firestore ───────────────────────
  function saveActivityLog(logs) {
    if (!Array.isArray(logs)) return;
    // Keep last 1000 entries
    const trimmed = logs.slice(-1000);
    _debounce('activity_logs', () => _setField('activityLogs', trimmed), 3000);
  }

  function stop() {
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    _uid = null; _ready = false; _isFirstLoad = true;
  }

  function _setEl(id, fn) {
    const el = document.getElementById(id);
    if (el) try { fn(el); } catch(e) {}
  }

  function isReady() { return _ready; }

  return {
    init, stop, isReady, saveXPHistory, saveActivityLog,
    saveCards, saveAgenda, saveStreak, saveAccent,
    saveCharacter, saveStats, saveStatsField, saveXPLevel,
    onPomodoroComplete, onBattleResult, onFlashStudyDone, saveMapelProgress, onMateriOpen,
  };
})();
