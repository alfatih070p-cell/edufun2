// ===========================
// EduFun — firebase-sync.js (v2 — Realtime)
// Sync SEMUA data user ke Firestore dengan onSnapshot (realtime)
// Data: flashcards, agenda, streak, accent, karakter, stats
// ===========================

const FirebaseSync = (() => {

  let _uid = null;
  let _unsubscribe = null;   // listener realtime
  let _ready = false;

  // ============================================================
  // INIT — dipanggil setelah user login
  // ============================================================
  function init() {
    const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
    if (!session || !session.uid) return;
    _uid = session.uid;

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

    if (data.cards != null) {
      localStorage.setItem('ef_cards', JSON.stringify(data.cards));
      if (typeof window._refreshFlashCards === 'function') window._refreshFlashCards();
    }

    if (data.agenda != null) {
      localStorage.setItem('edufun_agenda_v1', JSON.stringify(data.agenda));
      if (typeof AgendaSystem !== 'undefined' && AgendaSystem.refresh) AgendaSystem.refresh();
    }

    if (data.streak != null) {
      localStorage.setItem('ef_streak_data', JSON.stringify(data.streak));
    }

    if (data.accent != null) {
      if (typeof applyAc === 'function') applyAc(data.accent);
    }

    if (data.character != null && typeof ch !== 'undefined') {
      Object.assign(ch, data.character);
      if (typeof renderAv === 'function') {
        ['mini-av-svg','profile-av-svg','profile-av-svg-mob'].forEach(id => renderAv(id));
      }
    }

    if (data.stats != null) _applyStats(data.stats);

    // Restore XP history & activity logs from Firestore → localStorage
    if (data.xpHistory != null) {
      localStorage.setItem('ef_xp_history', JSON.stringify(data.xpHistory));
    }
    if (data.activityLogs != null) {
      localStorage.setItem('edufun_activity_logs', JSON.stringify(data.activityLogs));
    }

    _ready = true;
  }

  // ============================================================
  // APPLY STATS → update variabel global + semua UI
  // ============================================================
  function _applyStats(stats) {
    if (stats.xp != null && typeof xp !== 'undefined') {
      xp    = stats.xp;
      level = stats.level || 1;
      const pct = Math.min(100, Math.round(xp / 10));
      _setEl('xp-bar-top',    el => el.style.width = pct + '%');
      _setEl('xp-top-lbl',    el => el.textContent = xp);
      _setEl('lvl-badge',     el => el.textContent = level);
      _setEl('mob-xp-lbl',    el => el.textContent = xp);
      _setEl('mob-lvl-badge', el => el.textContent = level);
      _setEl('mob-xp-bar',    el => el.style.width = pct + '%');
      if (typeof userRole !== 'undefined') {
        const label = (userRole === 'guru' ? 'Guru' : 'Siswa') + ' · Level ' + level;
        _setEl('pd-role',     el => el.textContent = label);
        _setEl('pd-role-mob', el => el.textContent = label);
      }
    }

    if (stats.streakCount != null) {
      if (typeof streak !== 'undefined') streak = stats.streakCount;
      ['streak-lbl','mob-streak-lbl','home-streak-num','p-streak-lbl'].forEach(id =>
        _setEl(id, el => el.textContent = stats.streakCount));
    }

    if (stats.pomodoroToday != null) {
      if (typeof pSessions !== 'undefined') pSessions = stats.pomodoroToday;
      _setEl('p-sessions',  el => el.textContent = stats.pomodoroToday);
      _setEl('h-pomo-stat', el => el.textContent = stats.pomodoroToday + ' sesi hari ini');
    }

    if (stats.flashCardCount != null) {
      _setEl('h-flash-stat', el => el.textContent = stats.flashCardCount + ' kartu');
    }

    if (stats.mapelProgress != null) {
      const prog = stats.mapelProgress;
      Object.keys(prog).forEach(m => {
        const val = Math.min(100, prog[m] || 0);
        document.querySelectorAll('[data-prog="' + m + '"]').forEach(wrap => {
          const pf  = wrap.querySelector('.pf');
          const lbl = wrap.querySelector('.prog-lbl');
          if (pf)  pf.style.width   = val + '%';
          if (lbl) lbl.textContent  = val + '%';
        });
      });
    }

    if (stats.battleXP != null) {
      _setEl('lb-my-xp', el => el.textContent = stats.battleXP);
    }

    // ── Sync ke 3 widget stat baru ──
    if (stats.battleTotal != null || stats.battleWins != null) {
      const d = JSON.parse(localStorage.getItem('ef_stat_arena') || '{}');
      if (stats.battleTotal != null) d.total = stats.battleTotal;
      if (stats.battleWins  != null) d.wins  = stats.battleWins;
      if (stats.lastBattleTs    != null) d.lastTs    = stats.lastBattleTs;
      if (stats.lastBattleMapel != null) d.lastMapel = stats.lastBattleMapel;
      localStorage.setItem('ef_stat_arena', JSON.stringify(d));
      if (typeof renderArenaStatWidget === 'function') renderArenaStatWidget();
    }

    if (stats.materiTotal != null) {
      const d = JSON.parse(localStorage.getItem('ef_stat_materi') || '{}');
      d.total     = stats.materiTotal;
      d.lastMapel = stats.lastMateriMapel || d.lastMapel || null;
      d.lastBab   = stats.lastMateriBab   || d.lastBab   || null;
      d.lastTs    = stats.lastMateriTs    || d.lastTs    || null;
      localStorage.setItem('ef_stat_materi', JSON.stringify(d));
      if (typeof renderMateriStatWidget === 'function') renderMateriStatWidget();
    }

    if (stats.pomodoroTotal != null || stats.pomodoroToday != null) {
      const today = new Date().toDateString();
      const d = JSON.parse(localStorage.getItem('ef_stat_pomo') || '{}');
      if (stats.pomodoroTotal != null) d.total = stats.pomodoroTotal;
      if (stats.lastPomoDate === today) {
        d.todayDate  = today;
        d.todayCount = stats.pomodoroToday || 0;
        d.todayMnt   = stats.pomodoroTodayMnt || 0;
      }
      localStorage.setItem('ef_stat_pomo', JSON.stringify(d));
      if (typeof renderPomoStatWidget === 'function') renderPomoStatWidget();
    }
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
    _uid = null; _ready = false;
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
