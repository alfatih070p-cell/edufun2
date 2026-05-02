// ===========================
// EduFun — firebase-sync.js
// Sync data lokal (flashcards, agenda, streak, accent) ke Firestore
// Dipanggil setelah user login & saat data berubah
// ===========================

const FirebaseSync = (() => {

  let _uid = null;

  function init() {
    const session = Auth.getSession();
    if (!session) return;
    _uid = session.uid;
    // Langsung load semua data dari Firestore saat init
    _loadAll();
  }

  // ============================================================
  // LOAD semua data dari Firestore → simpan ke localStorage
  // supaya app.js bisa baca seperti biasa
  // ============================================================
  async function _loadAll() {
    if (!_uid) return;
    try {
      const doc = await fbDB.collection('userdata').doc(_uid).get();
      if (!doc.exists) return;
      const data = doc.data();

      if (data.cards   != null) localStorage.setItem('ef_cards',         JSON.stringify(data.cards));
      if (data.agenda  != null) localStorage.setItem('edufun_agenda_v1', JSON.stringify(data.agenda));
      if (data.streak  != null) localStorage.setItem('ef_streak_data',   JSON.stringify(data.streak));
      if (data.accent  != null) localStorage.setItem('ef_ac',            data.accent);

      console.log('[FirebaseSync] Data loaded from Firestore ✓');

      // Trigger re-render agenda jika sudah ada AgendaSystem
      if (typeof AgendaSystem !== 'undefined' && AgendaSystem.refresh) {
        AgendaSystem.refresh();
      }
    } catch (e) { console.warn('[FirebaseSync] loadAll error:', e); }
  }

  // ============================================================
  // SAVE helpers — dipatch debounced agar tidak terlalu sering
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

  // ---- Flashcards ----
  function saveCards(cards) {
    _debounce('cards', () => _setField('cards', cards));
  }

  // ---- Agenda ----
  function saveAgenda(agendaDB) {
    _debounce('agenda', () => _setField('agenda', agendaDB));
  }

  // ---- Streak ----
  function saveStreak(streakData) {
    _debounce('streak', () => _setField('streak', streakData));
  }

  // ---- Accent color ----
  function saveAccent(hex) {
    _debounce('accent', () => _setField('accent', hex), 3000);
  }

  return { init, saveCards, saveAgenda, saveStreak, saveAccent };
})();
