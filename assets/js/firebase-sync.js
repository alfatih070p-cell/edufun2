// ===========================
// EduFun — firebase-sync.js (v5 — Full Firestore, No localStorage State)
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
  let _initCalled = false;

  function init() {
    const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
    if (!session || !session.uid) { console.warn('[FirebaseSync] init: no session'); return; }

    if (_uid === session.uid && _initCalled) {
      console.log('[FirebaseSync] init: sudah aktif, skip');
      return;
    }

    _uid = session.uid;
    _initCalled = true;
    _ready = false;
    console.log('[FirebaseSync] init — UID:', _uid);

    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }

    _pullAllFromFirestore().then(() => {
      _startRealtimeListener();
    });
  }

  // ─────────────────────────────────────────────
  // PULL: tarik semua data user dari Firestore
  // ─────────────────────────────────────────────
  async function _pullAllFromFirestore() {
    if (!_uid) { console.warn('[FirebaseSync] _pull: _uid kosong'); return; }
    try {
      console.log('[FirebaseSync] Pulling dari Firestore untuk UID:', _uid);
      const doc = await fbDB.collection('userdata').doc(_uid).get();
      if (!doc.exists) {
        console.warn('[FirebaseSync] userdata doc tidak ada untuk UID:', _uid);
        _ready = true;
        setTimeout(() => {
          if (typeof renderAllStatWidgets === 'function') renderAllStatWidgets();
        }, 200);
        return;
      }
      const data = doc.data();
      console.log('[FirebaseSync] Data dari Firestore:', JSON.stringify(data.stats || {}));

      // ── Auto-migrate user lama: isi field yang belum ada ──
      const missing = {};
      if (data.coins === undefined || data.coins === null) missing.coins = 0;
      if (!data.shop) missing.shop = { owned: ['skin-1'], activeSkin: 'skin-1', activeAcc: '' };
      if (!Array.isArray(data.xpHistory))    missing.xpHistory    = [];
      if (!Array.isArray(data.activityLogs)) missing.activityLogs = [];
      if (!data.streak) missing.streak = { days: [], lastShown: null };
      if (!data.accent) missing.accent = '#3b82f6';
      if (!data.stats)  missing.stats  = {
        xp: 0, level: 1, streakCount: 0,
        battleTotal: 0, battleWins: 0, battleXP: 0,
        materiTotal: 0, pomodoroTotal: 0, pomodoroToday: 0, pomodoroTodayMnt: 0,
      };
      if (Object.keys(missing).length > 0) {
        console.log('[FirebaseSync] Auto-migrate user lama, menulis field:', Object.keys(missing));
        fbDB.collection('userdata').doc(_uid).set(missing, { merge: true })
          .catch(e => console.warn('[FirebaseSync] migrate error:', e));
        // Gabungkan ke data sebelum apply supaya langsung kelihatan
        Object.assign(data, missing);
      }

      _applyAllToApp(data);
      _ready = true;
      console.log('[FirebaseSync] Pull selesai OK');
    } catch (e) {
      console.warn('[FirebaseSync] Pull gagal:', e.code, e.message);
      _ready = true;
      setTimeout(() => {
        if (typeof renderAllStatWidgets === 'function') renderAllStatWidgets();
      }, 200);
    }
  }

  // ─────────────────────────────────────────────
  // REALTIME LISTENER
  // ─────────────────────────────────────────────
  function _startRealtimeListener() {
    if (!_uid) return;
    _unsubscribe = fbDB.collection('userdata').doc(_uid)
      .onSnapshot({ includeMetadataChanges: false }, (doc) => {
        if (doc.metadata.hasPendingWrites) return;
        const data = doc.exists ? doc.data() : {};
        _applyAllToApp(data);
      }, (err) => {
        console.warn('[FirebaseSync] listener error:', err);
      });
    console.log('[FirebaseSync] Realtime listener aktif v5');
  }

  // ─────────────────────────────────────────────
  // APPLY: terapkan semua data Firestore ke state app & DOM
  // ─────────────────────────────────────────────
  function _applyAllToApp(data) {
    if (!data) data = {};

    // ── 1. Accent / Theme ──
    const accent = data.accent || '#3b82f6';
    if (typeof _applyAccentOnly === 'function') _applyAccentOnly(accent);
    else if (typeof applyAc === 'function') applyAc(accent);

    // ── 2. Karakter ──
    if (data.character && typeof ch !== 'undefined') {
      Object.assign(ch, data.character);
      if (typeof renderAv === 'function') {
        ['mini-av-svg','profile-av-svg','profile-av-svg-mob'].forEach(id => renderAv(id));
      }
    }

    // ── 3. Flashcards ──
    const cards = Array.isArray(data.cards) ? data.cards : [];
    if (typeof window.cards !== 'undefined') window.cards = cards;
    if (typeof window._refreshFlashCards === 'function') window._refreshFlashCards(cards);

    // ── 4. Agenda ──
    const agenda = (data.agenda && typeof data.agenda === 'object') ? data.agenda : {};
    if (typeof AgendaSystem !== 'undefined' && AgendaSystem.applyFromFirestore) {
      AgendaSystem.applyFromFirestore(agenda);
    }

    // ── 5. Streak ──
    const streak = data.streak || { days: [], lastShown: null };
    if (!Array.isArray(streak.days)) streak.days = [];
    if (typeof StreakSystem !== 'undefined') {
      StreakSystem.applyFromFirestore(streak);
    }

    // ── 6. Stats (XP, Level, Streak count, dll) ──
    const stats = data.stats || {};
    _applyStatsToApp(stats);

    // ── 7. XP History & Activity Logs (hanya ke memori/variabel global) ──
    if (Array.isArray(data.xpHistory) && typeof window._xpHistory !== 'undefined') {
      window._xpHistory = data.xpHistory;
    }
    if (Array.isArray(data.activityLogs) && typeof window._activityLogs !== 'undefined') {
      window._activityLogs = data.activityLogs;
    }

    // ── 8. Coins ──
    const coinsVal = Number(data.coins) || 0;
    if (typeof coins !== 'undefined') coins = coinsVal;
    if (typeof updateCoinUI === 'function') updateCoinUI();

    // ── 9. Shop (owned items & active items) ──
    if (data.shop) {
      if (Array.isArray(data.shop.owned) && typeof window._shopOwned !== 'undefined') {
        window._shopOwned = data.shop.owned;
      }
      if (data.shop.activeSkin && typeof window._shopActiveSkin !== 'undefined') {
        window._shopActiveSkin = data.shop.activeSkin;
      }
      if (data.shop.activeAcc && typeof window._shopActiveAcc !== 'undefined') {
        window._shopActiveAcc = data.shop.activeAcc;
      }
      if (typeof applyMascotSkin === 'function') applyMascotSkin();
      if (typeof renderShopButtons === 'function') renderShopButtons();
    }
  }

  // ─────────────────────────────────────────────
  // APPLY STATS
  // ─────────────────────────────────────────────
  function _applyStatsToApp(stats) {
    if (!stats || typeof stats !== 'object') stats = {};

    const xpVal    = Number(stats.xp)    || 0;
    const levelVal = Number(stats.level) || 1;
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

    const sv = Number(stats.streakCount) || 0;
    if (typeof streak !== 'undefined') streak = sv;
    ['streak-lbl','mob-streak-lbl','home-streak-num','p-streak-lbl'].forEach(id =>
      _setEl(id, el => el.textContent = sv));

    const todayIso = new Date().toISOString().split('T')[0];
    const pomoToday = stats.lastPomoDate === todayIso ? (Number(stats.pomodoroToday) || 0) : 0;
    if (typeof pSessions !== 'undefined') pSessions = pomoToday;
    _setEl('p-sessions',  el => el.textContent = pomoToday);
    _setEl('h-pomo-stat', el => el.textContent = pomoToday + ' sesi hari ini');

    if (stats.flashCardCount != null)
      _setEl('h-flash-stat', el => el.textContent = stats.flashCardCount + ' kartu');

    if (stats.battleXP != null)
      _setEl('lb-my-xp', el => el.textContent = stats.battleXP);

    // Arena stat (ke memori global, bukan localStorage)
    const arenaData = {
      total:     Number(stats.battleTotal)  || 0,
      wins:      Number(stats.battleWins)   || 0,
      lastTs:    stats.lastBattleTs         || null,
      lastMapel: stats.lastBattleMapel      || stats.lastBattleSubj || null,
    };
    if (typeof window._statArena !== 'undefined') window._statArena = arenaData;

    // Materi stat
    const totalSesiBelajar = (Number(stats.materiTotal) || 0)
                           + (Number(stats.flashStudySessions) || 0)
                           + (Number(stats.quizSessions) || 0);
    const lastActivity = Math.max(
      stats.lastMateriTs  || 0,
      stats.lastFlashTs   || 0,
      stats.lastQuizTs    || 0,
    );
    const materiData = {
      total:     totalSesiBelajar,
      lastMapel: stats.lastMateriMapel || stats.lastFlashMapel || null,
      lastBab:   stats.lastMateriBab   || null,
      lastTs:    lastActivity > 0 ? lastActivity : (stats.lastOnlineTs || null),
      lastOnlineTs: stats.lastOnlineTs || null,
    };
    if (typeof window._statMateri !== 'undefined') window._statMateri = materiData;

    // Pomo stat
    const today = new Date().toDateString();
    const pomoData = {
      total:      Number(stats.pomodoroTotal) || 0,
      todayDate:  stats.lastPomoDate === todayIso ? today : null,
      todayCount: stats.lastPomoDate === todayIso ? (Number(stats.pomodoroToday)    || 0) : 0,
      todayMnt:   stats.lastPomoDate === todayIso ? (Number(stats.pomodoroTodayMnt) || 0) : 0,
      lastTs:     stats.lastPomoTs    || null,
      lastMapel:  stats.lastPomoMapel || null,
    };
    if (typeof window._statPomo !== 'undefined') window._statPomo = pomoData;

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

    function _tryRenderWidgets(attempts) {
      if (typeof renderArenaStatWidget === 'function' &&
          typeof renderMateriStatWidget === 'function' &&
          typeof renderPomoStatWidget === 'function') {
        renderArenaStatWidget();
        renderMateriStatWidget();
        renderPomoStatWidget();
        console.log('[FirebaseSync] Stat widgets rendered OK');
      } else if (attempts > 0) {
        setTimeout(() => _tryRenderWidgets(attempts - 1), 200);
      }
    }
    setTimeout(() => _tryRenderWidgets(10), 100);
  }

  // ─────────────────────────────────────────────
  // FLUSH: simpan semua state ke Firestore (dipanggil sebelum navigasi/unload)
  // ─────────────────────────────────────────────
  function flushAll() {
    if (!_uid) return;
    Object.keys(_timers).forEach(k => clearTimeout(_timers[k]));

    const writes = {};

    const xpVal    = (typeof xp    !== 'undefined') ? xp    : null;
    const levelVal = (typeof level !== 'undefined') ? level : null;
    if (xpVal !== null)    writes['stats.xp']    = xpVal;
    if (levelVal !== null) writes['stats.level'] = levelVal;

    // XP history dari memori global
    try {
      const xpH = Array.isArray(window._xpHistory) ? window._xpHistory : [];
      if (xpH.length > 0) writes['xpHistory'] = xpH.slice(-500);
    } catch(e) {}

    // Activity logs dari memori global
    try {
      const logs = Array.isArray(window._activityLogs) ? window._activityLogs : [];
      if (logs.length > 0) writes['activityLogs'] = logs.slice(-1000);
    } catch(e) {}

    // Streak dari StreakSystem memori
    try {
      if (typeof StreakSystem !== 'undefined' && StreakSystem.getDataInMemory) {
        const sd = StreakSystem.getDataInMemory();
        if (sd) writes['streak'] = sd;
      }
    } catch(e) {}

    // Accent
    try {
      const ac = document.documentElement.style.getPropertyValue('--ac');
      if (ac) writes['accent'] = ac.trim();
    } catch(e) {}

    // Cards dari memori global
    try {
      if (typeof window.cards !== 'undefined' && Array.isArray(window.cards)) {
        writes['cards'] = window.cards;
      }
    } catch(e) {}

    // Agenda dari AgendaSystem memori
    try {
      if (typeof AgendaSystem !== 'undefined' && AgendaSystem.getDataInMemory) {
        const ag = AgendaSystem.getDataInMemory();
        if (ag) writes['agenda'] = ag;
      }
    } catch(e) {}

    // Coins
    try {
      if (typeof coins !== 'undefined') writes['coins'] = coins;
    } catch(e) {}

    // Shop
    try {
      const shopData = {};
      if (typeof window._shopOwned !== 'undefined')     shopData.owned      = window._shopOwned;
      if (typeof window._shopActiveSkin !== 'undefined') shopData.activeSkin = window._shopActiveSkin;
      if (typeof window._shopActiveAcc !== 'undefined')  shopData.activeAcc  = window._shopActiveAcc;
      if (Object.keys(shopData).length > 0) writes['shop'] = shopData;
    } catch(e) {}

    // Arena stat
    try {
      if (window._statArena) {
        const a = window._statArena;
        writes['stats.battleTotal']     = a.total     || 0;
        writes['stats.battleWins']      = a.wins      || 0;
        writes['stats.lastBattleTs']    = a.lastTs    || null;
        writes['stats.lastBattleMapel'] = a.lastMapel || null;
      }
    } catch(e) {}

    // Materi stat
    try {
      if (window._statMateri) {
        const m = window._statMateri;
        writes['stats.materiTotal']     = m.total     || 0;
        writes['stats.lastMateriMapel'] = m.lastMapel || null;
        writes['stats.lastMateriBab']   = m.lastBab   || null;
        writes['stats.lastMateriTs']    = m.lastTs    || null;
      }
    } catch(e) {}

    // Pomo stat
    try {
      if (window._statPomo) {
        const p = window._statPomo;
        writes['stats.pomodoroTotal']    = p.total      || 0;
        writes['stats.pomodoroToday']    = p.todayCount || 0;
        writes['stats.pomodoroTodayMnt'] = p.todayMnt   || 0;
        if (p.todayDate)  writes['stats.lastPomoDate']  = p.todayDate;
        if (p.lastTs)     writes['stats.lastPomoTs']    = p.lastTs;
        if (p.lastMapel)  writes['stats.lastPomoMapel'] = p.lastMapel;
      }
    } catch(e) {}

    if (Object.keys(writes).length === 0) return;

    const statsObj = {};
    const topObj   = {};
    Object.keys(writes).forEach(k => {
      if (k.startsWith('stats.')) statsObj[k.slice(6)] = writes[k];
      else topObj[k] = writes[k];
    });

    const batch = fbDB.batch();
    const ref   = fbDB.collection('userdata').doc(_uid);
    if (Object.keys(statsObj).length > 0) batch.set(ref, { stats: statsObj }, { merge: true });
    if (Object.keys(topObj).length > 0)   batch.set(ref, topObj, { merge: true });
    batch.commit().catch(e => console.warn('[FirebaseSync] flushAll error:', e));
    console.log('[FirebaseSync] flushAll — data disimpan ke Firestore');
  }

  function stop() {
    if (_unsubscribe) { _unsubscribe(); _unsubscribe = null; }
    _uid        = null;
    _ready      = false;
    _initCalled = false;
    console.log('[FirebaseSync] Stopped');
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pageshow', function(e) {
      if (e.persisted) {
        console.log('[FirebaseSync] pageshow (persisted) — re-init');
        _initCalled = false;
        init();
      }
    });
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

  async function getStreakFromFirestore() {
    if (!_uid) return { days: [], lastShown: null };
    try {
      const doc = await fbDB.collection('userdata').doc(_uid).get();
      if (!doc.exists) return { days: [], lastShown: null };
      const d = doc.data().streak;
      if (!d || typeof d !== 'object') return { days: [], lastShown: null };
      return { days: Array.isArray(d.days) ? d.days : [], lastShown: d.lastShown || null };
    } catch (e) {
      return { days: [], lastShown: null };
    }
  }

  function saveStreak(streakData) {
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

  // Simpan coins ke Firestore
  function saveCoins(coinsVal) {
    _debounce('coins', () => _setField('coins', coinsVal), 1000);
  }

  // Simpan data shop ke Firestore
  function saveShop(shopData) {
    _debounce('shop', () => _setField('shop', shopData), 1000);
  }

  // Simpan XP history dari memori
  function saveXPHistory(logs) {
    if (!Array.isArray(logs)) return;
    window._xpHistory = logs;
    _debounce('xp_history', () => _setField('xpHistory', logs.slice(-500)), 3000);
  }

  // Simpan activity logs dari memori
  function saveActivityLog(logs) {
    if (!Array.isArray(logs)) return;
    window._activityLogs = logs;
    _debounce('activity_logs', () => _setField('activityLogs', logs.slice(-1000)), 3000);
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

  function onFlashStudyDone(correct, total, mapel) {
    _debounce('flash_study', async () => {
      if (!_uid) return;
      try {
        const inc = firebase.firestore.FieldValue.increment;
        await fbDB.collection('userdata').doc(_uid).set({
          stats: {
            flashStudySessions: inc(1),
            flashCorrect: inc(correct||0),
            flashTotal:   inc(total||0),
            lastFlashTs:  Date.now(),
            lastFlashMapel: mapel || null,
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
    if (!_uid) return;
    const inc = firebase.firestore.FieldValue.increment;
    fbDB.collection('userdata').doc(_uid).set({
      stats: { materiTotal: inc(1), lastMateriMapel: mapel||null, lastMateriBab: bab||null, lastMateriTs: Date.now() }
    }, { merge: true }).catch(e => console.warn('[FirebaseSync] onMateriOpen:', e));
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
    saveCoins, saveShop,
    onPomodoroComplete, onBattleResult, onFlashStudyDone, onMateriOpen,
    getStreakFromFirestore,
  };
})();
