// ===========================
// EduFun — firebase-sync.js (v3 — Firestore as Source of Truth)
// localStorage hanya dipakai sebagai CACHE RENDER sementara.
// Semua read/write data utama langsung ke Firestore.
// ===========================

const FirebaseSync = (() => {

  let _uid = null;
  let _unsubscribe = null;
  let _ready = false;
  let _isNewUid = false;

  function init() {
    const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
    if (!session || !session.uid) return;

    _isNewUid = (_uid !== null && _uid !== session.uid);
    _uid = session.uid;
    _ready = false;

    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }

    if (_isNewUid) {
      if (typeof Auth !== 'undefined' && Auth.clearUserStorage) Auth.clearUserStorage();
    }

    _startRealtimeListener();
  }

  function _startRealtimeListener() {
    if (!_uid) return;
    _unsubscribe = fbDB.collection('userdata').doc(_uid)
      .onSnapshot({ includeMetadataChanges: false }, (doc) => {
        const data = doc.exists ? doc.data() : {};
        _applyToApp(data);
        _ready = true;
        _isNewUid = false;
      }, (err) => {
        console.warn('[FirebaseSync] listener error:', err);
        _ready = true;
      });
    console.log('[FirebaseSync] Realtime listener started v3');
  }

  function _applyToApp(data) {
    if (!data) return;

    if (data.cards != null) {
      localStorage.setItem('ef_cards', JSON.stringify(Array.isArray(data.cards) ? data.cards : []));
      if (typeof window._refreshFlashCards === 'function') window._refreshFlashCards();
    }

    if (data.agenda != null) {
      localStorage.setItem('edufun_agenda_v1', JSON.stringify(
        typeof data.agenda === 'object' ? data.agenda : {}
      ));
      if (typeof AgendaSystem !== 'undefined' && AgendaSystem.refresh) AgendaSystem.refresh();
    }

    if (data.accent != null) {
      localStorage.setItem('ef_ac', data.accent);
      if (typeof applyAc === 'function') applyAc(data.accent);
    } else if (_isNewUid) {
      localStorage.removeItem('ef_ac');
      if (typeof applyAc === 'function') applyAc('#3b82f6');
    }

    if (data.character != null && typeof ch !== 'undefined') {
      Object.assign(ch, data.character);
      if (typeof renderAv === 'function') {
        ['mini-av-svg','profile-av-svg','profile-av-svg-mob'].forEach(id => renderAv(id));
      }
    }

    if (data.streak != null && typeof data.streak === 'object') {
      const sd = data.streak;
      if (!Array.isArray(sd.days)) sd.days = [];
      if (!sd.lastShown) sd.lastShown = null;
      localStorage.setItem('ef_streak_data', JSON.stringify(sd));
      if (typeof StreakSystem !== 'undefined') {
        StreakSystem.updateAllStreakUI(StreakSystem.calcStreak(sd.days));
      }
    }

    if (data.stats != null) _applyStats(data.stats);

    if (data.xpHistory != null)
      localStorage.setItem('ef_xp_history', JSON.stringify(Array.isArray(data.xpHistory) ? data.xpHistory : []));

    if (data.activityLogs != null)
      localStorage.setItem('edufun_activity_logs', JSON.stringify(Array.isArray(data.activityLogs) ? data.activityLogs : []));
  }

  function _applyStats(stats) {
    if (!stats) return;

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

    if (stats.streakCount != null) {
      const sv = stats.streakCount;
      if (typeof streak !== 'undefined') streak = sv;
      ['streak-lbl','mob-streak-lbl','home-streak-num','p-streak-lbl'].forEach(id =>
        _setEl(id, el => el.textContent = sv));
    }

    if (stats.pomodoroToday != null) {
      if (typeof pSessions !== 'undefined') pSessions = stats.pomodoroToday;
      _setEl('p-sessions',  el => el.textContent = stats.pomodoroToday);
      _setEl('h-pomo-stat', el => el.textContent = stats.pomodoroToday + ' sesi hari ini');
    }

    if (stats.flashCardCount != null)
      _setEl('h-flash-stat', el => el.textContent = stats.flashCardCount + ' kartu');

    if (stats.battleTotal != null || stats.battleWins != null) {
      localStorage.setItem('ef_stat_arena', JSON.stringify({
        total:     stats.battleTotal     ?? 0,
        wins:      stats.battleWins      ?? 0,
        lastTs:    stats.lastBattleTs    ?? null,
        lastMapel: stats.lastBattleMapel ?? null,
      }));
      if (typeof renderArenaStatWidget === 'function') renderArenaStatWidget();
    }

    if (stats.materiTotal != null || stats.lastMateriTs != null) {
      localStorage.setItem('ef_stat_materi', JSON.stringify({
        total:     stats.materiTotal     ?? 0,
        lastMapel: stats.lastMateriMapel ?? null,
        lastBab:   stats.lastMateriBab   ?? null,
        lastTs:    stats.lastMateriTs    ?? null,
      }));
      if (typeof renderMateriStatWidget === 'function') renderMateriStatWidget();
    }

    if (stats.pomodoroTotal != null || stats.pomodoroToday != null) {
      const today = new Date().toDateString();
      localStorage.setItem('ef_stat_pomo', JSON.stringify({
        total:      stats.pomodoroTotal    ?? 0,
        todayDate:  stats.lastPomoDate === today ? today : null,
        todayCount: stats.lastPomoDate === today ? (stats.pomodoroToday    || 0) : 0,
        todayMnt:   stats.lastPomoDate === today ? (stats.pomodoroTodayMnt || 0) : 0,
      }));
      if (typeof renderPomoStatWidget === 'function') renderPomoStatWidget();
    }

    if (stats.battleXP != null)
      _setEl('lb-my-xp', el => el.textContent = stats.battleXP);

    if (stats.mapelProgress && typeof stats.mapelProgress === 'object') {
      document.querySelectorAll('[data-prog]').forEach(wrap => {
        wrap.querySelector('.pf')  && (wrap.querySelector('.pf').style.width = '0%');
        wrap.querySelector('.prog-lbl') && (wrap.querySelector('.prog-lbl').textContent = '—');
      });
      Object.keys(stats.mapelProgress).forEach(m => {
        const val = Math.min(100, stats.mapelProgress[m] || 0);
        document.querySelectorAll('[data-prog="' + m + '"]').forEach(wrap => {
          wrap.querySelector('.pf')  && (wrap.querySelector('.pf').style.width = val + '%');
          wrap.querySelector('.prog-lbl') && (wrap.querySelector('.prog-lbl').textContent = val > 0 ? val + ' mnt' : '—');
        });
      });
    }
  }

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

  // ── Streak: baca dari Firestore langsung (bukan localStorage) ──
  async function getStreakFromFirestore() {
    if (!_uid) return { days: [], lastShown: null };
    try {
      const doc = await fbDB.collection('userdata').doc(_uid).get();
      if (!doc.exists) return { days: [], lastShown: null };
      const d = doc.data().streak;
      if (!d || typeof d !== 'object') return { days: [], lastShown: null };
      return { days: Array.isArray(d.days) ? d.days : [], lastShown: d.lastShown || null };
    } catch (e) {
      console.warn('[FirebaseSync] getStreakFromFirestore fallback to cache:', e);
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
    _debounce('stats_' + field, async () => {
      if (!_uid) return;
      try {
        await fbDB.collection('userdata').doc(_uid).set({ stats: { [field]: value } }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] saveStatsField:', field, e); }
    }, 1500);
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
        const pomodoroToday = existing.lastPomoDate === today ? (existing.pomodoroToday || 0) + 1 : 1;
        const pomodoroTotal = (existing.pomodoroTotal || 0) + 1;
        const pomodoroTodayMnt = (existing.lastPomoDate === today ? (existing.pomodoroTodayMnt || 0) : 0) + (typeof pWork !== 'undefined' ? pWork : 25);
        await fbDB.collection('userdata').doc(_uid).set({ stats: { pomodoroToday, pomodoroTotal, pomodoroTodayMnt, lastPomoDate: today } }, { merge: true });
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
            lastBattleMapel:  (window._btSubj) ? window._btSubj : null,
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
        await fbDB.collection('userdata').doc(_uid).set({ stats: { mapelProgress: { [mapel]: pct } } }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] saveMapelProgress:', e); }
    }, 2000);
  }

  function onMateriOpen(mapel, bab) {
    _debounce('materi_open', async () => {
      if (!_uid) return;
      try {
        const inc = firebase.firestore.FieldValue.increment;
        await fbDB.collection('userdata').doc(_uid).set({
          stats: { materiTotal: inc(1), lastMateriMapel: mapel||null, lastMateriBab: bab||null, lastMateriTs: Date.now() }
        }, { merge: true });
      } catch (e) { console.warn('[FirebaseSync] onMateriOpen:', e); }
    }, 300);
  }

  function saveXPHistory(logs) {
    if (!Array.isArray(logs)) return;
    _debounce('xp_history', () => _setField('xpHistory', logs.slice(-500)), 3000);
  }

  function saveActivityLog(logs) {
    if (!Array.isArray(logs)) return;
    _debounce('activity_logs', () => _setField('activityLogs', logs.slice(-1000)), 3000);
  }

  function stop() {
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    _uid = null; _ready = false; _isNewUid = false;
  }

  function _setEl(id, fn) {
    const el = document.getElementById(id);
    if (el) try { fn(el); } catch(e) {}
  }

  function isReady() { return _ready; }

  return {
    init, stop, isReady,
    saveCards, saveAgenda, saveStreak, saveAccent,
    saveCharacter, saveStats, saveStatsField, saveXPLevel,
    saveXPHistory, saveActivityLog, saveMapelProgress,
    onPomodoroComplete, onBattleResult, onFlashStudyDone, onMateriOpen,
    getStreakFromFirestore,
  };
})();
