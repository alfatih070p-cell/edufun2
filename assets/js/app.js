// ===========================
// Proteksi halaman — wajib login
// ===========================
if (typeof Auth !== 'undefined' && !Auth.requireAuth()) { throw new Error('Redirect to auth'); }

// ===========================
// EduFun — app.js
// ===========================

// ===========================
// QUIZ ENGINE (Mode Offline)
// ===========================

const GeminiQuiz = (() => {
  const cache = {};

  // ── Soal fallback offline ──────────────────────────────────────
  const fallbackQs = {
    Matematika: [
      { q: '3² + 4² = ?', o: ['25','24','21','16'], a: 0 },
      { q: 'Berapa nilai π (pi) hingga 2 desimal?', o: ['3.12','3.14','3.16','3.18'], a: 1 },
      { q: '√144 = ?', o: ['11','12','13','14'], a: 1 },
      { q: '2x + 4 = 10, x = ?', o: ['2','3','4','5'], a: 1 },
      { q: 'Hasil dari 15% × 200 adalah?', o: ['25','30','35','40'], a: 1 },
      { q: 'Berapa luas lingkaran jari-jari 7 cm (π=3,14)?', o: ['153,86','154','143,86','164'], a: 0 },
      { q: 'Sebuah kubus memiliki sisi 5 cm. Berapa volumenya?', o: ['100','125','150','175'], a: 1 },
      { q: 'Berapakah hasil dari -8 + 15?', o: ['7','-7','23','-23'], a: 0 },
      { q: 'Jika sebuah segitiga memiliki alas 10 cm dan tinggi 8 cm, berapa luasnya?', o: ['80','40','20','60'], a: 1 },
      { q: 'Faktorisasi dari x² - 9 adalah...', o: ['(x-3)(x-3)','(x+3)(x+3)','(x-3)(x+3)','(x-9)(x+1)'], a: 2 },
      { q: 'Berapakah nilai dari 2³ × 2²?', o: ['16','32','64','12'], a: 1 },
      { q: 'Median dari data 3, 5, 7, 9, 11 adalah?', o: ['5','7','9','11'], a: 1 },
      { q: 'Berapa jumlah sudut dalam sebuah segitiga?', o: ['90°','180°','270°','360°'], a: 1 },
      { q: 'Harga barang Rp100.000 diskon 20%, harga akhirnya adalah?', o: ['Rp70.000','Rp80.000','Rp85.000','Rp90.000'], a: 1 }
    ],
    Fisika: [
      { q: 'F = m × a adalah rumus Hukum Newton ke-?', o: ['1','2','3','4'], a: 1 },
      { q: 'Satuan energi dalam SI adalah?', o: ['Watt','Newton','Joule','Pascal'], a: 2 },
      { q: 'Kecepatan cahaya di vakum sekitar?', o: ['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], a: 1 },
      { q: 'Rumus kecepatan adalah?', o: ['v=at','v=s/t','v=F/m','v=mgh'], a: 1 },
      { q: 'Satuan gaya dalam SI adalah?', o: ['Joule','Watt','Newton','Pascal'], a: 2 },
      { q: 'Tekanan = Gaya / ?', o: ['Massa','Volume','Luas','Panjang'], a: 2 },
      { q: 'Zat yang memiliki bentuk tetap dan volume tetap adalah?', o: ['Gas','Cair','Padat','Plasma'], a: 2 },
      { q: 'Proses perpindahan panas tanpa melalui zat perantara disebut?', o: ['Konduksi','Konveksi','Radiasi','Evaporasi'], a: 2 },
      { q: 'Alat ukur suhu adalah?', o: ['Barometer','Termometer','Higrometer','Anemometer'], a: 1 },
      { q: 'Satuan frekuensi adalah?', o: ['Hertz','Newton','Joule','Watt'], a: 0 },
      { q: 'Benda yang dapat menarik benda logam tertentu adalah?', o: ['Baja','Magnet','Kuningan','Tembaga'], a: 1 },
      { q: 'Warna cahaya tampak dengan panjang gelombang terpendek adalah?', o: ['Merah','Hijau','Biru','Ungu'], a: 3 },
      { q: 'Hukum yang menyatakan tegangan sebanding dengan arus adalah?', o: ['Hukum Newton','Hukum Ohm','Hukum Pascal','Hukum Archimedes'], a: 1 },
      { q: 'Gaya tarik bumi disebut juga gaya?', o: ['Magnet','Gesek','Gravitasi','Pegas'], a: 2 },
      { q: 'Satuan daya dalam SI adalah?', o: ['Joule','Volt','Watt','Ampere'], a: 2 },
      { q: 'Logam yang paling baik menghantarkan listrik adalah?', o: ['Besi','Aluminium','Tembaga','Perak'], a: 3 },
      { q: 'Bunyi tidak dapat merambat melalui?', o: ['Air','Udara','Besi','Ruang Hampa'], a: 3 },
      { q: 'Energi kinetik bergantung pada massa dan...?', o: ['Waktu','Ketinggian','Kecepatan','Gaya'], a: 2 },
      { q: 'Cermin yang digunakan sebagai spion kendaraan adalah?', o: ['Cekung','Cembung','Datar','Ganda'], a: 1 },
      { q: 'Satuan hambatan listrik adalah?', o: ['Volt','Ampere','Ohm','Watt'], a: 2 },
      { q: 'Perubahan energi pada setrika listrik adalah?', o: ['Listrik ke Gerak','Listrik ke Panas','Panas ke Listrik','Listrik ke Cahaya'], a: 1 },
      { q: 'Alat pemutus dan penyambung arus listrik adalah?', o: ['Baterai','Lampu','Saklar','Kabel'], a: 2 },
      { q: 'Massa jenis air murni adalah?', o: ['100 kg/m³','500 kg/m³','1000 kg/m³','10000 kg/m³'], a: 2 },
      { q: 'Gaya yang bekerja pada dua benda yang bersentuhan dan berlawanan arah?', o: ['Gravitasi','Gesek','Pegas','Magnet'], a: 1 },
      { q: 'Planet terbesar dalam tata surya kita adalah?', o: ['Bumi','Saturnus','Neptunus','Jupiter'], a: 3 },
      { q: 'Lensa yang digunakan oleh penderita rabun jauh (miopi) adalah?', o: ['Cembung','Cekung','Silinder','Ganda'], a: 1 },
      { q: 'Pemanasan global disebabkan oleh peningkatan gas...?', o: ['Oksigen','Nitrogen','Karbon Dioksida','Argon'], a: 2 },
      { q: 'Kecepatan gravitasi bumi secara umum dibulatkan menjadi?', o: ['8 m/s²','9.8 m/s²','10 m/s²','12 m/s²'], a: 1 },
      { q: 'Perpindahan panas pada air yang mendidih terjadi secara?', o: ['Konduksi','Konveksi','Radiasi','Induksi'], a: 1 },
      { q: 'Besaran massa dalam SI menggunakan satuan?', o: ['Gram','Kilogram','Ton','Ons'], a: 1 },
      { q: 'Pesawat sederhana yang digunakan untuk menimba air di sumur adalah?', o: ['Tuas','Bidang Miring','Katrol','Roda Berporos'], a: 2 },
    ],
    Kimia: [
      { q: 'Rumus kimia air adalah?', o: ['HO','H²O','H2O','HO2'], a: 2 },
      { q: 'Jumlah proton dalam atom oksigen adalah?', o: ['6','7','8','9'], a: 2 },
      { q: 'Asam klorida memiliki rumus?', o: ['HCl','H2SO4','HNO3','H3PO4'], a: 0 },
      { q: 'Larutan asam memiliki pH?', o: ['> 7','= 7','< 7','= 14'], a: 2 },
      { q: 'Unsur dengan simbol Na adalah?', o: ['Nitrogen','Natrium','Nikel','Neon'], a: 1 },
      { q: 'Ikatan yang terjadi antara logam dan non-logam disebut?', o: ['Kovalen','Ionik','Logam','Hidrogen'], a: 1 },
    ],
    'Bahasa Inggris': [
      { q: '"She ___ to school every day."', o: ['go','goes','gone','going'], a: 1 },
      { q: 'Past tense dari "eat" adalah?', o: ['eated','ate','eaten','eating'], a: 1 },
      { q: 'Antonim dari "ancient" adalah?', o: ['old','modern','historic','antique'], a: 1 },
      { q: 'Kalimat passive dari "They build a house" adalah?', o: ['A house builds them','A house is built by them','A house was built','They are built'], a: 1 },
      { q: '"I wish I ___ fly." (conditional)', o: ['can','could','will','would'], a: 1 },
      { q: 'Sinonim dari "happy" adalah?', o: ['sad','angry','joyful','tired'], a: 2 },
    ],
    'B. Inggris': [
      { q: '"She ___ to school every day."', o: ['go','goes','gone','going'], a: 1 },
      { q: 'Past tense dari "eat" adalah?', o: ['eated','ate','eaten','eating'], a: 1 },
      { q: 'Antonim dari "ancient" adalah?', o: ['old','modern','historic','antique'], a: 1 },
      { q: 'Sinonim dari "happy" adalah?', o: ['sad','angry','joyful','tired'], a: 2 },
      { q: 'What is the plural form of "child"?', o: ['childs','children','childrens','childes'], a: 1 },
      { q: '"I have ___ apple in my bag."', o: ['a','an','the','some'], a: 1 },
      { q: 'Which one is a vegetable?', o: ['Apple','Chicken','Carrot','Bread'], a: 2 },
      { q: 'They ___ playing football right now.', o: ['is','am','are','was'], a: 2 },
      { q: 'Look! The bird is ___.', o: ['fly','flies','flying','flown'], a: 2 },
      { q: 'Opposite of "fast" is...', o: ['quick','slow','loud','small'], a: 1 },
      { q: '"He is the ___ student in class."', o: ['smart','smarter','smartest','more smart'], a: 2 },
      { q: 'Where do you go to buy medicine?', o: ['Library','Pharmacy','Bakery','Gym'], a: 1 },
      { q: 'I ___ my homework last night.', o: ['finish','finished','finishing','finishes'], a: 1 },
      { q: 'The sun ___ in the east.', o: ['rise','rises','rising','rose'], a: 1 },
      { q: 'Could you ___ the door, please?', o: ['open','opening','opened','opens'], a: 0 },
      { q: 'What is the capital city of Japan?', o: ['Seoul','Beijing','Tokyo','Bangkok'], a: 2 },
      { q: 'How ___ sugar do you want?', o: ['many','much','few','any'], a: 1 },
      { q: 'My father is a ___. He flies planes.', o: ['Doctor','Pilot','Chef','Driver'], a: 1 },
      { q: 'We go to the ___ to watch movies.', o: ['Museum','Cinema','Zoo','Park'], a: 1 },
      { q: '"Always" is an adverb of...', o: ['Place','Time','Frequency','Manner'], a: 2 },
      { q: 'What is the comparative of "bad"?', o: ['badder','worst','worse','more bad'], a: 2 },
      { q: '___ you ever been to Bali?', o: ['Has','Have','Do','Did'], a: 1 },
      { q: 'If today is Monday, tomorrow is...', o: ['Sunday','Tuesday','Wednesday','Thursday'], a: 1 },
      { q: 'Which one is a pronoun?', o: ['House','Walk','She','Beautiful'], a: 2 },
      { q: 'Yesterday was very ___. It rained all day.', o: ['Sunny','Windy','Cloudy','Wet'], a: 3 },
      { q: 'A person who teaches is a...', o: ['Nurse','Teacher','Farmer','Tailor'], a: 1 },
      { q: 'Which word is a verb?', o: ['Happy','Run','Red','Table'], a: 1 },
      { q: 'I usually get up ___ 5 o\'clock.', o: ['on','in','at','for'], a: 2 },
      { q: 'How do you say "Terima Kasih" in English?', o: ['Goodbye','Sorry','Thank you','Please'], a: 2 },
    ],
    'B. Indonesia': [
      { q: 'Antonim dari kata "lebar" adalah?', o: ['Panjang','Sempit','Besar','Luas'], a: 1 },
      { q: 'Penulisan kata depan yang benar adalah?', o: ['dirumah','di sekolah','disana','kemana'], a: 1 },
      { q: 'Sinonim dari kata "pangkas" adalah?', o: ['Tambah','Potong','Tanam','Buang'], a: 1 },
      { q: 'Kalimat yang membutuhkan jawaban disebut kalimat?', o: ['Perintah','Tanya','Berita','Ajakan'], a: 1 },
      { q: 'Tokoh utama yang berwatak baik disebut?', o: ['Antagonis','Protagonis','Tritagonis','Figuran'], a: 1 },
      { q: 'Singkatan dari "Halaman" yang benar adalah?', o: ['Hal.','Hlm.','Hla.','Hmn.'], a: 1 },
      { q: 'Cerita rakyat tentang asal-usul suatu tempat disebut?', o: ['Mite','Fabel','Legenda','Sage'], a: 2 },
      { q: 'Kata dasar dari "pelarian" adalah?', o: ['Larian','Pelari','Lari','Berlari'], a: 2 },
      { q: 'Subjek pada kalimat "Ibu memasak nasi" adalah?', o: ['Ibu','Memasak','Nasi','Dapur'], a: 0 },
      { q: 'Tanda baca untuk mengakhiri kalimat berita adalah?', o: ['Tanya (?)','Seru (!)','Titik (.)','Koma (,)'], a: 2 },
      { q: 'Cerita yang tokohnya binatang disebut?', o: ['Hikayat','Fabel','Legenda','Novel'], a: 1 },
      { q: 'Lawan kata "Asli" adalah...', o: ['Murni','Palsu','Baru','Lama'], a: 1 },
      { q: 'Kalimat yang hanya memiliki satu pola S-P disebut kalimat?', o: ['Majemuk','Tunggal','Perintah','Pasif'], a: 1 },
      { q: 'Berikut yang termasuk kata kerja adalah?', o: ['Cantik','Makan','Meja','Dingin'], a: 1 },
      { q: 'Ide pokok biasanya terletak dalam kalimat...?', o: ['Penjelas','Utama','Saran','Tanya'], a: 1 },
      { q: 'Percakapan antara dua orang atau lebih disebut?', o: ['Monolog','Dialog','Prolog','Epilog'], a: 1 },
      { q: '"Anak itu keras kepala." Keras kepala artinya?', o: ['Kepala yang kuat','Sangat pintar','Susah dinasihati','Rajin belajar'], a: 2 },
      { q: 'Huruf kapital digunakan pada awal nama...?', o: ['Benda','Kota','Hewan','Tumbuhan'], a: 1 },
      { q: 'Persamaan bunyi di akhir baris puisi disebut?', o: ['Bait','Irama','Rima','Majas'], a: 2 },
      { q: 'Kata "apotek" jika ditulis secara baku adalah?', o: ['Apotik','Apotek','Apotika','Apotis'], a: 1 },
      { q: 'Latar tempat dalam cerita "Si Kancil di Kebun" adalah?', o: ['Hutan','Sungai','Kebun','Pasar'], a: 2 },
      { q: 'Alur cerita yang bergerak mundur disebut alur?', o: ['Maju','Regresif','Campuran','Progresif'], a: 1 },
      { q: 'Kata ganti orang pertama jamak adalah?', o: ['Saya','Kamu','Kami/Kita','Mereka'], a: 2 },
      { q: 'Ungkapan "Gulung tikar" berarti?', o: ['Bangkrut','Berhasil','Membereskan tempat','Pindah rumah'], a: 0 },
      { q: 'Bagian awal sebuah cerita disebut?', o: ['Orientasi','Komplikasi','Resolusi','Koda'], a: 0 },
      { q: 'Majas yang memakai kata "seperti/bagai" untuk perbandingan disebut?', o: ['Metafora','Simile','Personifikasi','Hiperbola'], a: 1 },
      { q: '"Tangan kanan" dalam peribahasa berarti?', o: ['Tangan dominan','Orang kepercayaan','Pemberian','Kekuatan'], a: 1 },
      { q: 'EYD kepanjangan dari?', o: ['Ejaan yang Ditentukan','Ejaan yang Dibakukan','Ejaan yang Disempurnakan','Ejaan yang Digunakan'], a: 2 },
      { q: 'Paragraph yang berisi ide pokok disebut?', o: ['Paragraf deskripsi','Paragraf utama','Paragraf penutup','Paragraf penjelas'], a: 1 },
    ],
    'Biologi': [
      { q: 'Organel "powerhouse of the cell" adalah?', o: ['Ribosom','Nukleus','Mitokondria','Lisosom'], a: 2 },
      { q: 'Fotosintesis menghasilkan?', o: ['CO2 & H2O','Glukosa & O2','ATP & ADP','Protein & Lemak'], a: 1 },
      { q: 'DNA tersimpan di dalam?', o: ['Mitokondria','Ribosom','Nukleus','Sitoplasma'], a: 2 },
      { q: 'Proses pembelahan sel yang menghasilkan 2 sel identik disebut?', o: ['Meiosis','Mitosis','Fertilisasi','Regenerasi'], a: 1 },
      { q: 'Sel yang tidak memiliki membran inti disebut?', o: ['Eukariotik','Prokariotik','Diploid','Haploid'], a: 1 },
      { q: 'Hormon yang mengatur kadar gula darah adalah?', o: ['Adrenalin','Tiroksin','Insulin','Kortisol'], a: 2 },
    ],
  };

  // ── Fungsi utama — selalu pakai soal offline ───────────────────
  function isConfigured() { return false; }

  async function getQuestions(subject, difficulty = 'Sedang') {
    console.info('[Quiz] Mode offline — memuat soal lokal');
    return _shuffle([...(fallbackQs[subject] || fallbackQs['Matematika'])]);
  }

    function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function clearCache(subject, difficulty) {
    if (subject && difficulty) delete cache[subject + '|' + difficulty];
    else Object.keys(cache).forEach(k => delete cache[k]);
  }

  return { getQuestions, clearCache, isConfigured, fallbackQs };
})();

// ===========================
// SOUND ENGINE (Web Audio API)
// ===========================
const SFX = (() => {
  let ctx = null;
  let battleBgNode = null, battleBgGain = null, battleBgRunning = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, dur, vol, delay = 0, attack = 0.01, release = null) {
    try {
      const c = getCtx();
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + delay);
      g.gain.setValueAtTime(0, c.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + attack);
      const rel = release || dur * 0.6;
      g.gain.setValueAtTime(vol, c.currentTime + delay + dur - rel);
      g.gain.linearRampToValueAtTime(0, c.currentTime + delay + dur);
      o.start(c.currentTime + delay); o.stop(c.currentTime + delay + dur + 0.01);
    } catch (e) {}
  }

  function noise(dur, vol = 0.15, delay = 0) {
    try {
      const c = getCtx();
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * vol;
      const src = c.createBufferSource(), g = c.createGain();
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 800;
      src.buffer = buf; src.connect(f); f.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(vol, c.currentTime + delay);
      g.gain.linearRampToValueAtTime(0, c.currentTime + delay + dur);
      src.start(c.currentTime + delay); src.stop(c.currentTime + delay + dur + 0.01);
    } catch (e) {}
  }

  return {
    click() { tone(880, 'sine', .08, .18, 0, .005); },
    select() { tone(660, 'triangle', .12, .2, 0, .005); tone(990, 'triangle', .1, .15, .04); },
    correct() {
      [523, 659, 784].forEach((f, i) => tone(f, 'sine', .18, .25, i * .07));
      setTimeout(() => tone(1047, 'sine', .25, .3), 250);
    },
    wrong() {
      tone(220, 'sawtooth', .18, .2);
      tone(196, 'sawtooth', .12, .18, .05);
      setTimeout(() => tone(165, 'sawtooth', .15, .25), 150);
    },
    timerBeep() { tone(880, 'sine', .08, .1, 0, .003); tone(880, 'square', .06, .15); },
    timerUrgent() { tone(1100, 'sine', .12, .08, 0, .002); setTimeout(() => tone(1100, 'sine', .1, .08), 120); },
    timeOut() {
      tone(440, 'sawtooth', .15, .2);
      tone(330, 'sawtooth', .15, .25, .15);
      tone(262, 'sawtooth', .2, .3, .3);
    },
    battleStart() {
      [262, 330, 392, 523, 659].forEach((f, i) => tone(f, 'square', .15, .3, i * .1));
      setTimeout(() => { tone(784, 'square', .2, .5); tone(987, 'square', .2, .5, .1); }, 600);
    },
    win() {
      const melody = [523, 659, 784, 1047, 784, 1047, 1319];
      melody.forEach((f, i) => tone(f, 'sine', .25, .4, i * .1));
      setTimeout(() => { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 'triangle', .2, .35, i * .08)); }, 800);
    },
    lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 'sawtooth', .15, .4, i * .18)); },
    hit() { noise(.08, .2); tone(200, 'sawtooth', .08, .25); },
    hitSelf() { noise(.1, .25); tone(150, 'sawtooth', .1, .3); },
    levelUp() { [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 'sine', .2, .4, i * .09)); },
    toastPop() { tone(880, 'sine', .07, .12, 0, .003); },
    cardFlip() { tone(440, 'triangle', .12, .15); tone(554, 'triangle', .1, .12, .06); },
    pomoDone() {
      [440, 554, 659, 880].forEach((f, i) => tone(f, 'sine', .25, .35, i * .12));
      setTimeout(() => [659, 784, 1047].forEach((f, i) => tone(f, 'sine', .2, .3, i * .1)), 600);
    },
    modalOpen() { tone(660, 'sine', .1, .15, 0, .005); },
    startBattleBg() {
      try {
        if (battleBgRunning) return;
        const c = getCtx(); battleBgRunning = true;
        battleBgGain = c.createGain(); battleBgGain.gain.value = 0.07; battleBgGain.connect(c.destination);
        const melody = [262, 0, 294, 0, 262, 0, 330, 349, 330, 0, 294, 0, 262, 0, 294, 349];
        const bass   = [130, 0, 130, 0, 146, 0, 130, 0, 116, 0, 130, 0, 116, 0, 130, 0];
        let step = 0;
        const bpm = 165, spb = 60 / bpm;
        const bassGain = c.createGain(); bassGain.gain.value = 0.04; bassGain.connect(c.destination);
        function scheduleNote(t) {
          const f = melody[step % melody.length], fb = bass[step % bass.length];
          step++;
          if (f > 0) {
            const o = c.createOscillator(), g = c.createGain();
            o.connect(g); g.connect(battleBgGain);
            o.type = 'square'; o.frequency.value = f;
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.8, t + .005);
            g.gain.setValueAtTime(.8, t + spb * .5); g.gain.linearRampToValueAtTime(0, t + spb * .8);
            o.start(t); o.stop(t + spb);
          }
          if (fb > 0) {
            const ob = c.createOscillator(), gb = c.createGain();
            ob.connect(gb); gb.connect(bassGain);
            ob.type = 'triangle'; ob.frequency.value = fb;
            gb.gain.setValueAtTime(0, t); gb.gain.linearRampToValueAtTime(1, t + .01);
            gb.gain.setValueAtTime(1, t + spb * .4); gb.gain.linearRampToValueAtTime(0, t + spb * .7);
            ob.start(t); ob.stop(t + spb);
          }
        }
        let nextT = c.currentTime;
        battleBgNode = setInterval(() => {
          const c2 = getCtx();
          while (nextT < c2.currentTime + 0.5) { scheduleNote(nextT); nextT += spb; }
        }, 100);
        document.getElementById('battle-music-indicator').classList.add('on');
      } catch (e) {}
    },
    stopBattleBg() {
      if (battleBgNode) { clearInterval(battleBgNode); battleBgNode = null; }
      if (battleBgGain) { try { battleBgGain.gain.linearRampToValueAtTime(0, getCtx().currentTime + 0.3); } catch (e) {} }
      battleBgRunning = false; battleBgGain = null;
      document.getElementById('battle-music-indicator').classList.remove('on');
    }
  };
})();

// ===========================
// STATE
// ===========================
let ch = { gender: 'male', skin: '#FDDBB4', hair: 'short', outfit: 'school', acc: 'none' };
let userName = 'Raka Pratama', userRole = 'siswa';
let xp = 750, level = 4, streak = 12;
let podIntervals = {};

// ===========================
// ACCENT / THEME
// ===========================
function hexRgb(h) { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)].join(','); }

function applyAc(hex) {
  const r = hexRgb(hex);
  const d = document.documentElement;
  d.style.setProperty('--ac', hex);
  d.style.setProperty('--ac-rgb', r);
  d.style.setProperty('--ac-l', `rgba(${r},.10)`);
  d.style.setProperty('--ac-m', `rgba(${r},.30)`);
  d.style.setProperty('--ac-g', `0 0 0 3px rgba(${r},.18)`);
  localStorage.setItem('ef_ac', hex);
  if (typeof FirebaseSync !== 'undefined') FirebaseSync.saveAccent(hex);
  document.querySelectorAll('.csw').forEach(s => s.classList.toggle('sel', s.dataset.ac === hex));
  document.getElementById('color-pick').value = hex;
  document.getElementById('color-hex').textContent = hex;
}

function setAc(el) { applyAc(el.dataset.ac); toast('Warna aksen diperbarui!'); }

function applyCustomAc() { applyAc(document.getElementById('color-pick').value); toast('Warna kustom diterapkan!'); }

document.getElementById('color-pick').addEventListener('input', function () {
  document.getElementById('color-hex').textContent = this.value;
});

// Apply accent dari localStorage saat startup.
// JANGAN pakai fallback default di sini — biarkan Firestore yang tentukan
// lewat _applyToApp(). Kalau belum ada ef_ac sama sekali (user baru),
// Firestore listener akan memanggil applyAc('#3b82f6') setelah data siap.
const _savedAc = localStorage.getItem('ef_ac');
if (_savedAc) applyAc(_savedAc);

// ===========================
// SCREENS
// ===========================
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
}

// ===========================
// LOGIN
// ===========================
let selRole = 'siswa';

function setRole(r, el) {
  selRole = r;
  document.querySelectorAll('#role-tabs button').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
}

function goChar() {
  SFX.click();
  userName = document.getElementById('ln-name').value || 'Pelajar';
  userRole = selRole;
  document.getElementById('char-preview-name').textContent = userName;
  document.getElementById('char-preview-role').textContent = userRole === 'guru' ? '📚 Guru' : '🎒 Siswa';
  renderAv('char-svg');
  goScreen('sc-char');
}

// ===========================
// CHARACTER
// ===========================
function setCh(k, v, el) {
  SFX.select();
  ch[k] = v;
  const row = el.closest('.oc');
  if (row) row.querySelectorAll('.ob,.sk').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  renderAv('char-svg');
}

function setCh2(k, v, el) {
  ch[k] = v;
  const row = el.closest('.oc');
  if (row) row.querySelectorAll('.ob,.sk').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  renderAv('char-modal-svg');
  renderAv('char-svg');
  renderAv('mini-av-svg');
}

function saveCharEdit() { closeModal('char-edit-modal'); toast('Karakter berhasil disimpan!'); renderAv('mini-av-svg'); }

function goDash() {
  SFX.click();
  document.getElementById('home-greeting').textContent = '👋 Halo, ' + userName.split(' ')[0] + '!';
  document.getElementById('pd-name').textContent = userName;
  document.getElementById('pd-role').textContent = (userRole === 'guru' ? 'Guru' : 'Siswa') + ' · Level ' + level;
  document.getElementById('lb-my-name').textContent = userName.split(' ')[0];
  // Sync mobile topbar
  const pdNameMob = document.getElementById('pd-name-mob');
  if (pdNameMob) pdNameMob.textContent = userName;
  const pdRoleMob = document.getElementById('pd-role-mob');
  if (pdRoleMob) pdRoleMob.textContent = (userRole === 'guru' ? 'Guru' : 'Siswa') + ' · Level ' + level;
  const mobXp = document.getElementById('mob-xp-lbl');
  if (mobXp) mobXp.textContent = xp;
  const mobLvl = document.getElementById('mob-lvl-badge');
  if (mobLvl) mobLvl.textContent = level;
  const mobBar = document.getElementById('mob-xp-bar');
  if (mobBar) mobBar.style.width = Math.min(100, Math.round(xp/10)) + '%';
  renderAv('mini-av-svg');
  renderAv('profile-av-svg-mob');
  goScreen('sc-main');
  document.getElementById('mobile-bottom-nav').classList.add('on');
  setTimeout(() => mascotSay('home'), 800);
}

function renderAv(svgId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const isMale = ch.gender === 'male';
  const skin = ch.skin;
  const hc = '#3b2507';
  const hairLong = ch.hair === 'long';
  const hairCurly = ch.hair === 'curly';
  const oc = ch.outfit === 'school' ? (isMale ? '#2563eb' : '#dc2626') : (ch.outfit === 'hoodie' ? '#6d28d9' : '#64748b');
  const oc2 = ch.outfit === 'school' ? '#f1f5f9' : '#d1d5db';
  let hair = '';
  if (hairCurly) {
    hair = `<ellipse cx="60" cy="30" rx="25" ry="22" fill="${hc}"/><circle cx="38" cy="32" r="10" fill="${hc}"/><circle cx="82" cy="32" r="10" fill="${hc}"/>`;
  } else if (hairLong) {
    hair = `<ellipse cx="60" cy="26" rx="24" ry="20" fill="${hc}"/><rect x="37" y="32" width="10" height="${isMale ? 32 : 55}" rx="5" fill="${hc}"/><rect x="73" y="32" width="10" height="${isMale ? 32 : 55}" rx="5" fill="${hc}"/>`;
  } else {
    hair = `<ellipse cx="60" cy="22" rx="24" ry="16" fill="${hc}"/>`;
  }
  let acc = '';
  if (ch.acc === 'glasses') acc = `<rect x="43" y="51" width="14" height="10" rx="4" fill="none" stroke="#334155" stroke-width="2"/><rect x="63" y="51" width="14" height="10" rx="4" fill="none" stroke="#334155" stroke-width="2"/><line x1="57" y1="56" x2="63" y2="56" stroke="#334155" stroke-width="1.5"/>`;
  if (ch.acc === 'cap') acc = `<ellipse cx="60" cy="22" rx="26" ry="10" fill="${hc}"/><rect x="35" y="18" width="50" height="12" rx="6" fill="${hc}"/><rect x="84" y="24" width="12" height="6" rx="3" fill="${hc}"/>`;
  svg.innerHTML = `
    ${hair}
    <ellipse cx="60" cy="52" rx="22" ry="26" fill="${skin}"/>
    <ellipse cx="50" cy="55" rx="6" ry="7" fill="${skin}" opacity=".35"/>
    <ellipse cx="70" cy="55" rx="6" ry="7" fill="${skin}" opacity=".35"/>
    <circle cx="50" cy="53" r="2.2" fill="#0f172a"/>
    <circle cx="70" cy="53" r="2.2" fill="#0f172a"/>
    <circle cx="51" cy="52" r=".8" fill="#fff"/>
    <circle cx="71" cy="52" r=".8" fill="#fff"/>
    <ellipse cx="60" cy="47" rx="7" ry="5" fill="${skin}" opacity=".4"/>
    <path d="M52,63 Q60,68 68,63" stroke="#b45309" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${acc}
    <rect x="36" y="80" width="48" height="65" rx="10" fill="${oc}"/>
    <polygon points="48,80 60,96 72,80" fill="${oc2}"/>
    <rect x="28" y="82" width="14" height="50" rx="7" fill="${oc}"/>
    <rect x="78" y="82" width="14" height="50" rx="7" fill="${oc}"/>
    <rect x="38" y="138" width="20" height="38" rx="6" fill="${isMale ? '#1e3a5f' : '#881337'}"/>
    <rect x="62" y="138" width="20" height="38" rx="6" fill="${isMale ? '#1e3a5f' : '#881337'}"/>
    <rect x="38" y="168" width="20" height="8" rx="4" fill="#334155"/>
    <rect x="62" y="168" width="20" height="8" rx="4" fill="#334155"/>
  `;
}

// ===========================
// SIDEBAR + PANELS
// ===========================
let sbOpen = false;

function toggleSB() {
  sbOpen = !sbOpen; SFX.click();
  document.getElementById('sidebar').classList.toggle('open', sbOpen);
  document.getElementById('sb-overlay').classList.toggle('on', sbOpen && window.innerWidth <= 640);
}

function closeSBMobile() {
  sbOpen = false;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-overlay').classList.remove('on');
}

const panelTitles = { home: 'Beranda', belajar: 'Metode Belajar', pomo: 'Pomodoro Timer', flash: 'Flashcards', arena: 'Battle Arena', materi: 'Materi Belajar', agenda: 'Kalender Agenda' };
const panelSubs   = { home: 'Dashboard utama', belajar: 'Visual · Audio · Praktek', pomo: 'Teknik fokus 25 menit', flash: 'Buat & latih kartu belajarmu', arena: '1vs1 Bot atau Room Online', materi: 'Eksplorasi bab per kelas', agenda: 'Atur jadwal & pengingat belajar' };

function goPanel(name) {
  SFX.click();
  // Tutup sidebar di mobile setelah pilih panel
  if (window.innerWidth <= 640) closeSBMobile();
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
  document.getElementById('panel-' + name).classList.add('on');
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('act'));
  const ni = document.getElementById('ni-' + name);
  if (ni) ni.classList.add('act');
  document.getElementById('tb-title').textContent = panelTitles[name];
  document.getElementById('tb-sub').textContent = panelSubs[name];
  if (name === 'materi') renderMateri();
  document.querySelectorAll('.mbn-btn').forEach(b => b.classList.remove('act'));
  const mbn = document.getElementById('mbn-' + name);
  if (mbn) mbn.classList.add('act');
  setTimeout(() => mascotSay(name), 500);
}

// ===========================
// MODALS / DROPDOWNS
// ===========================
function openModal(id) { SFX.modalOpen(); document.getElementById(id).classList.add('on'); }
function closeModal(id) { SFX.click(); document.getElementById(id).classList.remove('on'); }
function toggleDD(id) { const el = document.getElementById(id); el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
function closeDD(id) { document.getElementById(id).style.display = 'none'; }

document.addEventListener('click', e => {
  if (!e.target.closest('#profile-btn') && !e.target.closest('#profile-dd')) closeDD('profile-dd');
});

// ===========================
// TOAST
// ===========================
let toastT;
function toast(msg) {
  SFX.toastPop();
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 2700);
}

// ===========================
// XP
// ===========================
function addXP(amt) {
  // Log XP change for history chart — save to localStorage + Firestore
  try {
    const xpLogs = JSON.parse(localStorage.getItem('ef_xp_history') || '[]');
    xpLogs.push({ ts: Date.now(), amt: amt, xpAfter: Math.max(0, xp + amt) });
    if (xpLogs.length > 500) xpLogs.splice(0, xpLogs.length - 500);
    localStorage.setItem('ef_xp_history', JSON.stringify(xpLogs));
    // Sync to Firestore per-user
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.saveXPHistory) {
      FirebaseSync.saveXPHistory(xpLogs);
    }
  } catch(e) {}

  if (amt >= 0) {
    xp += amt;
    if (xp >= 1000) { xp -= 1000; level++; SFX.levelUp(); toast('⚡ LEVEL UP! Kamu sekarang Level ' + level + '!'); }
  } else {
    // Negative XP — deduct but don't go below 0 within current level
    xp = Math.max(0, xp + amt);
    if (amt < 0) toast('💔 -' + Math.abs(amt) + ' XP');
  }
  const pct = Math.min(100, Math.round(xp / 10));
  document.getElementById('xp-bar-top').style.width = pct + '%';
  document.getElementById('xp-top-lbl').textContent = xp;
  document.getElementById('lvl-badge').textContent = level;
  document.getElementById('pd-role').textContent = (userRole === 'guru' ? 'Guru' : 'Siswa') + ' · Level ' + level;
  const mobXp = document.getElementById('mob-xp-lbl');
  if (mobXp) mobXp.textContent = xp;
  const mobLvl = document.getElementById('mob-lvl-badge');
  if (mobLvl) mobLvl.textContent = level;
  const mobBar = document.getElementById('mob-xp-bar');
  if (mobBar) mobBar.style.width = pct + '%';
}


// ===========================
// ACTIVITY LOGGER
// Logs mapel + duration to edufun_activity_logs for stat bars
// Also logs type for pomo/flash counts
// ===========================
function logActivity(mapel, mnt, type) {
  const KEY_MAP = {
    'Fisika': 'fisika',
    'Matematika': 'matematika',
    'Kimia': 'kimia',
    'Biologi': 'biologi',
    'Bahasa Inggris': 'bahasa_inggris',
    'B. Inggris': 'bahasa_inggris',
    'B. Indonesia': 'bahasa_indonesia',
    'Bahasa Indonesia': 'bahasa_indonesia',
    'Sejarah': 'sejarah',
    'Ekonomi': 'ekonomi',
    'Geografi': 'geografi',
    'Sosiologi': 'sosiologi',
    'bahasa_inggris': 'bahasa_inggris',
    'bahasa_indonesia': 'bahasa_indonesia',
    'fisika': 'fisika',
    'matematika': 'matematika',
    'kimia': 'kimia',
    'biologi': 'biologi',
    'sejarah': 'sejarah',
  };
  const normalizedMapel = KEY_MAP[mapel] || mapel.toLowerCase().replace(/[^a-z]/g, '_');
  try {
    const logs = JSON.parse(localStorage.getItem('edufun_activity_logs') || '[]');
    logs.push({ ts: Date.now(), mapel: normalizedMapel, mnt: mnt || 1, type: type || 'study' });
    if (logs.length > 1000) logs.splice(0, logs.length - 1000);
    localStorage.setItem('edufun_activity_logs', JSON.stringify(logs));
    // Sync to Firestore per-user
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.saveActivityLog) {
      FirebaseSync.saveActivityLog(logs);
    }
  } catch(e) {}
}

// ── Helper: re-render stat bars tanpa perlu tahu scale ──
function updateStatBarsSafe() {
  try {
    if (typeof renderStatBars === 'function' && typeof currentStatScale !== 'undefined') {
      renderStatBars(currentStatScale || 1);
    }
    if (typeof renderXPChart === 'function') renderXPChart(currentStatScale || 1);
  } catch(e) {}
}

// Current mapel for pomodoro (default Fisika, user can change)
let currentPomoMapel = 'Fisika';
function setPomoMapel(mapel, el) {
  currentPomoMapel = mapel;
  document.querySelectorAll('#pomo-mapel-tabs .chip').forEach(b => b.classList.remove('sel'));
  if (el) el.classList.add('sel');
}

// ===========================
// POMODORO
// ===========================
let pWork = 25, pBreak = 5, pSec = 25 * 60, pRunning = false, pMode = 'focus', pInterval = null, pSessions = 0, pXP = 0;
const PCIRC = 521;

function setPreset(w, b, el) {
  pWork = w; pBreak = b;
  document.querySelectorAll('[onclick^="setPreset"]').forEach(x => x.classList.remove('sel'));
  el.classList.add('sel');
  pReset(); document.getElementById('custom-p-box').style.display = 'none';
}

function toggleCustomP() { const b = document.getElementById('custom-p-box'); b.style.display = b.style.display === 'none' ? 'block' : 'none'; }

function applyCustomP() {
  pWork = Math.max(1, parseInt(document.getElementById('cp-work').value) || 25);
  pBreak = Math.max(1, parseInt(document.getElementById('cp-break').value) || 5);
  pReset(); toast(`Custom ${pWork}/${pBreak} mnt!`);
}

function pToggle() {
  if (!pRunning) {
    SFX.click(); pRunning = true;
    document.getElementById('p-btn').textContent = '⏸ Pause';
    pInterval = setInterval(pTick, 1000);
  } else {
    SFX.click(); pRunning = false;
    clearInterval(pInterval);
    document.getElementById('p-btn').textContent = '▶ Lanjut';
  }
}

function pTick() {
  pSec--;
  if (pSec > 0 && pSec <= 5) SFX.timerUrgent();
  else if (pSec > 0 && pSec % 60 === 0) SFX.timerBeep();
  if (pSec <= 0) {
    clearInterval(pInterval); pRunning = false;
    document.getElementById('p-btn').textContent = '▶ Mulai';
    if (pMode === 'focus') {
      pSessions++;
      document.getElementById('p-sessions').textContent = pSessions;
      pXP += 50; document.getElementById('p-xp').textContent = pXP;
      addXP(50);
      document.getElementById('h-pomo-stat').textContent = pSessions + ' sesi hari ini';
      // Log activity for stat bars
      logActivity(currentPomoMapel, pWork, 'pomo');
      // Sync ke Firestore
      if (typeof FirebaseSync !== 'undefined') {
        FirebaseSync.onPomodoroComplete();
        FirebaseSync.saveXPLevel(xp, level);
      }
      pMode = 'break'; pSec = pBreak * 60;
      document.getElementById('p-mode').textContent = '☕ Istirahat';
      SFX.pomoDone(); toast('☕ Sesi selesai! Istirahat ' + pBreak + ' menit!');
    } else {
      pMode = 'focus'; pSec = pWork * 60;
      document.getElementById('p-mode').textContent = '🍅 Fokus';
      SFX.pomoDone(); toast('🍅 Istirahat selesai!');
    }
  }
  pRenderUI();
}

function pRenderUI() {
  const total = (pMode === 'focus' ? pWork : pBreak) * 60;
  const pct = pSec / total;
  const m = Math.floor(pSec / 60), s = pSec % 60;
  document.getElementById('p-disp').textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  document.getElementById('pr-ring').style.strokeDashoffset = PCIRC * (1 - pct);
  document.getElementById('p-prog').style.width = (pct * 100) + '%';
}

function pReset() {
  clearInterval(pInterval); pRunning = false; pMode = 'focus'; pSec = pWork * 60;
  document.getElementById('p-btn').textContent = '▶ Mulai';
  document.getElementById('p-mode').textContent = '🍅 Fokus';
  pRenderUI();
}

function pSkip() {
  clearInterval(pInterval); pRunning = false;
  document.getElementById('p-btn').textContent = '▶ Mulai';
  if (pMode === 'focus') { pMode = 'break'; pSec = pBreak * 60; document.getElementById('p-mode').textContent = '☕ Istirahat'; }
  else { pMode = 'focus'; pSec = pWork * 60; document.getElementById('p-mode').textContent = '🍅 Fokus'; }
  pRenderUI();
}

// ===========================
// FLASHCARDS
// ===========================
let cards = JSON.parse(localStorage.getItem('ef_cards') || '[]');
let fcIdx = 0, fcFlipped = false;

function saveCards() {
  localStorage.setItem('ef_cards', JSON.stringify(cards));
  document.getElementById('h-flash-stat').textContent = cards.length + ' kartu';
  if (typeof FirebaseSync !== 'undefined') FirebaseSync.saveCards(cards);
}

function addCard() {
  const f = document.getElementById('fc-front').value.trim();
  const b = document.getElementById('fc-back').value.trim();
  const c = document.getElementById('fc-cat').value;
  if (!f || !b) { SFX.wrong(); toast('❗ Isi pertanyaan & jawaban!'); return; }
  cards.push({ f, b, c, id: Date.now() });
  saveCards(); renderFCList();
  document.getElementById('fc-front').value = '';
  document.getElementById('fc-back').value = '';
  SFX.correct(); toast('✅ Kartu ditambahkan!'); addXP(5);
}

function renderFCList() {
  const l = document.getElementById('fc-list');
  document.getElementById('fc-count').textContent = cards.length;
  if (!cards.length) {
    l.innerHTML = '<div style="text-align:center;padding:1.5rem;color:#94a3b8;font-size:.84rem;border:1.5px dashed #e2e8f0;border-radius:12px">Belum ada kartu.</div>';
    document.getElementById('fc-start-wrap').style.display = 'none';
    document.getElementById('fc-study').style.display = 'none';
    return;
  }
  l.innerHTML = cards.map((c, i) => `<div style="display:flex;align-items:flex-start;gap:.65rem;background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:.7rem .9rem;transition:border-color .15s" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="this.style.borderColor='#e2e8f0'"><div style="flex:1"><div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.2rem"><span style="font-size:.68rem;font-weight:700;background:var(--ac-l);color:var(--ac);padding:.12rem .45rem;border-radius:99px;border:1px solid var(--ac-m)">${c.c}</span></div><div style="font-weight:700;font-size:.84rem">${c.f}</div><div style="font-size:.76rem;color:#64748b">${c.b}</div></div><button onclick="delCard(${i})" style="background:none;border:none;cursor:pointer;color:#94a3b8;padding:.15rem;border-radius:6px;font-size:.9rem" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">✕</button></div>`).join('');
  document.getElementById('fc-start-wrap').style.display = 'block';
}

function delCard(i) { cards.splice(i, 1); saveCards(); renderFCList(); toast('Kartu dihapus'); }

function startStudy() {
  fcIdx = 0; fcFlipped = false;
  document.getElementById('fc-study').style.display = 'block';
  renderFCCard();
  document.getElementById('fc-study').scrollIntoView({ behavior: 'smooth' });
}

function renderFCCard() {
  document.getElementById('fc-card').classList.remove('fl'); fcFlipped = false;
  if (!cards.length) return;
  document.getElementById('fc-q').textContent = cards[fcIdx].f;
  document.getElementById('fc-a').textContent = cards[fcIdx].b;
  document.getElementById('fc-prog-lbl').textContent = (fcIdx + 1) + '/' + cards.length;
}

function flipFC() { SFX.cardFlip(); fcFlipped = !fcFlipped; document.getElementById('fc-card').classList.toggle('fl', fcFlipped); if (fcFlipped) { addXP(2); logActivity(currentFcMapel !== 'semua' ? currentFcMapel : 'Fisika', 1, 'flash'); } }
function nextFC() {
  const wasLast = fcIdx === cards.length - 1;
  fcIdx = (fcIdx + 1) % cards.length;
  renderFCCard();
  if (wasLast && cards.length > 0) {
    // Selesai satu putaran study
    if (typeof FirebaseSync !== 'undefined') {
      FirebaseSync.onFlashStudyDone(cards.length, cards.length);
      FirebaseSync.saveXPLevel(xp, level);
    }
  }
}
function prevFC() { fcIdx = (fcIdx - 1 + cards.length) % cards.length; renderFCCard(); }
function shuffleFC() { for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; } fcIdx = 0; renderFCCard(); toast('🔀 Diacak!'); }

renderFCList();

// Callback untuk Firestore realtime update flashcards
window._refreshFlashCards = function() {
  const fresh = JSON.parse(localStorage.getItem('ef_cards') || '[]');
  if (JSON.stringify(cards) !== JSON.stringify(fresh)) {
    cards = fresh;
    renderFCList();
    document.getElementById('h-flash-stat').textContent = cards.length + ' kartu';
  }
};

// ===========================
let btPHP = 100, btEHP = 100, btQ = 0, btTimer = 15, btInterval = null, btAnswered = false, btXpWin = 30, btMode = 'bot';

// Render avatar ke SVG menggunakan data karakter tertentu (bukan global `ch`)
function renderAvWithData(svgId, data) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const isMale = data.gender === 'male';
  const skin = data.skin;
  const hc = data.hairColor || '#3b2507';
  const hairLong = data.hair === 'long';
  const hairCurly = data.hair === 'curly';
  const oc = data.outfit === 'school' ? (isMale ? '#2563eb' : '#dc2626') : (data.outfit === 'hoodie' ? '#6d28d9' : '#64748b');
  const oc2 = data.outfit === 'school' ? '#f1f5f9' : '#d1d5db';
  let hair = '';
  if (hairCurly) {
    hair = `<ellipse cx="60" cy="30" rx="25" ry="22" fill="${hc}"/><circle cx="38" cy="32" r="10" fill="${hc}"/><circle cx="82" cy="32" r="10" fill="${hc}"/>`;
  } else if (hairLong) {
    hair = `<ellipse cx="60" cy="26" rx="24" ry="20" fill="${hc}"/><rect x="37" y="32" width="10" height="${isMale ? 32 : 55}" rx="5" fill="${hc}"/><rect x="73" y="32" width="10" height="${isMale ? 32 : 55}" rx="5" fill="${hc}"/>`;
  } else {
    hair = `<ellipse cx="60" cy="22" rx="24" ry="16" fill="${hc}"/>`;
  }
  let acc = '';
  if (data.acc === 'glasses') acc = `<rect x="43" y="51" width="14" height="10" rx="4" fill="none" stroke="#334155" stroke-width="2"/><rect x="63" y="51" width="14" height="10" rx="4" fill="none" stroke="#334155" stroke-width="2"/><line x1="57" y1="56" x2="63" y2="56" stroke="#334155" stroke-width="1.5"/>`;
  if (data.acc === 'cap') acc = `<ellipse cx="60" cy="22" rx="26" ry="10" fill="${hc}"/><rect x="35" y="18" width="50" height="12" rx="6" fill="${hc}"/><rect x="84" y="24" width="12" height="6" rx="3" fill="${hc}"/>`;
  svg.innerHTML = `
    ${hair}
    <ellipse cx="60" cy="52" rx="22" ry="26" fill="${skin}"/>
    <ellipse cx="50" cy="55" rx="6" ry="7" fill="${skin}" opacity=".35"/>
    <ellipse cx="70" cy="55" rx="6" ry="7" fill="${skin}" opacity=".35"/>
    <circle cx="50" cy="53" r="2.2" fill="#0f172a"/>
    <circle cx="70" cy="53" r="2.2" fill="#0f172a"/>
    <circle cx="51" cy="52" r=".8" fill="#fff"/>
    <circle cx="71" cy="52" r=".8" fill="#fff"/>
    <ellipse cx="60" cy="47" rx="7" ry="5" fill="${skin}" opacity=".4"/>
    <path d="M52,63 Q60,68 68,63" stroke="#b45309" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${acc}
    <rect x="36" y="80" width="48" height="65" rx="10" fill="${oc}"/>
    <polygon points="48,80 60,96 72,80" fill="${oc2}"/>
    <rect x="28" y="82" width="14" height="50" rx="7" fill="${oc}"/>
    <rect x="78" y="82" width="14" height="50" rx="7" fill="${oc}"/>
    <rect x="38" y="138" width="20" height="38" rx="6" fill="${isMale ? '#1e3a5f' : '#881337'}"/>
    <rect x="62" y="138" width="20" height="38" rx="6" fill="${isMale ? '#1e3a5f' : '#881337'}"/>
    <rect x="38" y="168" width="20" height="8" rx="4" fill="#334155"/>
    <rect x="62" y="168" width="20" height="8" rx="4" fill="#334155"/>
  `;
}

// Render bot SVG (robot style)
function renderBotSvg(svgId) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  svg.innerHTML = `
    <rect x="36" y="10" width="48" height="42" rx="10" fill="#334155"/>
    <rect x="44" y="18" width="14" height="10" rx="3" fill="#38bdf8"/>
    <rect x="62" y="18" width="14" height="10" rx="3" fill="#38bdf8"/>
    <rect x="52" y="32" width="16" height="6" rx="3" fill="#94a3b8"/>
    <rect x="30" y="14" width="8" height="4" rx="2" fill="#94a3b8"/>
    <rect x="82" y="14" width="8" height="4" rx="2" fill="#94a3b8"/>
    <circle cx="60" cy="8" r="5" fill="#64748b"/>
    <rect x="36" y="80" width="48" height="65" rx="10" fill="#475569"/>
    <rect x="48" y="88" width="24" height="14" rx="5" fill="#38bdf8"/>
    <rect x="28" y="82" width="14" height="50" rx="7" fill="#475569"/>
    <rect x="78" y="82" width="14" height="50" rx="7" fill="#475569"/>
    <rect x="38" y="138" width="20" height="38" rx="6" fill="#334155"/>
    <rect x="62" y="138" width="20" height="38" rx="6" fill="#334155"/>
    <rect x="38" y="168" width="20" height="8" rx="4" fill="#1e293b"/>
    <rect x="62" y="168" width="20" height="8" rx="4" fill="#1e293b"/>
    <ellipse cx="60" cy="52" rx="22" ry="26" fill="#475569"/>
  `;
}

// Generate karakter random untuk lawan (room)
function generateRandomChar() {
  const skins = ['#FDDBB4','#F5C5A3','#D4956A','#A0522D','#8B6914','#FFEAC2'];
  const hairs = ['short','long','curly'];
  const outfits = ['school','hoodie','casual'];
  const accs = ['none','none','glasses','cap'];
  const hairColors = ['#3b2507','#1a1a1a','#7c3d12','#b45309','#dc2626','#7c3aed'];
  const genders = ['male','female'];
  return {
    gender: genders[Math.floor(Math.random() * genders.length)],
    skin: skins[Math.floor(Math.random() * skins.length)],
    hair: hairs[Math.floor(Math.random() * hairs.length)],
    outfit: outfits[Math.floor(Math.random() * outfits.length)],
    acc: accs[Math.floor(Math.random() * accs.length)],
    hairColor: hairColors[Math.floor(Math.random() * hairColors.length)]
  };
}

const btQs = {
  Matematika: [
    { q: '3² + 4² = ?', o: ['25','24','21','16'], a: 0 },
    { q: 'Berapa nilai π (pi) hingga 2 desimal?', o: ['3.12','3.14','3.16','3.18'], a: 1 },
    { q: '√144 = ?', o: ['11','12','13','14'], a: 1 },
    { q: '2x + 4 = 10, x = ?', o: ['2','3','4','5'], a: 1 }
  ],
  Fisika: [
    { q: 'F = m × a adalah hukum Newton ke-?', o: ['1','2','3','4'], a: 1 },
    { q: 'Satuan energi dalam SI adalah?', o: ['Watt','Newton','Joule','Pascal'], a: 2 },
    { q: 'Cahaya merambat dengan kecepatan...?', o: ['3×10⁶ m/s','3×10⁸ m/s','3×10¹⁰ m/s','3×10⁴ m/s'], a: 1 },
    { q: 'Rumus kecepatan adalah?', o: ['v=at','v=s/t','v=F/m','v=mgh'], a: 1 }
  ],
  Kimia: [
    { q: 'Lambang kimia untuk air adalah?', o: ['HO','H²O','H2O','HO2'], a: 2 },
    { q: 'Berapa jumlah proton dalam oksigen?', o: ['6','7','8','9'], a: 2 },
    { q: 'Asam klorida memiliki rumus?', o: ['HCl','H2SO4','HNO3','H3PO4'], a: 0 },
    { q: 'pH asam di bawah angka?', o: ['14','10','7','3'], a: 2 }
  ],
  'B. Inggris': [
    { q: '"She ___ to school every day."', o: ['go','goes','gone','going'], a: 1 },
    { q: 'Past tense dari "eat" adalah?', o: ['eated','ate','eaten','eating'], a: 1 },
    { q: 'Antonim dari "ancient" adalah?', o: ['old','modern','historic','antique'], a: 1 }
  ],
  'B. Indonesia': [
    { q: 'Majas yang membandingkan dua hal dengan kata "seperti" disebut?', o: ['Metafora','Simile','Personifikasi','Hiperbola'], a: 1 },
    { q: '"Tangan kanan" dalam peribahasa berarti?', o: ['Tangan dominan','Orang kepercayaan','Pemberian','Kekuatan'], a: 1 }
  ],
  Biologi: [
    { q: 'Organel sel yang disebut "powerhouse of the cell" adalah?', o: ['Ribosom','Nukleus','Mitokondria','Lisosom'], a: 2 },
    { q: 'Proses fotosintesis menghasilkan?', o: ['CO2 & H2O','Glukosa & O2','ATP & ADP','Protein & Lemak'], a: 1 },
    { q: 'DNA tersimpan di dalam?', o: ['Mitokondria','Ribosom','Nukleus','Sitoplasma'], a: 2 }
  ]
};

function showArenaMode(mode) {
  ['sel','bot','room','game','buat-room','join-room','private-lobby'].forEach(m => {
    const el = document.getElementById('arena-' + (m==='sel'?'mode-sel':m==='bot'?'bot-sel':m==='room'?'room-sel':m==='game'?'game':m==='buat-room'?'buat-room':m==='join-room'?'join-room':'private-lobby'));
    if (el) el.style.display = (m === mode || (m==='sel'&&mode==='sel')) ? 'block' : 'none';
  });
  if (mode === 'join-room') { setTimeout(() => document.getElementById('join-room-input').focus(), 100); }
}

// ═══════════════════════════════════════════════════════
// PRIVATE ROOM SYSTEM (localStorage-based, auto-delete)
// ═══════════════════════════════════════════════════════
let brMapel = 'Matematika', brLevel = 'Mudah', brSize = 2, brCode = '', brPollIv = null;

function setBrMapel(v, btn) {
  brMapel = v;
  document.querySelectorAll('#br-mapel-tabs .chip').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}
function setBrLevel(v, btn) {
  brLevel = v;
  document.querySelectorAll('#br-level-tabs .chip').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}
function setBrSize(v, btn) {
  brSize = v;
  document.querySelectorAll('#br-size-tabs .chip').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length:6}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
}

// ═══════════════════════════════════════════════════════════════
// PRIVATE ROOM SYSTEM — Firestore Realtime (multi-device)
// Rooms disimpan di Firestore collection "rooms/{code}"
// sehingga bisa diakses antar device / browser
// ═══════════════════════════════════════════════════════════════

let _roomListener = null; // onSnapshot unsubscribe

function _roomRef(code) {
  return fbDB.collection('rooms').doc(code);
}

async function generatePrivateRoom() {
  const code = generateRoomCode();
  const playerId = userName || 'Pemain';
  const uid = (typeof Auth !== 'undefined' && Auth.getSession()) ? Auth.getSession().uid : playerId;

  const roomData = {
    code,
    mapel: brMapel,
    level: brLevel,
    maxPlayers: brSize,
    created: Date.now(),
    players: {
      [uid]: { name: playerId, uid, joined: Date.now(), left: false }
    }
  };

  try {
    await _roomRef(code).set(roomData);
    brCode = code;
    document.getElementById('br-code-text').textContent = code;
    document.getElementById('br-code-meta').textContent = brMapel + ' · ' + brLevel + ' · Maks. ' + brSize + ' pemain · Auto-hapus jika kosong';
    document.getElementById('br-code-display').style.display = '';
    toast('✅ Room dibuat! Bagikan kode ke teman.');
  } catch(e) {
    console.error('[Room] gagal buat room:', e);
    toast('❌ Gagal membuat room. Cek koneksi.');
  }
}

function copyRoomCode() {
  const code = document.getElementById('br-code-text')?.textContent || document.getElementById('priv-room-code')?.textContent || brCode;
  if (navigator.clipboard) { navigator.clipboard.writeText(code).then(() => toast('📋 Kode ' + code + ' disalin!')); }
  else { toast('Kode: ' + code); }
}

function enterPrivateRoom() {
  if (!brCode) return;
  openPrivateLobby(brCode);
}

async function joinPrivateRoom() {
  const code = (document.getElementById('join-room-input').value || '').trim().toUpperCase();
  const statusEl = document.getElementById('join-room-status');
  if (code.length !== 6) { statusEl.textContent = '⚠️ Masukkan kode 6 digit'; statusEl.style.color = '#ef4444'; return; }

  statusEl.textContent = '🔍 Mencari room...';
  statusEl.style.color = '#64748b';

  try {
    const snap = await _roomRef(code).get();
    if (!snap.exists) {
      statusEl.textContent = '❌ Kode tidak ditemukan atau room sudah dihapus';
      statusEl.style.color = '#ef4444';
      return;
    }
    const room = snap.data();
    const players = Object.values(room.players || {}).filter(p => !p.left);
    if (players.length >= room.maxPlayers) {
      statusEl.textContent = '❌ Room sudah penuh (' + room.maxPlayers + '/' + room.maxPlayers + ')';
      statusEl.style.color = '#ef4444';
      return;
    }
    // Gabung ke room
    const playerId = userName || 'Pemain';
    const uid = (typeof Auth !== 'undefined' && Auth.getSession()) ? Auth.getSession().uid : (playerId + '_' + Date.now());
    await _roomRef(code).update({
      ['players.' + uid]: { name: playerId, uid, joined: Date.now(), left: false }
    });
    brCode = code;
    statusEl.textContent = '';
    openPrivateLobby(code);
  } catch(e) {
    console.error('[Room] gagal join room:', e);
    statusEl.textContent = '❌ Gagal bergabung. Cek koneksi.';
    statusEl.style.color = '#ef4444';
  }
}

function openPrivateLobby(code) {
  // Stop listener lama jika ada
  if (_roomListener) { _roomListener(); _roomListener = null; }
  if (brPollIv) { clearInterval(brPollIv); brPollIv = null; }

  showArenaMode('private-lobby');
  document.getElementById('priv-room-code').textContent = code;
  document.getElementById('priv-players-list').innerHTML = '<div style="text-align:center;padding:1rem;color:#94a3b8">⏳ Memuat...</div>';

  // Realtime listener ke Firestore
  _roomListener = _roomRef(code).onSnapshot((snap) => {
    if (!snap.exists) {
      if (_roomListener) { _roomListener(); _roomListener = null; }
      toast('⚠️ Room sudah dihapus');
      showArenaMode('sel');
      return;
    }
    const room = snap.data();
    document.getElementById('priv-room-meta').textContent =
      room.mapel + ' · ' + room.level + ' · Maks. ' + room.maxPlayers + ' pemain';
    _renderPrivatePlayersFromData(room);
  }, (err) => {
    console.error('[Room] listener error:', err);
    toast('❌ Koneksi room terputus');
    showArenaMode('sel');
  });
}

function _renderPrivatePlayersFromData(room) {
  const players = Object.values(room.players || {}).filter(p => !p.left);
  const list = document.getElementById('priv-players-list');
  list.innerHTML = players.map((p, i) => `
    <div style="display:flex;align-items:center;gap:.65rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:.5rem .75rem">
      <div style="width:30px;height:30px;border-radius:50%;background:var(--ac-l);border:2px solid var(--ac-m);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.78rem;color:var(--ac)">${i+1}</div>
      <div style="flex:1;font-weight:700;font-size:.84rem">${p.name}</div>
      <div style="font-size:.7rem;color:#22c55e;font-weight:700">🟢 Online</div>
    </div>`).join('') +
    (players.length < room.maxPlayers
      ? `<div style="text-align:center;padding:.5rem;color:#94a3b8;font-size:.76rem;border:1.5px dashed #e2e8f0;border-radius:10px">⏳ Menunggu ${room.maxPlayers - players.length} pemain lagi...</div>`
      : '');
  const statusEl = document.getElementById('priv-room-status');
  const startBtn = document.getElementById('priv-start-btn');
  if (players.length >= 2) {
    statusEl.textContent = '✅ ' + players.length + ' pemain siap! Bisa mulai battle.';
    statusEl.style.background = '#f0fdf4'; statusEl.style.borderColor = '#bbf7d0'; statusEl.style.color = '#166534';
    startBtn.disabled = false; startBtn.style.opacity = '1'; startBtn.style.cursor = 'pointer';
    // Simpan room data untuk dipakai startPrivateBattle
    window._currentRoom = room;
  } else {
    statusEl.textContent = '⏳ Menunggu pemain lain bergabung...';
    statusEl.style.background = '#fffbeb'; statusEl.style.borderColor = '#fde68a'; statusEl.style.color = '#92400e';
    startBtn.disabled = true; startBtn.style.opacity = '.5'; startBtn.style.cursor = 'not-allowed';
    window._currentRoom = room;
  }
}

async function leavePrivateRoom() {
  if (_roomListener) { _roomListener(); _roomListener = null; }
  if (brPollIv) { clearInterval(brPollIv); brPollIv = null; }
  if (brCode) {
    try {
      const uid = (typeof Auth !== 'undefined' && Auth.getSession()) ? Auth.getSession().uid : (userName || 'Pemain');
      await _roomRef(brCode).update({
        ['players.' + uid + '.left']: true
      });
      // Cek apakah semua left → hapus room
      const snap = await _roomRef(brCode).get();
      if (snap.exists) {
        const room = snap.data();
        const anyActive = Object.values(room.players || {}).some(p => !p.left);
        if (!anyActive) await _roomRef(brCode).delete();
      }
    } catch(e) { console.warn('[Room] leavePrivateRoom error:', e); }
    brCode = '';
  }
  showArenaMode('sel');
}

function startPrivateBattle() {
  if (_roomListener) { _roomListener(); _roomListener = null; }
  if (brPollIv) { clearInterval(brPollIv); brPollIv = null; }
  const room = window._currentRoom;
  if (!room) { toast('❌ Room tidak ditemukan'); showArenaMode('sel'); return; }
  const players = Object.values(room.players || {}).filter(p => !p.left);
  const myName = userName || 'Pemain';
  const opponent = players.find(p => p.name !== myName);
  btMode = 'room'; btXpWin = 50;
  document.getElementById('bt-e-name').textContent = '👤 ' + (opponent ? opponent.name : 'Teman');
  document.getElementById('bt-e-label').textContent = '👤 ' + (opponent ? opponent.name : 'Teman');
  window._btDifficulty = room.level;
  window._btIsBot = false;
  window._btRandChar = generateRandomChar();
  // ── LOG: masuk private room — catat mapel ke stat ──
  logActivity(room.mapel, 1, 'room_join');
  updateStatBarsSafe();
  toast('⚔️ Battle dimulai dengan teman!');
  startBattle(room.mapel, room.level);
}


function startBotBattle(diff, subj, botAcc) {
  btMode = 'bot'; btXpWin = diff === 'Mudah' ? 15 : (diff === 'Sedang' ? 30 : 60);
  document.getElementById('bt-e-name').textContent = '🤖 Bot ' + diff;
  document.getElementById('bt-e-label').textContent = '🤖 Bot ' + diff;
  window._btBotAcc = botAcc;
  window._btDifficulty = diff;
  window._btIsBot = true;
  // ── LOG: masuk room bot — catat mapel ke stat ──
  logActivity(subj, 1, 'room_join');
  updateStatBarsSafe();
  startBattle(subj, diff);
}

function joinRoom(subj) {
  btMode = 'room'; btXpWin = 40;
  const names = ['Dini','Budi','Mega','Arif','Sari','Dewi'];
  const oppName = names[Math.floor(Math.random() * names.length)];
  document.getElementById('bt-e-name').textContent = '👤 ' + oppName;
  document.getElementById('bt-e-label').textContent = '👤 ' + oppName;
  window._btDifficulty = 'Sedang';
  window._btIsBot = false;
  window._btRandChar = generateRandomChar();
  // ── LOG: masuk room — catat mapel ke stat ──
  logActivity(subj, 1, 'room_join');
  updateStatBarsSafe();
  toast('⚔️ Mencari lawan di room ' + subj + '...');
  setTimeout(() => { toast('🎮 Lawan ditemukan! Battle dimulai!'); startBattle(subj, 'Sedang'); }, 1000);
}

async function startBattle(subj, difficulty) {
  btPHP = 100; btEHP = 100; btQ = 0; btAnswered = false;
  const playerFirstName = userName.split(' ')[0];
  document.getElementById('bt-p-name').textContent = playerFirstName;
  document.getElementById('bt-p-label').textContent = playerFirstName;
  document.getElementById('bt-p-hp').textContent = '100 HP';
  document.getElementById('bt-e-hp').textContent = '100 HP';
  document.getElementById('bt-p-bar').style.width = '100%';
  document.getElementById('bt-e-bar').style.width = '100%';
  document.getElementById('bt-p-bar').style.background = 'linear-gradient(90deg,#22c55e,#86efac)';
  document.getElementById('bt-e-bar').style.background = 'linear-gradient(90deg,#ef4444,#fca5a5)';

  // Render karakter pemain (dari data sign-in)
  renderAvWithData('bt-player-svg', ch);

  // Render karakter lawan
  if (window._btIsBot) {
    renderBotSvg('bt-enemy-svg');
  } else {
    renderAvWithData('bt-enemy-svg', window._btRandChar || generateRandomChar());
  }

  showArenaMode('game');
  SFX.battleStart();

  const diff = difficulty || window._btDifficulty || 'Sedang';

  // Tampilkan loading di log
  const logEl = document.getElementById('bt-log');
  logEl.textContent = '📚 Memuat soal...';

  // Hapus cache agar soal selalu fresh setiap battle
  GeminiQuiz.clearCache(subj, diff);

  // Load soal (Gemini atau fallback)
  const qs = await GeminiQuiz.getQuestions(subj, diff);
  window._btQs = qs;
  window._btSubj = subj;

  logEl.textContent = '⚡ Battle dimulai! Pilih jawaban sebelum waktu habis!';
  setTimeout(() => SFX.startBattleBg(), 300);
  renderBQ();
}

function renderBQ() {
  if (btQ >= window._btQs.length) btQ = 0;
  btAnswered = false;
  const q = window._btQs[btQ];
  document.getElementById('bt-q').textContent = q.q;
  const opts = document.getElementById('bt-opts');
  opts.innerHTML = q.o.map((o, i) => `<button onclick="answerBattle(${i})" style="padding:.5rem;border:1.5px solid #e2e8f0;border-radius:10px;background:#fff;font-weight:700;font-size:.82rem;cursor:pointer;font-family:inherit;transition:all .15s;text-align:left" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="if(!this.dataset.locked)this.style.borderColor='#e2e8f0'">${o}</button>`).join('');
  btTimer = 15; document.getElementById('bt-timer').textContent = btTimer;
  document.getElementById('bt-timer').classList.remove('urgent');
  clearInterval(btInterval);
  btInterval = setInterval(() => {
    btTimer--; document.getElementById('bt-timer').textContent = btTimer;
    if (btTimer <= 5) { SFX.timerUrgent(); document.getElementById('bt-timer').classList.add('urgent'); }
    else if (btTimer === 10 || btTimer === 5) SFX.timerBeep();
    if (btTimer <= 0) { clearInterval(btInterval); if (!btAnswered) btTimeout(); }
  }, 1000);
  const botAcc = window._btBotAcc || 0.55;
  setTimeout(() => {
    if (!btAnswered) {
      const correct = Math.random() < botAcc;
      if (correct) {
        btPHP = Math.max(0, btPHP - 20); updateHP();
        const playerSvg = document.getElementById('bt-player-svg');
        if (playerSvg) { playerSvg.classList.remove('char-hit'); void playerSvg.offsetWidth; playerSvg.classList.add('char-hit'); }
        document.getElementById('bt-log').textContent = '🤖 Bot menjawab benar! -20 HP kamu!';
        if (btPHP <= 0) { btAnswered = true; clearInterval(btInterval); setTimeout(finishBattle, 900); return; }
      } else {
        document.getElementById('bt-log').textContent = '🤖 Bot salah! Kamu selamat!';
      }
    }
  }, Math.random() * 5000 + 3000);
}

function answerBattle(idx) {
  if (btAnswered) return;
  btAnswered = true; clearInterval(btInterval);
  const q = window._btQs[btQ];
  const btns = document.querySelectorAll('#bt-opts button');
  btns.forEach(b => b.style.cursor = 'default');
  btns[q.a].style.borderColor = '#22c55e'; btns[q.a].style.background = '#f0fdf4'; btns[q.a].style.color = '#166534';
  if (idx === q.a) {
    SFX.correct();
    btEHP = Math.max(0, btEHP - 25);
    document.getElementById('bt-log').textContent = '✅ Benar! Bot -25 HP! +' + Math.round(btXpWin / 2) + ' XP';
    addXP(Math.round(btXpWin / 2));
    // Animasi: enemy kena hit, player menang pose
    const enemySvg = document.getElementById('bt-enemy-svg');
    if (enemySvg) { enemySvg.classList.remove('char-hit-r'); void enemySvg.offsetWidth; enemySvg.classList.add('char-hit-r'); }
    const playerSvg = document.getElementById('bt-player-svg');
    if (playerSvg) { playerSvg.classList.remove('char-win'); void playerSvg.offsetWidth; playerSvg.classList.add('char-win'); }
  } else {
    SFX.wrong();
    btns[idx].style.borderColor = '#ef4444'; btns[idx].style.background = '#fef2f2'; btns[idx].style.color = '#991b1b';
    btPHP = Math.max(0, btPHP - 20);
    const wrongPenalty = Math.round(btXpWin / 2 * 3);
    addXP(-wrongPenalty);
    document.getElementById('bt-log').textContent = '❌ Salah! -20 HP, -' + wrongPenalty + ' XP. Jawaban benar: ' + q.o[q.a];
    // Animasi: player kena hit
    const playerSvg = document.getElementById('bt-player-svg');
    if (playerSvg) { playerSvg.classList.remove('char-hit'); void playerSvg.offsetWidth; playerSvg.classList.add('char-hit'); }
  }
  updateHP();
  if (btPHP <= 0 || btEHP <= 0) { setTimeout(finishBattle, 1200); return; }
  btQ++; setTimeout(renderBQ, 1600);
}

function btTimeout() {
  SFX.timeOut(); btPHP = Math.max(0, btPHP - 15);
  document.getElementById('bt-timer').classList.remove('urgent');
  document.getElementById('bt-log').textContent = '⏰ Waktu habis! -15 HP';
  const playerSvg = document.getElementById('bt-player-svg');
  if (playerSvg) { playerSvg.classList.remove('char-hit'); void playerSvg.offsetWidth; playerSvg.classList.add('char-hit'); }
  updateHP();
  if (btPHP <= 0) { setTimeout(finishBattle, 800); return; }
  btQ++; setTimeout(renderBQ, 1200);
}

function updateHP() {
  document.getElementById('bt-p-bar').style.width = btPHP + '%';
  document.getElementById('bt-e-bar').style.width = btEHP + '%';
  document.getElementById('bt-p-hp').textContent = btPHP + ' HP';
  document.getElementById('bt-e-hp').textContent = btEHP + ' HP';
  document.getElementById('bt-p-bar').style.background = btPHP < 30
    ? 'linear-gradient(90deg,#ef4444,#fca5a5)'
    : 'linear-gradient(90deg,#22c55e,#86efac)';
}

function finishBattle() {
  clearInterval(btInterval);
  SFX.stopBattleBg();
  document.getElementById('bt-timer').classList.remove('urgent');
  const won = btEHP <= 0 || (btPHP > 0 && btPHP > btEHP);
  const xpPenalty = Math.round(btXpWin * 3);
  document.getElementById('bt-log').textContent = won ? '🏆 MENANG! +' + btXpWin + ' XP! 🎉' : '💀 Kalah! -' + xpPenalty + ' XP!';
  if (won) { SFX.win(); addXP(btXpWin); const el = document.getElementById('lb-my-xp'); el.textContent = parseInt(el.textContent) + btXpWin; }
  else { SFX.lose(); addXP(-xpPenalty); }
  // Log activity for stat bars — count ~5 mnt per battle per soal answered
  logActivity(window._btSubj || 'Fisika', Math.max(2, btQ), 'battle');
  // Sync battle result ke Firestore
  if (typeof FirebaseSync !== 'undefined') {
    FirebaseSync.onBattleResult(won, won ? btXpWin : 0);
    FirebaseSync.saveXPLevel(xp, level);
  }
  setTimeout(() => showArenaMode('sel'), 2500);
}

function endBattle() {
  clearInterval(btInterval); SFX.stopBattleBg();
  document.getElementById('bt-timer').classList.remove('urgent');
  showArenaMode('sel');
}

// ===========================
// METODE BELAJAR
// ===========================
function setMethod(m) {
  ['visual', 'audio', 'praktek'].forEach(x => {
    document.getElementById('m-' + x).style.display = m === x ? 'block' : 'none';
    document.getElementById('mt-' + x).classList.toggle('sel', m === x);
  });
  if (m === 'audio') { setTimeout(initAudioContent, 50); }
}

// ═══════════════════════════════════════════════════════
// MUSIK — Web Audio API Synthesizer (no YouTube needed)
// 3 tracks: Focus Zone, Battle Ready, Deep Study
// ═══════════════════════════════════════════════════════
let musAudioCtx = null;
let musNodes = []; // active oscillators / noise sources
let musPlaying = -1;

function musGetCtx() {
  if (!musAudioCtx) musAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (musAudioCtx.state === 'suspended') musAudioCtx.resume();
  return musAudioCtx;
}

function musStopAll() {
  musNodes.forEach(n => { try { n.stop(); } catch(e){} });
  musNodes = [];
}

// ─── Track 0: Focus Zone — ambient chillout ───
function musPlayFocusZone(ctx) {
  const master = ctx.createGain(); master.gain.value = 0.18; master.connect(ctx.destination);
  // Soft pad: stacked detuned saws → lowpass
  const notes = [261.63, 329.63, 392, 523.25]; // C E G C
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'sawtooth';
    osc.frequency.value = freq * (1 + (i % 2 === 0 ? 0.003 : -0.003));
    filter.type = 'lowpass'; filter.frequency.value = 900; filter.Q.value = 1;
    gain.gain.value = 0.22;
    // slow tremolo
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.15 + i * 0.05; lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain); lfoGain.connect(gain.gain);
    lfo.start();
    osc.connect(filter); filter.connect(gain); gain.connect(master);
    osc.start(); musNodes.push(osc, lfo);
  });
  // Subtle kick every 2s
  function kick() {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (1 - i/d.length) * Math.sin(2*Math.PI*60*(1-i/d.length*0.8)*i/ctx.sampleRate) * 0.6;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = 0.5;
    src.connect(g); g.connect(master); src.start();
  }
  kick(); const kickInterval = setInterval(kick, 2000);
  musNodes.push({ stop: () => clearInterval(kickInterval) });
}

// ─── Track 1: Battle Ready — epic arena ───
function musPlayBattleReady(ctx) {
  const master = ctx.createGain(); master.gain.value = 0.18; master.connect(ctx.destination);
  // Heroic arpeggio: C G E G pattern in minor
  const arpNotes = [130.81, 174.61, 155.56, 174.61]; // C F Eb F minor feel
  let arpIdx = 0;
  function playArp() {
    const freq = arpNotes[arpIdx % arpNotes.length] * 2; arpIdx++;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'square'; osc.frequency.value = freq;
    env.gain.setValueAtTime(0, ctx.currentTime);
    env.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(env); env.connect(master); osc.start(); osc.stop(ctx.currentTime + 0.3);
  }
  playArp(); const arpInt = setInterval(playArp, 300);
  // Driving pulse bass
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  const bassFilter = ctx.createBiquadFilter();
  bass.type = 'sawtooth'; bass.frequency.value = 65.41; // C2
  bassFilter.type = 'lowpass'; bassFilter.frequency.value = 300;
  bassGain.gain.value = 0.4;
  bass.connect(bassFilter); bassFilter.connect(bassGain); bassGain.connect(master);
  bass.start(); musNodes.push(bass);
  // Snare
  function snare() {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.18, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/d.length, 1.5) * 0.7;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 1200;
    const g = ctx.createGain(); g.gain.value = 0.55;
    src.connect(filt); filt.connect(g); g.connect(master); src.start();
  }
  let beat = 0;
  function drumLoop() { if(beat % 2 === 1) snare(); beat++; }
  drumLoop(); const drumInt = setInterval(drumLoop, 300);
  musNodes.push({ stop: () => { clearInterval(arpInt); clearInterval(drumInt); } });
}

// ─── Track 2: Deep Study — lo-fi dreamy ───
function musPlayDeepStudy(ctx) {
  const master = ctx.createGain(); master.gain.value = 0.15; master.connect(ctx.destination);
  // Rain noise
  const bufLen = ctx.sampleRate * 3;
  const rainBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
  const rd = rainBuf.getChannelData(0);
  for (let i = 0; i < bufLen; i++) rd[i] = (Math.random()*2-1);
  const rain = ctx.createBufferSource(); rain.buffer = rainBuf; rain.loop = true;
  const rainFilt = ctx.createBiquadFilter(); rainFilt.type = 'bandpass'; rainFilt.frequency.value = 3000; rainFilt.Q.value = 0.5;
  const rainGain = ctx.createGain(); rainGain.gain.value = 0.08;
  rain.connect(rainFilt); rainFilt.connect(rainGain); rainGain.connect(master); rain.start();
  musNodes.push(rain);
  // Dreamy chord: Am chord slow strum
  const chordNotes = [220, 261.63, 329.63, 440]; // A C E A
  chordNotes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    osc.type = 'sine'; osc.frequency.value = freq;
    filt.type = 'lowpass'; filt.frequency.value = 2000;
    env.gain.value = 0.18 * (1 - i*0.04);
    const lfo = ctx.createOscillator(); const lfoG = ctx.createGain();
    lfo.frequency.value = 0.2 + i * 0.03; lfoG.gain.value = 0.06;
    lfo.connect(lfoG); lfoG.connect(env.gain);
    lfo.start(); osc.connect(filt); filt.connect(env); env.connect(master); osc.start();
    musNodes.push(osc, lfo);
  });
  // Slow pluck every ~2.4s
  const pluckSeq = [261.63, 329.63, 392, 523.25, 392, 329.63];
  let pluckIdx = 0;
  function pluck() {
    const freq = pluckSeq[pluckIdx % pluckSeq.length]; pluckIdx++;
    const o = ctx.createOscillator(); const e = ctx.createGain();
    o.type = 'triangle'; o.frequency.value = freq;
    e.gain.setValueAtTime(0.28, ctx.currentTime);
    e.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    o.connect(e); e.connect(master); o.start(); o.stop(ctx.currentTime + 1.3);
  }
  pluck(); const pluckInt = setInterval(pluck, 2400);
  musNodes.push({ stop: () => clearInterval(pluckInt) });
}

const musTracks = [musPlayFocusZone, musPlayBattleReady, musPlayDeepStudy];

function playMusik(el, title) {
  const items = Array.from(document.querySelectorAll('.musik-item'));
  const idx = parseInt(el.dataset.track);
  document.querySelectorAll('[id^="mus-btn-"]').forEach(b => { b.textContent = '▶ Putar'; });
  if (musPlaying === idx) {
    musStopAll(); musPlaying = -1;
    document.getElementById('musik-embed-wrap').style.display = 'none';
    return;
  }
  musStopAll();
  const ctx = musGetCtx();
  musTracks[idx](ctx);
  musPlaying = idx;
  el.querySelector('[id^="mus-btn-"]').textContent = '⏸ Pause';
  document.getElementById('mus-now-title').textContent = title;
  document.getElementById('musik-embed-wrap').style.display = '';
  setTimeout(() => document.getElementById('musik-embed-wrap').scrollIntoView({behavior:'smooth',block:'nearest'}), 100);
}

function stopMusik() {
  musStopAll(); musPlaying = -1;
  document.querySelectorAll('[id^="mus-btn-"]').forEach(b => { b.textContent = '▶ Putar'; });
  document.getElementById('musik-embed-wrap').style.display = 'none';
}

function filterMusik(genre, btn) { /* legacy — tidak dipakai */ }


// ═══════════════════════════════════════════════════════
// VIDEO MODAL — per-subjek, link ke YouTube playlist
// ═══════════════════════════════════════════════════════
const vidUrls = {
  // FISIKA
  'fisika-newton':    { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAohuR03n10T58BAKLAJL-gUU', title: 'Hukum Newton — Fisika Kelas 10', desc: 'Tiga hukum gerak Newton dan aplikasinya dalam kehidupan sehari-hari. Playlist lengkap Fisika SMA.' },
  'fisika-gelombang': { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAojJVsf-S9nKm3cIgIlyqsiy', title: 'Gelombang & Bunyi — Fisika Kelas 11', desc: 'Sifat gelombang transversal & longitudinal, cepat rambat bunyi, efek Doppler.' },
  'fisika-listrik':   { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAogjJPflUbf_CRmMZAqaOPJ3', title: 'Listrik Statis — Fisika Kelas 12', desc: 'Hukum Coulomb, medan listrik, potensial listrik, dan kapasitor.' },
  'fisika-termo':     { url: 'https://www.youtube.com/embed/GmFzWpAt8bA', title: 'Termodinamika — Fisika Kelas 11', desc: 'Hukum I & II Termodinamika, mesin Carnot, dan entropi.' },
  // KIMIA
  'kimia-ikatan':  { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAoiAsmulhr56aDt14S7E15qw', title: 'Ikatan Kimia — Kimia Kelas 10', desc: 'Ikatan kovalen, ionik, logam dan hubungannya dengan sifat fisik zat.' },
  'kimia-mol':     { url: 'https://www.youtube.com/embed/-ZlmJihIz-s', title: 'Konsep Mol — Kimia Kelas 10', desc: 'Bilangan Avogadro, massa molar, dan stoikiometri reaksi kimia.' },
  'kimia-redoks':  { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAoiGhlBbFqnGmRVSaz96YIj4', title: 'Reaksi Redoks — Kimia Kelas 12', desc: 'Oksidasi-reduksi, bilangan oksidasi, sel elektrokimia, dan korosi.' },
  'kimia-laju':    { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAogdr2rIQzS-YkL88JM5oX48', title: 'Laju Reaksi — Kimia Kelas 11', desc: 'Faktor-faktor yang mempengaruhi laju reaksi: suhu, konsentrasi, katalis, dan luas permukaan.' },
  // MATEMATIKA
  'mat-kuadrat':   { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAoiBuAob0G1-8pzhkykvgSVh', title: 'Persamaan Kuadrat — Matematika Kelas 11', desc: 'Rumus ABC, memfaktorkan, melengkapkan kuadrat, dan diskriminan.' },
  'mat-trigon':    { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAogBrLBGwAAn3hEr0MmiNunI', title: 'Trigonometri — Matematika Kelas 10', desc: 'Nilai trigonometri sudut istimewa, aturan sinus-kosinus, grafik fungsi trigonometri.' },
  'mat-integral':  { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAohXg56zEypT2aQwsbvOkjWD', title: 'Integral — Matematika Kelas 12', desc: 'Integral tak tentu, integral tentu, luas daerah, dan volume benda putar.' },
  'mat-statistik': { url: 'https://www.youtube.com/embed/videoseries?list=PLmOc36chIAoinyqTf01-awiawrIXS0yVY', title: 'Statistika — Matematika Kelas 12', desc: 'Ukuran pemusatan, penyebaran, distribusi normal, dan regresi linier.' },
  // BIOLOGI
  'bio-sel':       { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0dBkNBh3g_nXMSGR4pxdWk-', title: 'Sel & Organel — Biologi Kelas 11', desc: 'Struktur sel prokariotik dan eukariotik, fungsi organel, transpor membran.' },
  'bio-genetika':  { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0dBkNBh3g_nXMSGR4pxdWk-', title: 'Genetika & DNA — Biologi Kelas 12', desc: 'Hukum Mendel, pautan gen, mutasi, dan rekayasa genetika.' },
  'bio-evolusi':   { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0dBkNBh3g_nXMSGR4pxdWk-', title: 'Evolusi Darwin — Biologi Kelas 12', desc: 'Seleksi alam, adaptasi, spesiasi, dan bukti-bukti evolusi.' },
  'bio-ekologi':   { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0dBkNBh3g_nXMSGR4pxdWk-', title: 'Ekologi & Ekosistem — Biologi Kelas 10', desc: 'Rantai makanan, jaring-jaring makanan, siklus biogeokimia, dan keseimbangan ekosistem.' },
  // SEJARAH
  'sej-prasejarah':    { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0cOFaFJ1R5X-lMOkNdAO1Nb', title: 'Zaman Prasejarah — Sejarah Kelas 10', desc: 'Paleolitikum, Mesolitikum, Neolitikum, zaman perunggu dan besi di Nusantara.' },
  'sej-hindu':         { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0cOFaFJ1R5X-lMOkNdAO1Nb', title: 'Kerajaan Hindu-Buddha — Sejarah Kelas 10', desc: 'Kutai, Tarumanegara, Sriwijaya, Mataram Kuno, dan Majapahit.' },
  'sej-kemerdekaan':   { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0cOFaFJ1R5X-lMOkNdAO1Nb', title: 'Kemerdekaan RI — Sejarah Kelas 11', desc: 'Peristiwa Rengasdengklok, Proklamasi 17 Agustus 1945, dan perjuangan mempertahankan kemerdekaan.' },
  'sej-orba':          { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0cOFaFJ1R5X-lMOkNdAO1Nb', title: 'Orde Baru & Reformasi — Sejarah Kelas 12', desc: 'Era Soeharto, krisis 1998, gerakan mahasiswa, dan lahirnya era Reformasi.' },
  // BAHASA INDONESIA
  'bindo-teks':    { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0d8aDaovNztYf6iTChHzrHP', title: 'Jenis-Jenis Teks — B. Indonesia Kelas 10', desc: 'Teks prosedur, eksposisi, deskripsi, narasi, dan argumentasi beserta strukturnya.' },
  'bindo-majas':   { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0d8aDaovNztYf6iTChHzrHP', title: 'Majas & Gaya Bahasa — B. Indonesia Kelas 11', desc: 'Majas perbandingan, pertentangan, penegasan, dan sindiran beserta contohnya.' },
  'bindo-cerpen':  { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0d8aDaovNztYf6iTChHzrHP', title: 'Cerpen & Novel — B. Indonesia Kelas 12', desc: 'Unsur intrinsik-ekstrinsik, alur, penokohan, dan analisis karya sastra.' },
  'bindo-esai':    { url: 'https://www.youtube.com/embed/videoseries?list=PLFt_AvWsXl0d8aDaovNztYf6iTChHzrHP', title: 'Esai & Artikel — B. Indonesia Kelas 12', desc: 'Cara menulis esai ilmiah, artikel opini, dan menyusun argumen yang baik.' },
};

function switchVidTab(subj, btn) {
  document.querySelectorAll('#vid-tabs .mt').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  document.querySelectorAll('.vid-panel').forEach(p => p.style.display = 'none');
  document.getElementById('vid-' + subj).style.display = 'block';
}

function openVideoModal(key) {
  const v = vidUrls[key];
  if (!v) return;
  document.getElementById('vid-title').textContent = v.title;
  document.getElementById('vid-desc').textContent = v.desc;
  document.getElementById('vid-iframe').src = v.url + '&autoplay=1';
  // ── LOG: menonton video — deteksi mapel dari key ──
  const mapelFromKey = key.startsWith('fisika') ? 'Fisika' :
    key.startsWith('kimia') ? 'Kimia' :
    key.startsWith('mat') ? 'Matematika' :
    key.startsWith('bio') ? 'Biologi' :
    key.startsWith('sej') ? 'Sejarah' :
    key.startsWith('bindo') ? 'B. Indonesia' : 'Fisika';
  logActivity(mapelFromKey, 5, 'visual_video');
  updateStatBarsSafe();
  openModal('video-modal'); addXP(10);
}

function stopVideo() { document.getElementById('vid-iframe').src = ''; }

// ═══════════════════════════════════════════════════════
// MIND MAP BIOLOGI — node data (dipakai di app langsung)
// ═══════════════════════════════════════════════════════
const mmNodes = {
  sel:          { icon:'🌱', title:'🌱 Sel', desc:'Unit struktural dan fungsional terkecil dari semua makhluk hidup. Ditemukan oleh Robert Hooke pada 1665.', facts:['Sel prokariotik (tanpa inti sel): bakteri','Sel eukariotik (memiliki inti): hewan & tumbuhan','Diameter rata-rata: 1–100 mikrometer'] },
  genetika:     { icon:'🧬', title:'🧬 Genetika', desc:'Cabang biologi yang mempelajari pewarisan sifat dan variasi organisme antar generasi.', facts:['Bapak genetika: Gregor Mendel (1822–1884)','DNA membawa informasi genetik','Penemuan struktur DNA: Watson & Crick, 1953'] },
  ekologi:      { icon:'🌍', title:'🌍 Ekologi', desc:'Ilmu yang mempelajari hubungan antara makhluk hidup dengan lingkungannya (biotik & abiotik).', facts:['Berasal dari kata Yunani: oikos (rumah)','Diperkenalkan Ernst Haeckel, 1866','Mencakup populasi, komunitas, dan ekosistem'] },
  anatomi:      { icon:'❤️', title:'❤️ Anatomi', desc:'Ilmu yang mempelajari struktur dan susunan tubuh makhluk hidup secara rinci.', facts:['Tubuh manusia memiliki 78 organ vital','37 triliun sel menyusun tubuh manusia','Sistem organ saling berinteraksi dan bergantung'] },
  evolusi:      { icon:'🦕', title:'🦕 Evolusi', desc:'Perubahan bertahap pada ciri-ciri populasi organisme sepanjang waktu melalui proses seleksi alam.', facts:['Teori Darwin: On the Origin of Species (1859)','Seleksi alam = survival of the fittest','Berlangsung jutaan tahun secara gradual'] },
  biokimia:     { icon:'⚗️', title:'⚗️ Biokimia', desc:'Ilmu yang mempelajari reaksi kimia yang terjadi di dalam organisme hidup.', facts:['Menggabungkan ilmu biologi dan kimia','Enzim bekerja sebagai biokatalis protein','Metabolisme: anabolisme + katabolisme'] },
  mikrobiologi: { icon:'🦠', title:'🦠 Mikrobiologi', desc:'Ilmu yang mempelajari makhluk hidup berukuran mikroskopis seperti bakteri, virus, dan jamur.', facts:['Bapak mikrobiologi: Antonie van Leeuwenhoek','Bakteri: organisme paling melimpah di Bumi','Berperan dalam industri, kesehatan, dan lingkungan'] },
};

function openMindMapNode(key) {
  const n = mmNodes[key];
  if (!n) return;
  document.getElementById('mm-node-title').textContent = n.title;
  document.getElementById('mm-node-desc').textContent = n.desc;
  document.getElementById('mm-node-facts').innerHTML = n.facts.map(f =>
    `<div style="display:flex;align-items:flex-start;gap:.4rem;font-size:.76rem;color:#334155"><span style="color:var(--ac);font-weight:700;flex-shrink:0">✦</span>${f}</div>`
  ).join('');
  // ── LOG: interaksi mind map Biologi ──
  logActivity('Biologi', 2, 'visual_mindmap');
  updateStatBarsSafe();
  document.getElementById('mm-node-detail').style.display = 'block';
  document.getElementById('mm-node-detail').scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function toggleMindMap() {
  const btn = document.getElementById('mm-toggle-btn');
  const prev = document.getElementById('mm-preview');
  const detail = document.getElementById('mm-node-detail');
  if (prev.style.display === 'none') {
    prev.style.display = 'grid';
    btn.textContent = 'Tutup Mind Map ▲';
  } else {
    prev.style.display = 'none';
    detail.style.display = 'none';
    btn.textContent = 'Buka Mind Map ▼';
  }
}

// ═══════════════════════════════════════════════════════
// INFOGRAFIS SEJARAH — filter
// ═══════════════════════════════════════════════════════
function filterInfografisEra(era, btn) {
  document.querySelectorAll('#infografis-list .chip, [onclick*="filterInfografisEra"]').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  document.querySelectorAll('.infografis-item').forEach(el => {
    el.style.display = (era === 'semua' || el.dataset.era === era) ? 'block' : 'none';
  });
  // ── LOG: interaksi infografis sejarah ──
  logActivity('Sejarah', 2, 'visual_infografis');
  updateStatBarsSafe();
}

// ═══════════════════════════════════════════════════════
// RUMUS MATEMATIKA — filter
// ═══════════════════════════════════════════════════════
function filterRumus(kat, btn) {
  document.querySelectorAll('[onclick*="filterRumus"]').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  document.querySelectorAll('.rumus-card').forEach(el => {
    el.style.display = (kat === 'semua' || el.dataset.kat === kat) ? 'block' : 'none';
  });
  // ── LOG: interaksi rumus matematika ──
  logActivity('Matematika', 2, 'visual_rumus');
  updateStatBarsSafe();
}

// ═══════════════════════════════════════════════════════
// ENGLISH VOCAB — di Audio method (dengan pengucapan)
// ═══════════════════════════════════════════════════════
const audioVocabData = [
  {word:'phenomenon',pron:'/fɪˈnɒm.ɪ.nən/',id:'fenomena',ex:'The northern lights are a natural phenomenon.',cat:'noun',icon:'🌟'},
  {word:'ambiguity',pron:'/ˌæm.bɪˈɡjuː.ɪ.ti/',id:'ketidakjelasan, ambiguitas',ex:'The contract\'s ambiguity led to disputes.',cat:'noun',icon:'❓'},
  {word:'perseverance',pron:'/ˌpɜː.sɪˈvɪər.əns/',id:'ketekunan, ketabahan',ex:'Success requires perseverance and hard work.',cat:'noun',icon:'💪'},
  {word:'infrastructure',pron:'/ˈɪn.frəˌstrʌk.tʃər/',id:'infrastruktur',ex:'The city invested in its infrastructure.',cat:'noun',icon:'🏗️'},
  {word:'biodiversity',pron:'/ˌbaɪ.oʊ.daɪˈvɜː.sɪ.ti/',id:'keanekaragaman hayati',ex:'Indonesia has rich biodiversity.',cat:'noun',icon:'🌿'},
  {word:'catastrophe',pron:'/kəˈtæs.trə.fi/',id:'bencana, malapetaka',ex:'The earthquake was a catastrophe.',cat:'noun',icon:'⚠️'},
  {word:'eloquence',pron:'/ˈel.ə.kwəns/',id:'kefasihan bicara',ex:'His eloquence impressed the audience.',cat:'noun',icon:'🗣️'},
  {word:'hypothesis',pron:'/haɪˈpɒθ.ɪ.sɪs/',id:'hipotesis, dugaan sementara',ex:'The scientist tested her hypothesis.',cat:'noun',icon:'🔬'},
  {word:'millennium',pron:'/mɪˈlen.i.əm/',id:'milenium, seribu tahun',ex:'We entered a new millennium in 2000.',cat:'noun',icon:'🗓️'},
  {word:'sustainability',pron:'/səˌsteɪ.nəˈbɪl.ɪ.ti/',id:'keberlanjutan',ex:'Sustainability is key for our planet.',cat:'noun',icon:'♻️'},
  {word:'accomplish',pron:'/əˈkʌm.plɪʃ/',id:'mencapai, menyelesaikan',ex:'She accomplished all her goals.',cat:'verb',icon:'✅'},
  {word:'collaborate',pron:'/kəˈlæb.ə.reɪt/',id:'berkolaborasi, bekerja sama',ex:'Scientists collaborate to find cures.',cat:'verb',icon:'🤝'},
  {word:'deteriorate',pron:'/dɪˈtɪər.i.ə.reɪt/',id:'memburuk, menurun',ex:'His health deteriorated rapidly.',cat:'verb',icon:'📉'},
  {word:'emphasize',pron:'/ˈem.fə.saɪz/',id:'menekankan, menggarisbawahi',ex:'The teacher emphasized key concepts.',cat:'verb',icon:'📌'},
  {word:'facilitate',pron:'/fəˈsɪl.ɪ.teɪt/',id:'memfasilitasi, memperlancar',ex:'Technology facilitates communication.',cat:'verb',icon:'🔧'},
  {word:'investigate',pron:'/ɪnˈves.tɪ.ɡeɪt/',id:'menyelidiki, menginvestigasi',ex:'Police investigated the case.',cat:'verb',icon:'🔍'},
  {word:'negotiate',pron:'/nɪˈɡəʊ.ʃi.eɪt/',id:'bernegosiasi, merundingkan',ex:'They negotiated a peace treaty.',cat:'verb',icon:'⚖️'},
  {word:'perceive',pron:'/pəˈsiːv/',id:'merasakan, memahami',ex:'We perceive color differently.',cat:'verb',icon:'👁️'},
  {word:'stimulate',pron:'/ˈstɪm.jʊ.leɪt/',id:'merangsang, mendorong',ex:'Coffee stimulates the nervous system.',cat:'verb',icon:'⚡'},
  {word:'transform',pron:'/trænsˈfɔːm/',id:'mengubah, mentransformasi',ex:'Education transforms lives.',cat:'verb',icon:'🦋'},
  {word:'ambiguous',pron:'/æmˈbɪɡ.ju.əs/',id:'ambigu, tidak jelas',ex:'His statement was ambiguous.',cat:'adjective',icon:'🌀'},
  {word:'comprehensive',pron:'/ˌkɒm.prɪˈhen.sɪv/',id:'komprehensif, menyeluruh',ex:'A comprehensive study is needed.',cat:'adjective',icon:'📚'},
  {word:'crucial',pron:'/ˈkruː.ʃəl/',id:'krusial, sangat penting',ex:'This is a crucial decision.',cat:'adjective',icon:'🎯'},
  {word:'diverse',pron:'/daɪˈvɜːs/',id:'beragam, bervariasi',ex:'Indonesia has diverse cultures.',cat:'adjective',icon:'🌈'},
  {word:'enormous',pron:'/ɪˈnɔː.məs/',id:'sangat besar, luar biasa besar',ex:'The building is enormous.',cat:'adjective',icon:'🏔️'},
  {word:'inevitable',pron:'/ɪnˈev.ɪ.tə.bəl/',id:'tidak bisa dihindari',ex:'Change is inevitable.',cat:'adjective',icon:'⏳'},
  {word:'profound',pron:'/prəˈfaʊnd/',id:'mendalam, sangat dalam',ex:'The book had a profound impact.',cat:'adjective',icon:'💭'},
  {word:'significant',pron:'/sɪɡˈnɪf.ɪ.kənt/',id:'signifikan, berarti',ex:'There was a significant change.',cat:'adjective',icon:'📊'},
  {word:'vulnerable',pron:'/ˈvʌl.nər.ə.bəl/',id:'rentan, lemah',ex:'Children are vulnerable to disease.',cat:'adjective',icon:'🛡️'},
  {word:'innovative',pron:'/ˈɪn.ə.vɪ.tɪv/',id:'inovatif, penuh inovasi',ex:'They use innovative solutions.',cat:'adjective',icon:'💡'},
  {word:'analyze',pron:'/ˈæn.ə.laɪz/',id:'menganalisis',ex:'We must analyze the data carefully.',cat:'academic',icon:'🔍'},
  {word:'critique',pron:'/krɪˈtiːk/',id:'kritik, mengkritisi',ex:'Write a critique of the article.',cat:'academic',icon:'📝'},
  {word:'evaluate',pron:'/ɪˈvæl.ju.eɪt/',id:'mengevaluasi, menilai',ex:'Evaluate the evidence provided.',cat:'academic',icon:'⚖️'},
  {word:'synthesize',pron:'/ˈsɪn.θə.saɪz/',id:'mensintesis, menggabungkan',ex:'Synthesize information from sources.',cat:'academic',icon:'🔗'},
  {word:'methodology',pron:'/ˌmeθ.əˈdɒl.ə.dʒi/',id:'metodologi, cara kerja',ex:'Explain your research methodology.',cat:'academic',icon:'📋'},
  {word:'plagiarism',pron:'/ˈpleɪ.dʒə.rɪ.z.əm/',id:'plagiarisme, penjiplakan',ex:'Plagiarism is academically dishonest.',cat:'academic',icon:'❌'},
  {word:'bibliography',pron:'/ˌbɪb.liˈɒɡ.rə.fi/',id:'daftar pustaka, bibliografi',ex:'Include a bibliography at the end.',cat:'academic',icon:'📚'},
  {word:'abstract',pron:'/ˈæb.strækt/',id:'abstrak, ringkasan',ex:'Write an abstract of your paper.',cat:'academic',icon:'📄'},
  {word:'commute',pron:'/kəˈmjuːt/',id:'perjalanan pulang-pergi (kerja)',ex:'My commute takes one hour.',cat:'daily',icon:'🚌'},
  {word:'deadline',pron:'/ˈded.laɪn/',id:'batas waktu, tenggat waktu',ex:'Submit before the deadline.',cat:'daily',icon:'⏰'},
  {word:'grocery',pron:'/ˈɡrəʊ.sər.i/',id:'bahan makanan, kebutuhan pokok',ex:'I bought groceries at the market.',cat:'daily',icon:'🛒'},
  {word:'schedule',pron:'/ˈʃed.juːl/',id:'jadwal, agenda',ex:'Check your schedule for today.',cat:'daily',icon:'📅'},
  {word:'appointment',pron:'/əˈpɔɪnt.mənt/',id:'janji temu, perjanjian',ex:'I have a doctor\'s appointment.',cat:'daily',icon:'🏥'},
  {word:'affordable',pron:'/əˈfɔːd.ə.bəl/',id:'terjangkau, murah',ex:'The rent is affordable.',cat:'daily',icon:'💰'},
  {word:'photosynthesis',pron:'/ˌfəʊ.tə.ˈsɪn.θə.sɪs/',id:'fotosintesis',ex:'Plants use photosynthesis to make food.',cat:'science',icon:'🌿'},
  {word:'molecule',pron:'/ˈmɒl.ɪ.kjuːl/',id:'molekul',ex:'Water is made of H₂O molecules.',cat:'science',icon:'⚗️'},
  {word:'chromosome',pron:'/ˈkrəʊ.mə.zəʊm/',id:'kromosom',ex:'Humans have 46 chromosomes.',cat:'science',icon:'🧬'},
  {word:'ecosystem',pron:'/ˈiː.kəʊ.sɪs.təm/',id:'ekosistem',ex:'Coral reefs are complex ecosystems.',cat:'science',icon:'🌊'},
  {word:'gravity',pron:'/ˈɡræv.ɪ.ti/',id:'gravitasi',ex:'Gravity keeps us on Earth.',cat:'science',icon:'🍎'},
  {word:'radiation',pron:'/ˌreɪ.diˈeɪ.ʃən/',id:'radiasi',ex:'Sunscreen protects from UV radiation.',cat:'science',icon:'☢️'},
  {word:'accelerate',pron:'/əkˈsel.ə.reɪt/',id:'mempercepat',ex:'The car accelerated quickly.',cat:'science',icon:'🚀'},
  {word:'atmosphere',pron:'/ˈæt.mə.sfɪər/',id:'atmosfer',ex:'Earth\'s atmosphere protects life.',cat:'science',icon:'🌍'},
];

const audioCatBg = {noun:'#dbeafe',verb:'#dcfce7',adjective:'#fef9c3',adverb:'#f3e8ff',academic:'#ede9fe',daily:'#fef3c7',science:'#f0fdf4'};
const audioCatColors = {noun:'#1d4ed8',verb:'#166534',adjective:'#854d0e',adverb:'#6b21a8',academic:'#5b21b6',daily:'#92400e',science:'#14532d'};
const audioCatIcons = {noun:'🔵',verb:'🟢',adjective:'🟡',adverb:'🟣',academic:'📘',daily:'🧡',science:'🔬'};

let audioVocabCat = 'all';
function filterAudioVocab(cat, btn) {
  audioVocabCat = cat;
  document.querySelectorAll('#vocab-cat-btns .chip').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  renderAudioVocab();
}

function renderAudioVocab() {
  const search = (document.getElementById('audio-vocab-search').value || '').toLowerCase();
  const filtered = audioVocabData.filter(v => {
    const matchCat = audioVocabCat === 'all' || v.cat === audioVocabCat;
    const matchSearch = !search || v.word.toLowerCase().includes(search) || v.id.toLowerCase().includes(search) || v.ex.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });
  document.getElementById('audio-vocab-count').textContent = `Menampilkan ${filtered.length} dari ${audioVocabData.length} kata`;
  document.getElementById('audio-vocab-grid').innerHTML = filtered.map(v => `
    <div style="background:#fff;border:2px solid #e2e8f0;border-radius:14px;padding:.85rem 1rem;cursor:pointer;transition:all .2s" onclick="speakVocab('${v.word}')" onmouseenter="this.style.borderColor='var(--ac)'" onmouseleave="this.style.borderColor='#e2e8f0'">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem">
        <span style="font-size:1.3rem">${v.icon}</span>
        <div>
          <div style="font-weight:800;font-size:.95rem;color:var(--ac)">${v.word}</div>
          <div style="font-size:.72rem;color:#94a3b8;font-family:'Courier New',monospace;letter-spacing:.02em">${v.pron}</div>
        </div>
        <span style="margin-left:auto;font-size:1.1rem;color:#94a3b8">🔊</span>
      </div>
      <div style="font-size:.82rem;color:#0f172a;font-weight:600;margin-bottom:.2rem">${v.id}</div>
      <div style="font-size:.76rem;color:#64748b;font-style:italic;margin-bottom:.3rem">"${v.ex}"</div>
      <span style="font-size:.67rem;font-weight:800;padding:.15rem .5rem;border-radius:99px;background:${audioCatBg[v.cat]||'#f1f5f9'};color:${audioCatColors[v.cat]||'#64748b'}">${audioCatIcons[v.cat]||''} ${v.cat}</span>
    </div>
  `).join('');
}

function speakVocab(word) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'en-US';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }
  // ── LOG: interaksi vocab Bahasa Inggris ──
  logActivity('Bahasa Inggris', 1, 'audio_vocab');
  updateStatBarsSafe();
  toast('🔊 ' + word);
}

// ═══════════════════════════════════════════════════════
// ISTILAH SAINS — di Audio method
// ═══════════════════════════════════════════════════════
const audioSainsData = [
  {cat:'biologi',term:'Homeostasis',latin:'homeostasis',def:'Kemampuan organisme untuk mempertahankan kondisi internal yang stabil meskipun lingkungan berubah.',ex:'Tubuh manusia mempertahankan suhu 37°C dan pH darah 7,4.',icon:'⚖️'},
  {cat:'biologi',term:'Mitosis',latin:'mitosis',def:'Pembelahan sel eukariotik yang menghasilkan dua sel anak dengan jumlah kromosom sama dengan sel induk.',ex:'Sel kulit manusia terus bermitosis untuk mengganti sel yang rusak.',icon:'🔬'},
  {cat:'biologi',term:'Meiosis',latin:'meiosis',def:'Pembelahan sel khusus yang menghasilkan 4 sel anak dengan setengah jumlah kromosom sel induk (haploid).',ex:'Meiosis terjadi di testis (sperma) dan ovarium (sel telur).',icon:'🧬'},
  {cat:'biologi',term:'Fotosintesis',latin:'photosynthesis',def:'Proses pembuatan glukosa dari CO₂ dan H₂O menggunakan energi cahaya, berlangsung di kloroplas.',ex:'6CO₂ + 6H₂O + cahaya → C₆H₁₂O₆ + 6O₂',icon:'☀️'},
  {cat:'biologi',term:'Osmosis',latin:'osmosis',def:'Difusi air melalui membran semipermeabel dari larutan hipotonik ke hipertonik.',ex:'Sel darah merah mengkerut dalam larutan garam pekat.',icon:'💧'},
  {cat:'biologi',term:'Enzim',latin:'enzyme',def:'Protein yang berfungsi sebagai biokatalis, mempercepat reaksi kimia tanpa ikut bereaksi.',ex:'Amilase di mulut memecah amilum (pati) menjadi maltosa.',icon:'🔑'},
  {cat:'biologi',term:'Kromosom',latin:'chromosome',def:'Struktur benang DNA yang membawa gen dan terdapat dalam inti sel.',ex:'Manusia normal memiliki 46 kromosom (23 pasang).',icon:'🧬'},
  {cat:'biologi',term:'Ekosistem',latin:'ecosystem',def:'Sistem ekologi yang terdiri dari komunitas makhluk hidup (biotik) dan lingkungannya (abiotik) yang saling berinteraksi.',ex:'Ekosistem hutan hujan tropis memiliki keanekaragaman hayati tertinggi.',icon:'🌲'},
  {cat:'biologi',term:'Transpirasi',latin:'transpiration',def:'Proses penguapan air dari jaringan tumbuhan, terutama melalui stomata pada daun.',ex:'Tumbuhan melepaskan air ke atmosfer melalui transpirasi.',icon:'🌿'},
  {cat:'biologi',term:'Simbiotisme',latin:'symbiosis',def:'Hubungan erat antara dua organisme dari spesies berbeda yang hidup bersama.',ex:'Mutualisme (lebah-bunga), Komensalisme (anggrek-pohon), Parasitisme (cacing-manusia).',icon:'🤝'},
  {cat:'kimia',term:'Ikatan Kovalen',latin:'covalent bond',def:'Ikatan kimia yang terbentuk akibat pemakaian bersama pasangan elektron antara dua atom non-logam.',ex:'Molekul H₂O: oksigen dan hidrogen berbagi elektron.',icon:'⚗️'},
  {cat:'kimia',term:'Ikatan Ion',latin:'ionic bond',def:'Ikatan yang terbentuk akibat perpindahan elektron dari atom logam ke non-logam.',ex:'NaCl: Na⁺ dan Cl⁻ saling menarik secara elektrostatis.',icon:'🧲'},
  {cat:'kimia',term:'Molaritas',latin:'molarity',def:'Konsentrasi larutan yang menyatakan jumlah mol zat terlarut per liter larutan. Satuan: mol/L atau M.',ex:'Larutan 1M NaCl mengandung 58,5 g NaCl dalam 1 liter larutan.',icon:'⚗️'},
  {cat:'kimia',term:'pH',latin:'pH (potential of hydrogen)',def:'Ukuran tingkat keasaman atau kebasaan larutan. pH 7 = netral, <7 = asam, >7 = basa.',ex:'Asam lambung: pH 1-2. Darah manusia: pH 7,4. Air: pH 7.',icon:'🧪'},
  {cat:'kimia',term:'Reaksi Redoks',latin:'redox reaction',def:'Reaksi kimia yang melibatkan perubahan bilangan oksidasi; terjadi bersamaan oksidasi dan reduksi.',ex:'Besi berkarat: Fe → Fe³⁺ (oksidasi) + O₂ → O²⁻ (reduksi).',icon:'⚡'},
  {cat:'kimia',term:'Katalis',latin:'catalyst',def:'Zat yang mempercepat laju reaksi kimia tanpa ikut dikonsumsi dalam reaksi.',ex:'Mangan dioksida (MnO₂) mempercepat penguraian H₂O₂.',icon:'🚀'},
  {cat:'kimia',term:'Elektrolisis',latin:'electrolysis',def:'Proses penguraian suatu zat dengan menggunakan energi listrik melalui elektroda.',ex:'Elektrolisis air menghasilkan gas H₂ di katoda dan O₂ di anoda.',icon:'⚡'},
  {cat:'kimia',term:'Koloid',latin:'colloid',def:'Sistem dispersi dengan ukuran partikel 1-100 nm, lebih besar dari larutan sejati.',ex:'Susu, agar-agar, asap, dan awan adalah contoh koloid.',icon:'🌫️'},
  {cat:'fisika',term:'Inersia',latin:'inertia',def:'Kecenderungan benda untuk mempertahankan keadaan gerak atau diamnya.',ex:'Penumpang terdorong ke belakang saat bus tiba-tiba bergerak (Hukum I Newton).',icon:'🎯'},
  {cat:'fisika',term:'Momentum',latin:'momentum',def:'Hasil kali massa dan kecepatan benda. Besaran vektor. Satuan: kg·m/s.',ex:'p = mv. Truk lebih sulit dihentikan daripada sepeda.',icon:'💨'},
  {cat:'fisika',term:'Energi Kinetik',latin:'kinetic energy',def:'Energi yang dimiliki benda akibat gerakannya. Ek = ½mv²',ex:'Mobil 1000 kg kecepatan 20 m/s: Ek = 200.000 J',icon:'🏃'},
  {cat:'fisika',term:'Gelombang',latin:'wave',def:'Gangguan yang merambat dan membawa energi tanpa memindahkan materi.',ex:'Gelombang transversal (cahaya) dan longitudinal (suara).',icon:'〰️'},
  {cat:'fisika',term:'Resonansi',latin:'resonance',def:'Fenomena bergetarnya suatu benda akibat menerima gelombang dengan frekuensi sama dengan frekuensi alaminya.',ex:'Jembatan Tacoma Narrows runtuh (1940) akibat resonansi angin.',icon:'🎵'},
  {cat:'fisika',term:'Hukum Ohm',latin:'Ohm\'s law',def:'Tegangan pada konduktor sebanding dengan arus yang mengalir: V = I × R',ex:'R=10 ohm, I=2 A → V = 20 Volt',icon:'⚡'},
  {cat:'fisika',term:'Efek Doppler',latin:'Doppler effect',def:'Perubahan frekuensi yang terdengar akibat gerak relatif antara sumber bunyi dan pendengar.',ex:'Sirene ambulans terdengar lebih tinggi saat mendekati dan lebih rendah saat menjauh.',icon:'🚑'},
  {cat:'bumi',term:'Tektonika Lempeng',latin:'plate tectonics',def:'Teori yang menjelaskan gerakan lempeng litosfer Bumi yang menyebabkan gempa, gunung berapi.',ex:'Indonesia berada di pertemuan 3 lempeng: Eurasia, Indo-Australia, dan Pasifik.',icon:'🌍'},
  {cat:'bumi',term:'Siklus Hidrologi',latin:'hydrological cycle',def:'Perputaran air di Bumi secara terus-menerus melalui evaporasi, kondensasi, dan presipitasi.',ex:'Air laut → menguap → awan → hujan → sungai → laut.',icon:'💧'},
  {cat:'bumi',term:'Biosfer',latin:'biosphere',def:'Lapisan Bumi yang dihuni oleh makhluk hidup, mencakup litosfer, hidrosfer, dan atmosfer bagian bawah.',ex:'Biosfer mencakup dari 8 km bawah laut hingga 8 km ke atmosfer.',icon:'🌐'},
  {cat:'bumi',term:'El Niño',latin:'El Niño',def:'Fenomena pemanasan suhu permukaan air laut di Samudra Pasifik Tengah-Timur yang mempengaruhi cuaca global.',ex:'El Niño menyebabkan kekeringan di Indonesia dan banjir di Amerika Selatan.',icon:'🌡️'},
];

const sainsCatColor = {biologi:'#16a34a',kimia:'#d97706',fisika:'#2563eb',bumi:'#0f766e'};
const sainsCatBg = {biologi:'#dcfce7',kimia:'#fef3c7',fisika:'#dbeafe',bumi:'#ccfbf1'};

let audioSainsCat = 'all';
function filterAudioSains(cat, btn) {
  audioSainsCat = cat;
  document.querySelectorAll('#sains-cat-btns .chip').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  renderAudioSains();
}

function renderAudioSains() {
  const search = (document.getElementById('audio-sains-search').value || '').toLowerCase();
  const filtered = audioSainsData.filter(s => {
    const matchCat = audioSainsCat === 'all' || s.cat === audioSainsCat;
    const matchSearch = !search || s.term.toLowerCase().includes(search) || s.def.toLowerCase().includes(search) || s.latin.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });
  document.getElementById('audio-sains-count').textContent = `Menampilkan ${filtered.length} dari ${audioSainsData.length} istilah`;
  document.getElementById('audio-sains-grid').innerHTML = filtered.map(s => `
    <div style="background:#fff;border:2px solid #e2e8f0;border-radius:14px;padding:.85rem 1rem;cursor:pointer;transition:all .2s" onclick="speakSains('${s.latin}')" onmouseenter="this.style.borderColor='${sainsCatColor[s.cat]||'#64748b'}'" onmouseleave="this.style.borderColor='#e2e8f0'">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem">
        <span style="font-size:1.3rem">${s.icon}</span>
        <div style="flex:1">
          <div style="font-weight:800;font-size:.92rem;color:${sainsCatColor[s.cat]||'#334155'}">${s.term}</div>
          <div style="font-size:.72rem;color:#94a3b8;font-style:italic;font-family:'Courier New',monospace">${s.latin}</div>
        </div>
        <span style="font-size:1.1rem;color:#94a3b8">🔊</span>
      </div>
      <div style="font-size:.78rem;color:#334155;line-height:1.55;margin-bottom:.35rem">${s.def}</div>
      <div style="font-size:.74rem;color:#64748b;font-style:italic;padding:.3rem .6rem;background:#f8fafc;border-radius:7px;margin-bottom:.35rem">${s.ex}</div>
      <span style="font-size:.67rem;font-weight:800;padding:.15rem .5rem;border-radius:99px;background:${sainsCatBg[s.cat]||'#f1f5f9'};color:${sainsCatColor[s.cat]||'#64748b'}">${s.cat.toUpperCase()}</span>
    </div>
  `).join('');
}

function speakSains(latin) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(latin);
    u.lang = 'en-US';
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }
  // ── LOG: interaksi istilah sains — deteksi dari data ──
  const matchedTerm = audioSainsData.find(s => s.latin === latin);
  const sainsMapelMap = { biologi: 'Biologi', kimia: 'Kimia', fisika: 'Fisika', bumi: 'Fisika' };
  const sainsMapel = matchedTerm ? (sainsMapelMap[matchedTerm.cat] || 'Fisika') : 'Fisika';
  logActivity(sainsMapel, 1, 'audio_sains');
  updateStatBarsSafe();
  toast('🔊 ' + latin);
}

// Init audio vocab & sains on first load
function initAudioContent() {
  if (document.getElementById('audio-vocab-grid') && !document.getElementById('audio-vocab-grid').innerHTML) {
    renderAudioVocab();
    renderAudioSains();
  }
}

// PhET Labs
const phetUrls = {
  'phet-projectile': 'https://phet.colorado.edu/sims/html/projectile-motion/latest/projectile-motion_en.html',
  'phet-atom':       'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html',
  'phet-ohm':        'https://phet.colorado.edu/sims/html/ohms-law/latest/ohms-law_en.html',
  'phet-wave':       'https://phet.colorado.edu/sims/html/wave-on-a-string/latest/wave-on-a-string_en.html',
  'phet-balance':    'https://phet.colorado.edu/sims/html/balancing-act/latest/balancing-act_en.html',
  'phet-ph':         'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html',
  'phet-natural':    'https://phet.colorado.edu/sims/html/natural-selection/latest/natural-selection_en.html',
  'phet-energy':     'https://phet.colorado.edu/sims/html/energy-skate-park-basics/latest/energy-skate-park-basics_en.html',
};

function openLab(key, title, subj) {
  document.getElementById('lab-title').textContent = title;
  document.getElementById('lab-subject').textContent = subj + ' · PhET Colorado';
  document.getElementById('lab-iframe').src = phetUrls[key] || '';
  document.getElementById('lab-active').style.display = 'block';
  document.getElementById('lab-active').scrollIntoView({ behavior: 'smooth' });
  // ── LOG: membuka simulasi PhET (Praktek) ──
  logActivity(subj, 10, 'praktek_phet');
  updateStatBarsSafe();
  toast('🔬 Memuat simulasi ' + title + '...'); addXP(15);
}

function closeLab() { document.getElementById('lab-active').style.display = 'none'; document.getElementById('lab-iframe').src = ''; }

// ===========================
// MATERI
// ===========================
const materiDB = {
  '10': {
    'Matematika': [
      'Eksponen & Logaritma',
      'Persamaan & Fungsi Kuadrat',
      'Persamaan Linear Dua Variabel',
      'Sistem Pertidaksamaan Linear',
      'Statistika Dasar',
      'Trigonometri Awal',
      'Geometri Bidang Datar',
      'Peluang Dasar',
      'Fungsi & Relasi',
    ],
    'Fisika': [
      'Besaran & Satuan',
      'Gerak Lurus Beraturan (GLB)',
      'Gerak Lurus Berubah Beraturan (GLBB)',
      'Hukum Newton I, II, III',
      'Usaha & Energi',
      'Momentum & Impuls',
      'Gerak Melingkar',
      'Elastisitas & Hukum Hooke',
    ],
    'Kimia': [
      'Tabel Periodik Unsur',
      'Konfigurasi Elektron',
      'Ikatan Kimia (Ion, Kovalen, Logam)',
      'Stoikiometri & Mol',
      'Termokimia Dasar',
      'Larutan Elektrolit & Non-Elektrolit',
      'Reaksi Redoks',
      'Kimia Lingkungan',
    ],
    'Biologi': [
      'Sel Prokariotik & Eukariotik',
      'Organel Sel & Fungsinya',
      'Jaringan Hewan',
      'Jaringan Tumbuhan',
      'Sistem Gerak Manusia',
      'Sistem Peredaran Darah',
      'Ekosistem & Komponen Biotik-Abiotik',
      'Keanekaragaman Hayati',
      'Virus & Bakteri',
    ],
    'Bahasa Indonesia': [
      'Teks Laporan Hasil Observasi',
      'Teks Anekdot',
      'Hikayat & Sastra Lama',
      'Negosiasi',
      'Debat',
      'Teks Prosedur',
      'Teks Eksplanasi',
      'Puisi & Apresiasi Sastra',
    ],
    'Bahasa Inggris': [
      'Simple Present & Past Tense',
      'Present & Past Continuous',
      'Vocabulary Building',
      'Reading Comprehension',
      'Descriptive Text',
      'Recount Text',
      'Narrative Text',
      'Pronunciation & Phonetics',
    ],
    'Sejarah': [
      'Manusia Purba di Indonesia',
      'Zaman Prasejarah',
      'Kerajaan Hindu-Buddha di Indonesia',
      'Kerajaan Islam di Nusantara',
      'Masuknya Bangsa Eropa ke Indonesia',
      'Penjajahan VOC & Belanda',
      'Perlawanan Rakyat Nusantara',
    ],
    'Ekonomi': [
      'Konsep Dasar Ekonomi',
      'Kebutuhan & Kelangkaan',
      'Sistem Ekonomi',
      'Permintaan & Penawaran',
      'Pasar & Harga Keseimbangan',
      'Peran Pelaku Ekonomi',
      'Lembaga Keuangan & Perbankan',
    ],
    'Geografi': [
      'Pengetahuan Dasar Peta',
      'Penginderaan Jauh & SIG',
      'Langkah Penelitian Geografi',
      'Dinamika Planet Bumi',
      'Gerak Rotasi & Revolusi Bumi',
      'Litosfer & Batuan',
      'Pedosfer & Jenis Tanah',
      'Atmosfer & Cuaca-Iklim',
    ],
    'Sosiologi': [
      'Fungsi & Peran Sosiologi',
      'Interaksi Sosial',
      'Nilai & Norma Sosial',
      'Sosialisasi & Kepribadian',
      'Lembaga Sosial',
      'Kelompok Sosial',
      'Penelitian Sosial Dasar',
    ],
  },
  '11': {
    'Matematika': [
      'Fungsi & Fungsi Invers',
      'Komposisi Fungsi',
      'Matriks & Operasinya',
      'Determinan & Invers Matriks',
      'Vektor di Bidang & Ruang',
      'Transformasi Geometri',
      'Barisan & Deret Aritmetika',
      'Barisan & Deret Geometri',
      'Limit Fungsi Aljabar',
    ],
    'Fisika': [
      'Fluida Statis (Tekanan & Archimedes)',
      'Fluida Dinamis (Bernoulli)',
      'Suhu & Kalor',
      'Perpindahan Kalor',
      'Teori Kinetik Gas',
      'Termodinamika',
      'Gelombang Mekanik',
      'Gelombang Bunyi',
      'Optik Geometri (Cermin & Lensa)',
    ],
    'Kimia': [
      'Laju Reaksi',
      'Faktor-faktor Laju Reaksi',
      'Kesetimbangan Kimia',
      'Pergeseran Kesetimbangan',
      'Asam-Basa Arrhenius & Brønsted-Lowry',
      'pH Larutan Asam & Basa',
      'Titrasi Asam-Basa',
      'Larutan Penyangga (Buffer)',
      'Hidrolisis Garam',
      'Kelarutan & Hasil Kali Kelarutan (Ksp)',
      'Elektrokimia & Sel Galvani',
      'Sel Elektrolisis',
    ],
    'Biologi': [
      'Sel & Organel Lengkap',
      'Transpor Membran',
      'Jaringan Tumbuhan Lanjut',
      'Sistem Gerak (Tulang, Sendi, Otot)',
      'Sistem Peredaran Darah Lanjut',
      'Sistem Pencernaan',
      'Sistem Pernapasan',
      'Sistem Ekskresi',
      'Sistem Saraf',
      'Sistem Endokrin (Hormon)',
      'Sistem Reproduksi',
      'Metabolisme Sel (Respirasi & Fotosintesis)',
    ],
    'Bahasa Indonesia': [
      'Teks Prosedur Kompleks',
      'Teks Eksplanasi',
      'Teks Ceramah',
      'Teks Resensi',
      'Drama & Unsur-Unsurnya',
      'Puisi Baru & Kontemporer',
      'Cerpen & Analisisnya',
      'Majas & Gaya Bahasa',
      'Ejaan & Tanda Baca (EYD)',
    ],
    'Bahasa Inggris': [
      'Passive Voice (Present, Past, Future)',
      'Conditional Sentences (Type 1, 2, 3)',
      'Reported Speech',
      'Modals (Must, Should, Can, May)',
      'Essay Writing',
      'Analytical Exposition Text',
      'Hortatory Exposition Text',
      'Discussion Text',
      'Listening Comprehension',
    ],
    'Sejarah': [
      'Masa Kolonialisme & Imperialisme',
      'Kebangkitan Nasional Indonesia',
      'Organisasi Pergerakan Nasional',
      'Sumpah Pemuda 1928',
      'Pendudukan Jepang di Indonesia',
      'Proklamasi Kemerdekaan 17 Agustus 1945',
      'Perjuangan Mempertahankan Kemerdekaan',
      'Perang Dingin & Dampaknya di Asia',
    ],
    'Ekonomi': [
      'Pendapatan Nasional (GDP, GNP)',
      'Pertumbuhan & Pembangunan Ekonomi',
      'Ketenagakerjaan & Pengangguran',
      'Inflasi & Indeks Harga',
      'Kebijakan Fiskal & Moneter',
      'Perdagangan Internasional',
      'Neraca Pembayaran',
      'APBN & APBD',
    ],
    'Geografi': [
      'Persebaran Flora & Fauna Indonesia',
      'Persebaran Flora & Fauna Dunia',
      'Sumber Daya Alam Indonesia',
      'Ketahanan Pangan & Agroindustri',
      'Dinamika Kependudukan',
      'Migrasi & Transmigrasi',
      'Kebencanaan & Mitigasi',
    ],
    'Sosiologi': [
      'Permasalahan Sosial',
      'Stratifikasi Sosial',
      'Diferensiasi Sosial',
      'Mobilitas Sosial',
      'Konflik Sosial & Integrasi',
      'Multikulturalisme',
      'Harmoni Sosial',
    ],
  },
  '12': {
    'Matematika': [
      'Limit Fungsi Trigonometri',
      'Turunan Fungsi Aljabar',
      'Turunan Fungsi Trigonometri',
      'Aplikasi Turunan (Maksimum-Minimum)',
      'Integral Tak Tentu',
      'Integral Tentu',
      'Aplikasi Integral (Luas & Volume)',
      'Peluang Lanjutan (Kombinasi & Permutasi)',
      'Program Linear & Metode Simpleks',
      'Statistika Lanjutan (Regresi & Korelasi)',
    ],
    'Fisika': [
      'Listrik Statis (Coulomb & Medan Listrik)',
      'Potensial & Energi Listrik',
      'Kapasitor',
      'Arus, Tegangan & Hukum Ohm',
      'Rangkaian Seri-Paralel',
      'Hukum Kirchhoff',
      'Medan Magnet & Gaya Lorentz',
      'Induksi Elektromagnetik',
      'Arus Bolak-Balik (AC)',
      'Fisika Modern (Relativitas Einstein)',
      'Efek Fotolistrik & Foton',
      'Radioaktivitas & Inti Atom',
    ],
    'Kimia': [
      'Senyawa Karbon & Gugus Fungsi',
      'Alkana, Alkena, Alkuna',
      'Alkohol & Eter',
      'Aldehid & Keton',
      'Asam Karboksilat & Ester',
      'Benzena & Turunannya',
      'Polimer Alam & Sintetis',
      'Karbohidrat, Protein & Lemak',
      'Kimia Analitik (Titrasi Lanjut)',
      'Elektrolisis Industri',
      'Kimia Unsur (Golongan IA, IIA, VIIA)',
    ],
    'Biologi': [
      'Mutasi Gen & Kromosom',
      'Teori Evolusi (Darwin & Modern)',
      'Bukti-bukti Evolusi',
      'Bioteknologi Konvensional',
      'Bioteknologi Modern (Rekayasa Genetik)',
      'Regulasi Hormon Tumbuhan',
      'Regulasi Hormon Hewan',
      'Ekosistem & Aliran Energi',
      'Daur Biogeokimia',
      'Pencemaran & Pelestarian Lingkungan',
      'Keanekaragaman Hayati & Konservasi',
    ],
    'Bahasa Indonesia': [
      'Teks Artikel Opini',
      'Teks Editorial',
      'Surat Lamaran Pekerjaan',
      'Novel & Analisis Unsur Intrinsik-Ekstrinsik',
      'Kritik & Esai Sastra',
      'Karya Ilmiah & Metodologi',
      'Laporan Penelitian',
      'Presentasi & Pidato Ilmiah',
    ],
    'Bahasa Inggris': [
      'Review Text',
      'Explanation Text',
      'Procedure Text (Advanced)',
      'News Item Text',
      'Argumentative Essay',
      'Cause & Effect',
      'Problem & Solution',
      'Idioms & Phrasal Verbs',
      'TOEFL/IELTS Reading Strategies',
    ],
    'Sejarah': [
      'Perkembangan IPTEK di Indonesia',
      'Demokrasi Liberal & Terpimpin',
      'Orde Baru & Pembangunan Nasional',
      'Reformasi 1998',
      'Indonesia di Era Globalisasi',
      'Sejarah Perang Dunia I & II',
      'Organisasi Internasional (PBB, ASEAN)',
      'Dekolonisasi Asia-Afrika',
    ],
    'Ekonomi': [
      'Akuntansi Dasar & Persamaan',
      'Jurnal Umum & Buku Besar',
      'Neraca Saldo',
      'Laporan Keuangan',
      'Manajemen & Badan Usaha',
      'Koperasi Indonesia',
      'Pasar Modal & Investasi',
      'Ekonomi Kreatif & Digital',
    ],
    'Geografi': [
      'Regionalisasi & Pewilayahan',
      'Interaksi Desa-Kota',
      'Pola Keruangan Kota',
      'Jaringan Transportasi & Tata Ruang',
      'Negara Maju & Berkembang',
      'Kerja Sama Antarnegara',
      'Globalisasi & Dampaknya',
    ],
    'Sosiologi': [
      'Perubahan Sosial',
      'Globalisasi & Modernisasi',
      'Ketimpangan Sosial',
      'Kearifan Lokal',
      'Pemberdayaan Komunitas',
      'Inovasi Sosial',
      'Riset Sosial Terapan',
    ],
  }
};

const mapelIcons = { 'Matematika':'🧮','Fisika':'⚡','Kimia':'🧪','Biologi':'🌿','Bahasa Indonesia':'✍️','Bahasa Inggris':'🌍','Sejarah':'🏛️','Ekonomi':'📊' };
let curKelas = '10', openAcc = {};

function setKelas(k, el) {
  curKelas = k; openAcc = {};
  document.querySelectorAll('#kelas-btns button').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel'); renderMateri();
}

function toggleAcc(key) {
  openAcc[key] = !openAcc[key];
  const b = document.getElementById('acc-' + key), a = document.getElementById('arr-' + key);
  if (b) b.classList.toggle('open', !!openAcc[key]);
  if (a) a.style.transform = openAcc[key] ? 'rotate(90deg)' : 'rotate(0)';
}

function renderMateri() {
  const data = materiDB[curKelas] || {};
  // NEW! badge config: which subjects and babs are newly accessible
  const newSubjects = { '11': ['Fisika'] };
  const newBabs = { '11-Fisika': ['Termodinamika'] };
  const accessibleBabs = { '11-Fisika': ['Termodinamika'] };

  document.getElementById('materi-content').innerHTML = Object.entries(data).map(([subj, babs]) => {
    const key = curKelas + '-' + subj, icon = mapelIcons[subj] || '📖';
    const isNewSubj = (newSubjects[curKelas] || []).includes(subj);
    const newBadge = isNewSubj ? `<span style="background:var(--ac);color:#fff;font-size:.58rem;font-weight:800;padding:.1rem .32rem;border-radius:99px;margin-left:.3rem;vertical-align:middle">NEW!</span>` : '';
    return `<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div onclick="toggleAcc('${key}')" style="display:flex;align-items:center;gap:.7rem;padding:.9rem 1rem;cursor:pointer;transition:background .15s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <div style="font-size:1.3rem">${icon}</div>
        <div style="flex:1"><div style="font-weight:800;font-size:.88rem">${subj}${newBadge}</div><div style="font-size:.72rem;color:#94a3b8">${babs.length} bab · Kelas ${curKelas}</div></div>
        <div style="display:flex;align-items:center;gap:.4rem"><div class="badge ba">${babs.length}</div><svg id="arr-${key}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" style="transition:transform .2s;flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="acc-b" id="acc-${key}">
        <div style="padding:0 1rem .9rem">
          ${babs.map(bab => {
            const isNewBab = (newBabs[key] || []).includes(bab);
            const isAccessible = (accessibleBabs[key] || []).includes(bab);
            const babNewBadge = isNewBab ? `<span style="background:var(--ac);color:#fff;font-size:.56rem;font-weight:800;padding:.08rem .28rem;border-radius:99px;margin-left:.3rem;vertical-align:middle">NEW!</span>` : '';
            const clickAction = isAccessible ? `openBab('${subj}','${bab}')` : `selectBab('${subj}','${bab}')`;
            const arrowColor = isAccessible ? `var(--ac)` : `#94a3b8`;
            return `<div onclick="${clickAction}" style="display:flex;align-items:center;gap:.65rem;padding:.6rem .85rem;border-radius:10px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;transition:all .15s;margin-bottom:.38rem" onmouseover="this.style.borderColor='var(--ac)';this.style.background='var(--ac-l)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
            <div style="width:26px;height:26px;border-radius:7px;background:var(--ac-l);border:1.5px solid var(--ac-m);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;color:var(--ac);flex-shrink:0">${bab.charAt(0)}</div>
            <div style="flex:1"><div style="font-weight:700;font-size:.84rem">${bab}${babNewBadge}</div></div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${arrowColor}" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

// Open accessible bab (Termodinamika etc.) — navigate to dedicated page
function openBab(subj, bab) {
  const babPages = {
    'Termodinamika': '../pages/termodinamika.html'
  };
  const page = babPages[bab];
  if (page) {
    // Log 15 mnt study activity for this subject
    logActivity(subj, 15, 'materi');
    window.location.href = page;
  }
}

function selectBab(s, b) {
  // Remove existing modal if any
  const old = document.getElementById('coming-soon-modal');
  if (old) old.remove();

  const modal = document.createElement('div');
  modal.id = 'coming-soon-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(15,10,40,.55);backdrop-filter:blur(6px);padding:1rem';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:24px;padding:2rem 1.75rem 1.75rem;max-width:320px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);position:relative">
      <div style="font-size:3rem;margin-bottom:.5rem">🚧</div>
      <div style="font-size:1.25rem;font-weight:900;color:#1e1b4b;margin-bottom:.35rem">Coming Soon</div>
      <div style="font-size:.82rem;color:#64748b;margin-bottom:.25rem;font-weight:600">${b}</div>
      <div style="font-size:.76rem;color:#94a3b8;margin-bottom:1.4rem">Konten bab ini sedang dalam pengembangan.<br>Pantau terus update berikutnya! 💪</div>
      <button onclick="document.getElementById('coming-soon-modal').remove()" style="background:var(--ac);color:#fff;border:none;border-radius:99px;padding:.6rem 2rem;font-weight:800;font-size:.9rem;cursor:pointer;width:100%">Oke, Siap!</button>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

renderMateri();

// ===========================
// INIT
// ===========================
renderAv('char-svg');
renderAv('char-modal-svg');

const miniSvg = document.createElement('svg');
miniSvg.id = 'mini-av-svg';
miniSvg.setAttribute('viewBox', '0 0 120 170');
miniSvg.style.display = 'none';
document.body.appendChild(miniSvg);

['pod-p-0','pod-p-1','pod-p-2'].forEach(id => { const el = document.getElementById(id); if (el) el.style.width = '0%'; });

document.getElementById('pr-ring').style.strokeDashoffset = 0;

function syncCharModal() {
  document.querySelectorAll('#char-edit-modal .ob, #char-edit-modal .sk').forEach(el => {
    if (el.getAttribute('onclick')) {
      const match = el.getAttribute('onclick').match(/setCh2\('(\w+)','([^']+)'/);
      if (match) el.classList.toggle('sel', ch[match[1]] === match[2]);
    }
  });
}

document.querySelector('[onclick="openModal(\'char-edit-modal\')"]')?.addEventListener('click', () => {
  setTimeout(syncCharModal, 50);
  renderAv('char-modal-svg');
});

// ===========================
// MASCOT
// ===========================
const mascotMessages = {
  home:    ["👋 Selamat datang! Ayo mulai belajar!", "🌟 Kamu sudah login! Hebat!", "💪 Hari ini kita belajar apa?"],
  belajar: ["🧠 Pilih metode belajarmu!", "📚 Visual, Audio, atau Praktek?", "🎯 Belajar itu menyenangkan!"],
  pomo:    ["⏱️ Fokus 25 menit, istirahat 5 menit!", "🍅 Teknik Pomodoro terbukti efektif!", "☕ Jangan lupa istirahat ya!"],
  flash:   ["🃏 Flashcard membantu hafalan!", "✨ Semakin sering diulang, semakin ingat!", "🔀 Coba mode acak untuk tantangan!"],
  arena:   ["⚔️ Saatnya bertarung!", "🏆 Menang battle = XP lebih banyak!", "💥 Jawab dengan cepat dan tepat!"],
  materi:  ["📖 Pilih materi yang ingin dipelajari!", "🎓 Belajar sistematis itu kunci sukses!", "📝 Catat hal penting!"],
  agenda:  ["📅 Atur jadwal belajarmu!", "⏰ Agenda membantu kamu disiplin!", "🟢 Tandai harimu dan jangan sampai lupa!"],
  idle:    ["😊 Klik aku untuk semangat!", "🌈 Kamu bisa, aku yakin!", "⭐ Tetap semangat belajar!", "🦸 Kamu adalah pahlawan pengetahuan!"],
  correct: ["🎉 Benar! Kamu hebat!", "✅ Jawaban tepat! Terus begini!", "🔥 Luar biasa!"],
  wrong:   ["😅 Hampir benar! Coba lagi!", "💪 Jangan menyerah! Kamu bisa!", "🤔 Belajar dari kesalahan itu penting!"],
  win:     ["🏆 MENANG! Kamu juara!", "🎊 Keren banget! Pertahankan!", "⚡ Bot kalah! Kamu kuat!"],
  lose:    ["😢 Jangan sedih, coba lagi!", "💪 Kekalahan adalah pelajaran!", "🔄 Latihan lagi ya!"],
  levelUp: ["🚀 LEVEL UP! Kamu makin hebat!", "⚡ Level baru! Terus berjuang!"],
};

let mascotTimeout;

function showMascotBubble(msg, duration = 3500) {
  const bubble = document.getElementById('mascot-bubble');
  bubble.textContent = msg;
  bubble.style.display = 'block';
  clearTimeout(mascotTimeout);
  mascotTimeout = setTimeout(() => { bubble.style.display = 'none'; }, duration);
}

function mascotTalk() {
  SFX.select();
  const msgs = mascotMessages.idle;
  showMascotBubble(msgs[Math.floor(Math.random() * msgs.length)]);
  const eyeL = document.getElementById('m-eye-l'), eyeR = document.getElementById('m-eye-r');
  if (eyeL && eyeR) {
    eyeL.setAttribute('cy', '28'); eyeR.setAttribute('cy', '28');
    setTimeout(() => { eyeL.setAttribute('cy', '27'); eyeR.setAttribute('cy', '27'); }, 300);
  }
}

function mascotSay(context) {
  const msgs = mascotMessages[context] || mascotMessages.idle;
  showMascotBubble(msgs[Math.floor(Math.random() * msgs.length)]);
}

// Hook mascot to game events
const _origFinishBattle = finishBattle;
window.finishBattle = function () {
  const won = btEHP <= 0 || (btPHP > 0 && btPHP > btEHP);
  _origFinishBattle();
  setTimeout(() => mascotSay(won ? 'win' : 'lose'), 200);
};

const _origAnswerBattle = answerBattle;
window.answerBattle = function (idx) {
  const q = window._btQs[btQ];
  const wasCorrect = idx === q.a;
  _origAnswerBattle(idx);
  setTimeout(() => mascotSay(wasCorrect ? 'correct' : 'wrong'), 100);
};

const _origAddXP = addXP;
window.addXP = function (amt) {
  const prevLevel = level;
  _origAddXP(amt);
  if (level > prevLevel) setTimeout(() => mascotSay('levelUp'), 300);
};

setTimeout(() => {
  if (document.getElementById('sc-login').classList.contains('on')) {
    showMascotBubble('👋 Halo! Aku EduBuddy, temanmu belajar!', 5000);
  }
}, 1500);

setInterval(() => {
  const bubble = document.getElementById('mascot-bubble');
  if (bubble.style.display === 'none' || !bubble.style.display) {
    if (Math.random() < 0.3) mascotSay('idle');
  }
}, 15000);

// ===========================
// INIT DARI SESSION (diperbaiki)
// Baca data user dari Auth.getSession() saat halaman dimuat
// ===========================
(function initFromSession() {
  const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;
  if (!session) return;

  // Terapkan data user
  userName = session.username || 'Pelajar';
  userRole = session.role     || 'siswa';
  xp       = session.xp      || 0;
  // Tampilkan tombol admin jika role admin
  if (userRole === 'admin') {
    ['admin-btn-dd','admin-btn-dd-mob'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = ''; });
  }
  level    = session.level    || 1;
  streak   = session.streak   || 0;

  // Terapkan karakter tersimpan
  if (session.character) {
    Object.assign(ch, session.character);
  }

  // Update UI topbar
  const firstEl = document.getElementById('home-greeting');
  if (firstEl) firstEl.textContent = '👋 Halo, ' + userName.split(' ')[0] + '!';

  const pdName = document.getElementById('pd-name');
  if (pdName) pdName.textContent = userName;

  const pdRole = document.getElementById('pd-role');
  if (pdRole) pdRole.textContent = (userRole === 'guru' ? 'Guru' : 'Siswa') + ' · Level ' + level;

  const lvlBadge = document.getElementById('lvl-badge');
  if (lvlBadge) lvlBadge.textContent = level;

  const xpTopLbl = document.getElementById('xp-top-lbl');
  if (xpTopLbl) xpTopLbl.textContent = xp;

  // Streak: baca dari localStorage StreakSystem (lebih akurat dari session)
  try {
    const sdata = JSON.parse(localStorage.getItem('ef_streak_data') || '{}');
    if (sdata.days && sdata.days.length) {
      // Hitung streak langsung — StreakSystem belum tentu sudah dimuat sini
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now()-86400000).toISOString().split('T')[0];
      const days = [...new Set(sdata.days)].sort().reverse();
      let sc = 0, exp = new Date();
      for (let i=0; i<days.length; i++) {
        const ed = exp.toISOString().split('T')[0];
        if (days[i] === ed) { sc++; exp.setDate(exp.getDate()-1); }
        else if (i===0 && days[0]===yesterday) { sc++; exp.setDate(exp.getDate()-2); }
        else break;
      }
      streak = sc;
    }
  } catch(e) {}
  const streakLbl = document.getElementById('streak-lbl');
  if (streakLbl) streakLbl.textContent = streak;
  const mobStreakLbl = document.getElementById('mob-streak-lbl');
  if (mobStreakLbl) mobStreakLbl.textContent = streak;
  const homeNum = document.getElementById('home-streak-num');
  if (homeNum) homeNum.textContent = streak;
  const pStreakLbl = document.getElementById('p-streak-lbl');
  if (pStreakLbl) pStreakLbl.textContent = streak;

  const lbMyName = document.getElementById('lb-my-name');
  if (lbMyName) lbMyName.textContent = userName.split(' ')[0];

  // Render avatar (semua, termasuk desktop & mobile profile button)
  renderAv('char-svg');
  renderAv('char-modal-svg');
  renderAv('mini-av-svg');
  renderAv('profile-av-svg');
  renderAv('profile-av-svg-mob');
})();

// Patch addXP supaya juga sync ke Auth + Firestore
const _origAddXPSession = window.addXP;
window.addXP = function(amt) {
  _origAddXPSession(amt);
  if (typeof Auth !== 'undefined') Auth.updateStats(xp, level, streak);
  if (typeof FirebaseSync !== 'undefined') FirebaseSync.saveXPLevel(xp, level);
};

// Patch saveCharEdit supaya simpan ke Auth + Firestore
const _origSaveCharEdit = window.saveCharEdit;
window.saveCharEdit = function() {
  _origSaveCharEdit();
  if (typeof Auth !== 'undefined') Auth.saveCharacter({ ...ch });
  if (typeof FirebaseSync !== 'undefined') FirebaseSync.saveCharacter({ ...ch });
};

// ===========================
// FLOW BARU: Hapus sc-login, langsung cek karakter
// ===========================
(function initFlow() {
  const session = (typeof Auth !== 'undefined') ? Auth.getSession() : null;

  // Ambil nama dari session untuk char preview
  if (session) {
    const firstName = session.username ? session.username.split(' ')[0] : 'Kamu';
    const previewName = document.getElementById('char-preview-name');
    if (previewName) previewName.textContent = firstName;
    const previewRole = document.getElementById('char-preview-role');
    if (previewRole) previewRole.textContent = session.role === 'guru' ? '📚 Guru' : '🎒 Siswa';
  }

  // Cek apakah sudah punya karakter tersimpan
  const savedChar = (typeof Auth !== 'undefined') ? Auth.getCharacter() : null;
  if (savedChar) {
    // Sudah punya karakter → langsung ke main
    Object.assign(ch, savedChar);
    goScreen('sc-main');
    document.getElementById('mobile-bottom-nav').classList.add('on');
    // Init Firestore realtime sync setelah masuk
    if (typeof FirebaseSync !== 'undefined') FirebaseSync.init();
    setTimeout(() => mascotSay('home'), 800);
  } else {
    // Belum punya karakter → tampilkan character creator
    goScreen('sc-char');
    renderAv('char-svg');
  }
})();

// Override renderAv agar juga update profile-av-svg (desktop) & profile-av-svg-mob (mobile)
const _origRenderAv = renderAv;
window.renderAv = function(svgId) {
  _origRenderAv(svgId);
  if (svgId !== 'profile-av-svg')     _origRenderAv('profile-av-svg');
  if (svgId !== 'profile-av-svg-mob') _origRenderAv('profile-av-svg-mob');
};

// Override goDash agar simpan karakter ke Auth + Firestore sebelum masuk
const _origGoDash = goDash;
window.goDash = function() {
  if (typeof Auth !== 'undefined') Auth.saveCharacter({ ...ch });
  if (typeof FirebaseSync !== 'undefined') FirebaseSync.saveCharacter({ ...ch });
  _origGoDash();
  setTimeout(() => { renderAv('profile-av-svg'); renderAv('profile-av-svg-mob'); }, 100);
  if (typeof FirebaseSync !== 'undefined') FirebaseSync.init();
};

// ===========================
// SISTEM STREAK (v2)
// ===========================

const StreakSystem = (() => {
  const LOGIN_XP_BASE = 10;
  const STREAK_BONUS  = 5;

  // getData: baca dari localStorage CACHE (sudah diisi oleh FirebaseSync onSnapshot)
  // saveData: tulis ke Firestore via FirebaseSync (bukan localStorage langsung)
  function getData() {
    try { return JSON.parse(localStorage.getItem('ef_streak_data')) || { days: [], lastShown: null }; }
    catch { return { days: [], lastShown: null }; }
  }

  function saveData(d) {
    // Simpan ke Firestore + update cache lokal
    if (typeof FirebaseSync !== 'undefined') FirebaseSync.saveStreak(d);
    else localStorage.setItem('ef_streak_data', JSON.stringify(d)); // fallback offline
  }

  // Format tanggal → 'YYYY-MM-DD'
  function toDateStr(date) {
    return date.toISOString().split('T')[0];
  }

  // Hitung streak saat ini (hari berturut-turut terakhir)
  function calcStreak(days) {
    if (!days || !days.length) return 0;
    const sorted = [...new Set(days)].sort().reverse(); // unik, terbaru dulu
    let count = 0;
    let expected = new Date();
    for (let i = 0; i < sorted.length; i++) {
      const d = toDateStr(expected);
      if (sorted[i] === d) {
        count++;
        expected.setDate(expected.getDate() - 1);
      } else if (i === 0 && sorted[0] === toDateStr(new Date(Date.now() - 86400000))) {
        // kemarin login, hari ini belum — masih hitung
        count++;
        expected.setDate(expected.getDate() - 2);
      } else {
        break;
      }
    }
    return count;
  }

  // Ambil tanggal hari Senin minggu ini
  function getMondayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Minggu, 1=Sen, ...
    const diff = (day === 0) ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  }

  // Render kalender minggu (Sen–Min) di modal
  function renderWeekCalendar(days) {
    const container = document.getElementById('streak-week-days');
    if (!container) return;

    const dayNames = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
    const monday   = getMondayOfWeek(new Date());
    const todayStr = toDateStr(new Date());
    const daySet   = new Set(days);

    container.innerHTML = dayNames.map((name, i) => {
      const d    = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = toDateStr(d);
      const isToday   = dStr === todayStr;
      const isLogged  = daySet.has(dStr);
      const isFuture  = d > new Date() && !isToday;

      let bg, border, icon, textColor;
      if (isLogged) {
        bg = 'var(--ac)'; border = 'var(--ac)'; icon = '🔥'; textColor = '#fff';
      } else if (isFuture) {
        bg = '#f1f5f9'; border = '#e2e8f0'; icon = '·'; textColor = '#cbd5e1';
      } else {
        bg = '#fef2f2'; border = '#fecaca'; icon = '✗'; textColor = '#fca5a5';
      }

      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:.25rem">
        <div style="font-size:.65rem;font-weight:700;color:#94a3b8">${name}</div>
        <div style="width:36px;height:36px;border-radius:10px;background:${bg};border:2px solid ${border};
          display:flex;align-items:center;justify-content:center;font-size:${isLogged ? '1rem' : '.8rem'};
          ${isToday ? 'box-shadow:0 0 0 3px rgba(var(--ac-rgb),.25)' : ''};color:${textColor};font-weight:700">
          ${icon}
        </div>
        <div style="font-size:.58rem;color:${isToday ? 'var(--ac)' : '#94a3b8'};font-weight:${isToday ? '800' : '600'}">
          ${isToday ? 'Hari ini' : d.getDate()}
        </div>
      </div>`;
    }).join('');
  }

  // Tampilkan modal streak
  function showStreakModal(streakCount, xpGained, isNewDay) {
    const emoji = streakCount >= 7 ? '🏆' : streakCount >= 3 ? '🔥' : '⭐';
    const title = streakCount >= 7 ? `${streakCount} Hari Streak!` :
                  streakCount >= 3 ? `${streakCount} Hari Berturut-turut!` :
                  isNewDay         ? 'Selamat Datang Kembali!' : 'Login Hari Ini!';
    const sub   = streakCount >= 7 ? 'Luar biasa! Kamu sangat konsisten belajar! 🎉' :
                  streakCount >= 3 ? `Pertahankan streakmu! Besok makin keren!` :
                  `Setiap hari belajar itu keren!`;

    const el = (id) => document.getElementById(id);
    if (el('streak-modal-emoji'))  el('streak-modal-emoji').textContent  = emoji;
    if (el('streak-modal-title'))  el('streak-modal-title').textContent  = title;
    if (el('streak-modal-sub'))    el('streak-modal-sub').textContent    = sub;
    if (el('streak-xp-label'))     el('streak-xp-label').textContent     = `+${xpGained} XP`;

    const data = getData();
    renderWeekCalendar(data.days);

    openModal('streak-modal');
  }

  // ── checkAndShow: baca dari Firestore langsung (bukan localStorage)
  // Ini mencegah duplikat karena lastShown tersimpan per-user di Firestore
  let _streakCheckDone = false;

  function checkAndShow() {
    if (_streakCheckDone) return;
    _streakCheckDone = true;

    // Tunggu FirebaseSync ready, lalu ambil data streak dari Firestore langsung
    const MAX_WAIT = 5000;
    const INTERVAL = 150;
    let waited = 0;

    async function _doCheck() {
      const todayStr = toDateStr(new Date());

      // Baca dari Firestore (bukan localStorage) supaya per-user
      let data = { days: [], lastShown: null };
      if (typeof FirebaseSync !== 'undefined' && FirebaseSync.getStreakFromFirestore) {
        data = await FirebaseSync.getStreakFromFirestore();
      } else {
        data = getData(); // fallback cache
      }

      // Guard: user sudah check-in hari ini → hanya update UI, tidak ada XP/modal
      if (data.lastShown === todayStr) {
        updateAllStreakUI(calcStreak(data.days));
        return;
      }

      // Hari baru → tambahkan tanggal hari ini
      const isNewDay = !data.days.includes(todayStr);
      if (isNewDay) {
        data.days.push(todayStr);
        if (data.days.length > 60) data.days = data.days.slice(-60);
      }

      const streakCount = calcStreak(data.days);
      const xpGained    = LOGIN_XP_BASE + (streakCount * STREAK_BONUS);

      // Tandai check-in hari ini di Firestore SEBELUM beri XP
      data.lastShown = todayStr;
      saveData(data); // → langsung ke Firestore

      updateAllStreakUI(streakCount);

      // XP dan modal HANYA untuk hari baru (bukan setiap login)
      if (isNewDay) {
        if (typeof addXP !== 'undefined') {
          setTimeout(() => addXP(xpGained), 1500);
        }
        setTimeout(() => showStreakModal(streakCount, xpGained, isNewDay), 900);
      }
    }

    function _waitAndCheck() {
      const fsReady = (typeof FirebaseSync === 'undefined') || FirebaseSync.isReady();
      if (fsReady || waited >= MAX_WAIT) {
        _doCheck();
      } else {
        waited += INTERVAL;
        setTimeout(_waitAndCheck, INTERVAL);
      }
    }
    _waitAndCheck();
  }

  function resetCheckFlag() { _streakCheckDone = false; }

  // Update semua elemen streak di halaman
  function updateAllStreakUI(count) {
    const ids = ['streak-lbl', 'p-streak-lbl'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    });

    // Home panel streak text
    const numEl = document.getElementById('home-streak-num');
    if (numEl) numEl.textContent = count;

    // Update state variable
    if (typeof streak !== 'undefined') streak = count;
  }

  return { checkAndShow, calcStreak, getData, updateAllStreakUI, resetCheckFlag };
})();

// Jalankan streak check setelah halaman siap
// (dipanggil dari initFromSession di bawah)

// ===========================
// Panggil StreakSystem setelah init
// ===========================
// Override initFlow agar jalankan streak SETELAH user masuk ke dashboard
const _origGoDash2 = window.goDash;
window.goDash = function() {
  _origGoDash2 && _origGoDash2();
  // Streak check dilakukan setelah masuk dashboard
  setTimeout(() => {
    if (typeof StreakSystem !== 'undefined') StreakSystem.checkAndShow();
  }, 600);
};

// Juga panggil jika langsung ke sc-main (sudah punya karakter)
document.addEventListener('DOMContentLoaded', () => {
  const scMain = document.getElementById('sc-main');
  if (scMain && scMain.classList.contains('on')) {
    setTimeout(() => {
      if (typeof StreakSystem !== 'undefined') StreakSystem.checkAndShow();
    }, 800);
  }

  // ===========================
  // Update status indikator soal di UI
  // ===========================
  const statusContainerEl = document.getElementById('gemini-status-bot');
  const statusDotEl = document.getElementById('gemini-dot-bot');
  const statusLabelEl = document.getElementById('gemini-label-bot');
  if (statusContainerEl && statusDotEl && statusLabelEl) {
    statusDotEl.style.background = '#22c55e';
    statusLabelEl.textContent = '📚 Soal tersedia dalam mode offline';
    statusContainerEl.style.background = '#f0fdf4';
    statusContainerEl.style.borderColor = '#bbf7d0';
    statusContainerEl.style.color = '#166534';
  }
});

// ============================================================
// AGENDA KALENDER SYSTEM
// ============================================================
const AgendaSystem = (() => {
  const STORAGE_KEY = 'edufun_agenda_v1';
  let agendaDB = {};
  let selectedDate = null; // 'YYYY-MM-DD'
  let currentYear, currentMonth;
  let editingId = null;
  let selectedColor = 'green';
  let notifTimers = {};

  const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  function load() {
    try { agendaDB = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { agendaDB = {}; }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agendaDB));
    if (typeof FirebaseSync !== 'undefined') FirebaseSync.saveAgenda(agendaDB);
  }

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function init() {
    load();
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();
    selectedDate = todayStr();
    renderCalendar();
    renderDayEvents();
    renderHomeAgenda();
    scheduleAllNotifs();
    setTimeout(agHomeCalRender, 50);
  }

  function renderCalendar() {
    // Sync home mini-cal month label
    const homeMonthLbl = document.getElementById('home-cal-month');
    if (homeMonthLbl) homeMonthLbl.textContent = `${BULAN[currentMonth]} ${currentYear}`;
    const grid = document.getElementById('ag-cal-grid');
    const lbl = document.getElementById('ag-month-lbl');
    if (!grid || !lbl) return;
    lbl.textContent = `${BULAN[currentMonth]} ${currentYear}`;
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
    const daysInPrev = new Date(currentYear, currentMonth, 0).getDate();
    const today = todayStr();
    const colorPriority = { red: 0, yellow: 1, green: 2 };
    const colorMap = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };
    let html = '';
    // prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      html += `<div class="ag-day other-month">${daysInPrev - i}</div>`;
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const isToday = ds === today;
      const isSel = ds === selectedDate;
      const events = agendaDB[ds] || [];
      // Determine which events are still active (not yet done)
      const nowHM = (() => { const n=new Date(); return n.getHours()*60+n.getMinutes(); })();
      const activeEvents = events.filter(ev => {
        const [eh,em] = (ev.timeEnd||'23:59').split(':').map(Number);
        const endMin = eh*60+em;
        return !((ds < today) || (ds === today && nowHM >= endMin));
      });
      // Pick highest priority color among active events
      let ringColor = null;
      if (activeEvents.length > 0) {
        const sorted = activeEvents.slice().sort((a,b) => (colorPriority[a.color]||99) - (colorPriority[b.color]||99));
        ringColor = sorted[0].color;
      }
      let cls = 'ag-day';
      if (isToday) cls += ' today';
      else if (isSel) cls += ' selected';
      const ring = ringColor ? `box-shadow:0 0 0 2.5px ${colorMap[ringColor]};` : '';
      html += `<div class="${cls}" style="${ring}" onclick="AgendaSystem.selectDate('${ds}')">${d}</div>`;
    }
    // next month padding
    const total = firstDay + daysInMonth;
    const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 1; i <= rem; i++) {
      html += `<div class="ag-day other-month">${i}</div>`;
    }
    grid.innerHTML = html;
  }

  function selectDate(ds) {
    selectedDate = ds;
    renderCalendar();
    renderDayEvents();
    const addBtn = document.getElementById('ag-add-btn');
    if (addBtn) addBtn.style.display = '';
  }

  function renderDayEvents() {
    const list = document.getElementById('ag-event-list');
    const title = document.getElementById('ag-day-title');
    if (!list || !selectedDate) return;
    const [y, m, d] = selectedDate.split('-');
    if (title) title.textContent = `📋 ${parseInt(d)} ${BULAN[parseInt(m)-1]} ${y}`;
    const events = (agendaDB[selectedDate] || []).sort((a,b) => a.timeStart.localeCompare(b.timeStart));
    if (!events.length) {
      list.innerHTML = `<div style="text-align:center;padding:.75rem;color:#94a3b8;font-size:.82rem">Belum ada agenda — klik + Tambah</div>`;
      return;
    }
    const nowHM = (() => { const n=new Date(); return n.getHours()*60+n.getMinutes(); })();
    const todayCheck = (() => { const d=new Date(); const p=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; })();

    function buildEventCard(ev, isOngoing, isPast, isSoon) {
      let statusBadge = '';
      if (isOngoing) statusBadge = '<span style="font-size:.65rem;background:#dcfce7;color:#166534;border:1px solid #86efac;border-radius:99px;padding:.08rem .4rem;font-weight:800;flex-shrink:0">● Berlangsung</span>';
      else if (isSoon) statusBadge = '<span style="font-size:.65rem;background:#fef3c7;color:#92400e;border:1px solid #fcd34d;border-radius:99px;padding:.08rem .4rem;font-weight:800;flex-shrink:0">⏰ 15 mnt lagi</span>';
      return `<div class="ag-event-item" onclick="AgendaSystem.editEvent('${selectedDate}','${ev.id}')" style="${isOngoing ? 'background:#f0fdf4;' : ''}">
        <div class="ag-bar ${ev.color}"></div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:.4rem;flex-wrap:wrap;margin-bottom:.15rem">
            <div style="font-weight:700;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev.name}</div>
            ${statusBadge}
          </div>
          <div style="font-size:.74rem;color:#64748b">⏰ ${ev.timeStart} – ${ev.timeEnd}${ev.note ? ' · ' + ev.note : ''}</div>
        </div>
        <div style="font-size:1rem">${ev.color==='green'?'🟢':ev.color==='yellow'?'🟡':'🔴'}</div>
      </div>`;
    }

    // Split into active and completed
    const activeEvents = [];
    const doneEvents = [];

    events.forEach(ev => {
      const [sh,sm] = ev.timeStart.split(':').map(Number);
      const [eh,em] = ev.timeEnd.split(':').map(Number);
      const startMin = sh*60+sm, endMin = eh*60+em;
      const isOngoing = selectedDate === todayCheck && nowHM >= startMin && nowHM < endMin;
      const isPast = (selectedDate < todayCheck) || (selectedDate === todayCheck && nowHM >= endMin);
      const isSoon = selectedDate === todayCheck && nowHM < startMin && (startMin - nowHM) <= 15;
      if (isPast && !isOngoing) {
        doneEvents.push({ ev, isOngoing, isPast, isSoon });
      } else {
        activeEvents.push({ ev, isOngoing, isPast, isSoon });
      }
    });

    let html = '';

    // Active / upcoming events
    if (activeEvents.length) {
      html += activeEvents.map(({ ev, isOngoing, isPast, isSoon }) => buildEventCard(ev, isOngoing, isPast, isSoon)).join('');
    } else if (!doneEvents.length) {
      html += `<div style="text-align:center;padding:.75rem;color:#94a3b8;font-size:.82rem">Belum ada agenda — klik + Tambah</div>`;
    }

    // Completed events section
    if (doneEvents.length) {
      html += `<div style="margin-top:.75rem;padding-top:.6rem;border-top:1.5px dashed #e2e8f0">
        <div style="display:flex;align-items:center;gap:.35rem;margin-bottom:.45rem">
          <span style="font-size:.68rem;font-weight:800;color:#94a3b8;letter-spacing:.04em">✅ AGENDA SELESAI</span>
          <span style="font-size:.65rem;background:#f1f5f9;color:#94a3b8;border:1px solid #e2e8f0;border-radius:99px;padding:.06rem .4rem;font-weight:700">${doneEvents.length}</span>
        </div>
        <div style="opacity:.65">
          ${doneEvents.map(({ ev, isOngoing, isPast, isSoon }) => buildEventCard(ev, isOngoing, isPast, isSoon)).join('')}
        </div>
      </div>`;
    }

    list.innerHTML = html;
  }

  function renderHomeAgenda() {
    const list = document.getElementById('home-agenda-list');
    if (!list) return;
    const today = todayStr();
    const events = (agendaDB[today] || []).sort((a,b) => a.timeStart.localeCompare(b.timeStart));
    if (!events.length) {
      list.innerHTML = `<div style="text-align:center;padding:.5rem;color:#94a3b8;font-size:.82rem">Belum ada agenda hari ini</div>`;
      return;
    }
    list.innerHTML = events.slice(0, 3).map(ev => `
      <div style="display:flex;align-items:center;gap:.55rem;padding:.4rem 0;border-bottom:1px solid #f1f5f9">
        <div style="width:3px;height:30px;border-radius:3px;background:${ev.color==='green'?'#22c55e':ev.color==='yellow'?'#eab308':'#ef4444'};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev.name}</div>
          <div style="font-size:.72rem;color:#94a3b8">${ev.timeStart} – ${ev.timeEnd}</div>
        </div>
      </div>`).join('') + (events.length > 3 ? `<div style="font-size:.74rem;color:var(--ac);text-align:right;margin-top:.3rem;font-weight:700">+${events.length-3} lagi</div>` : '');
  }

  function openForm(dateStr, eventId) {
    editingId = eventId || null;
    selectedColor = 'green';
    const modal = document.getElementById('agenda-modal');
    const titleEl = document.getElementById('agenda-modal-title');
    const delBtn = document.getElementById('ag-delete-btn');
    if (!modal) return;
    // Reset form
    document.getElementById('ag-input-name').value = '';
    document.getElementById('ag-input-time-start').value = '08:00';
    document.getElementById('ag-input-time-end').value = '09:00';
    document.getElementById('ag-input-note').value = '';
    document.getElementById('ag-input-notif').checked = true;
    // Reset color buttons
    document.querySelectorAll('.ag-color-btn').forEach(b => {
      b.classList.remove('sel');
      b.style.borderColor = '#e2e8f0';
      b.style.background = '#fff';
      b.style.color = '#64748b';
    });
    const greenBtn = document.querySelector('.ag-color-btn[data-color="green"]');
    if (greenBtn) { greenBtn.classList.add('sel'); }

    if (eventId) {
      titleEl.textContent = '✏️ Edit Agenda';
      delBtn.style.display = '';
      const ev = (agendaDB[dateStr] || []).find(e => e.id === eventId);
      if (ev) {
        document.getElementById('ag-input-name').value = ev.name;
        document.getElementById('ag-input-time-start').value = ev.timeStart;
        document.getElementById('ag-input-time-end').value = ev.timeEnd;
        document.getElementById('ag-input-note').value = ev.note || '';
        document.getElementById('ag-input-notif').checked = ev.notif !== false;
        selectedColor = ev.color;
        // update color btn
        document.querySelectorAll('.ag-color-btn').forEach(b => b.classList.remove('sel'));
        const cb = document.querySelector(`.ag-color-btn[data-color="${ev.color}"]`);
        if (cb) cb.classList.add('sel');
      }
    } else {
      titleEl.textContent = '📋 Tambah Agenda';
      delBtn.style.display = 'none';
    }
    modal.classList.add('on');
  }

  function saveEvent() {
    const name = document.getElementById('ag-input-name').value.trim();
    if (!name) { showToast('Nama agenda tidak boleh kosong!', 'error'); return; }
    const timeStart = document.getElementById('ag-input-time-start').value;
    const timeEnd = document.getElementById('ag-input-time-end').value;
    const note = document.getElementById('ag-input-note').value.trim();
    const notif = document.getElementById('ag-input-notif').checked;
    if (!agendaDB[selectedDate]) agendaDB[selectedDate] = [];
    if (editingId) {
      const idx = agendaDB[selectedDate].findIndex(e => e.id === editingId);
      if (idx !== -1) agendaDB[selectedDate][idx] = { id: editingId, name, timeStart, timeEnd, note, color: selectedColor, notif };
    } else {
      agendaDB[selectedDate].push({ id: Date.now().toString(), name, timeStart, timeEnd, note, color: selectedColor, notif });
    }
    save();
    closeModal('agenda-modal');
    renderCalendar();
    renderDayEvents();
    renderHomeAgenda();
    scheduleAllNotifs();
    setTimeout(agHomeCalRender, 50);
    showToast('✅ Agenda disimpan!');
  }

  function deleteEvent() {
    if (!editingId || !selectedDate) return;
    if (!confirm('Hapus agenda ini?')) return;
    agendaDB[selectedDate] = (agendaDB[selectedDate] || []).filter(e => e.id !== editingId);
    if (!agendaDB[selectedDate].length) delete agendaDB[selectedDate];
    save();
    closeModal('agenda-modal');
    renderCalendar();
    renderDayEvents();
    renderHomeAgenda();
    showToast('🗑 Agenda dihapus');
  }

  function navigate(dir) {
    currentMonth += dir;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar();
  }

  function scheduleAllNotifs() {
    // Clear existing
    Object.values(notifTimers).forEach(t => clearTimeout(t));
    notifTimers = {};
    if (!('Notification' in window)) return;
    const now = new Date();
    Object.entries(agendaDB).forEach(([ds, events]) => {
      events.forEach(ev => {
        if (!ev.notif) return;
        const [y, m, d] = ds.split('-').map(Number);
        const [h, min] = ev.timeStart.split(':').map(Number);
        const eventTime = new Date(y, m-1, d, h, min, 0);
        const notifTime = new Date(eventTime.getTime() - 15*60*1000);
        const delay = notifTime - now;
        if (delay > 0 && delay < 7*24*60*60*1000) {
          notifTimers[ev.id] = setTimeout(() => {
            if (Notification.permission === 'granted') {
              new Notification(`⏰ EduFun — ${ev.name}`, { body: `Mulai pukul ${ev.timeStart}. Jangan sampai terlewat!`, icon: '/favicon.ico' });
            }
          }, delay);
        }
      });
    });
  }

  function requestNotifPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(p => { if (p === 'granted') scheduleAllNotifs(); });
    }
  }

  return {
    init,
    selectDate,
    navigate: (dir) => { navigate(dir); },
    openForm,
    saveEvent,
    deleteEvent,
    editEvent: (ds, id) => openForm(ds, id),
    setColor: (c) => { selectedColor = c; },
    getSelectedDate: () => selectedDate,
    refresh: () => { load(); renderCalendar(); renderDayEvents(); renderHomeAgenda(); setTimeout(agHomeCalRender, 20); },
    requestNotifPermission,
    getCalInfo: () => ({
      year: currentYear,
      month: currentMonth,
      selectedDate,
      agendaDB,
      BULAN
    })
  };
})();

// Global helpers for inline HTML calls
function agCal(dir) { AgendaSystem.navigate(dir); }
function openAgendaForm() { AgendaSystem.openForm(AgendaSystem.getSelectedDate()); }
function saveAgenda() { AgendaSystem.saveEvent(); }
function deleteAgenda() { AgendaSystem.deleteEvent(); }
function selectAgColor(color, btn) {
  AgendaSystem.setColor(color);
  document.querySelectorAll('.ag-color-btn').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
}

// Initialize agenda when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  AgendaSystem.init();
  AgendaSystem.requestNotifPermission && AgendaSystem.requestNotifPermission();
});

// goPanel is already defined above; we patch it to refresh agenda panel
const _agOrigGoPanel = goPanel;
goPanel = function(panel) {
  _agOrigGoPanel(panel);
  if (panel === 'agenda') {
    setTimeout(() => { AgendaSystem.refresh(); }, 50);
  }
};

// ============================================================
// HOME MINI CALENDAR (mirrors AgendaSystem state)
// ============================================================
function agHomeCalRender() {
  const grid = document.getElementById('home-cal-grid');
  const lbl  = document.getElementById('home-cal-month');
  if (!grid || !lbl || typeof AgendaSystem === 'undefined') return;

  const info = AgendaSystem.getCalInfo ? AgendaSystem.getCalInfo() : null;
  if (!info) return;
  const { year, month, selectedDate, agendaDB, BULAN } = info;

  lbl.textContent = `${BULAN[month]} ${year}`;
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })();

  const colorPriority = { red: 0, yellow: 1, green: 2 };
  const colorMap = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const nowHM = (() => { const n=new Date(); return n.getHours()*60+n.getMinutes(); })();

  let html = '';
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="ag-day other-month" style="font-size:.65rem;min-height:22px">${daysInPrev - i}</div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds === today;
    const isSel = ds === selectedDate;
    const events = (agendaDB && agendaDB[ds]) || [];

    // Filter only active (not yet completed) events
    const activeEvents = events.filter(ev => {
      const [eh,em] = (ev.timeEnd||'23:59').split(':').map(Number);
      const endMin = eh*60+em;
      return !((ds < today) || (ds === today && nowHM >= endMin));
    });

    // Pick highest priority active color: red > yellow > green
    let ringColor = null;
    if (activeEvents.length > 0) {
      const sorted = activeEvents.slice().sort((a,b) => (colorPriority[a.color]||99) - (colorPriority[b.color]||99));
      ringColor = sorted[0].color;
    }

    let cls = 'ag-day';
    if (isToday) cls += ' today';
    else if (isSel) cls += ' selected';
    const ring = ringColor ? `box-shadow:0 0 0 2px ${colorMap[ringColor]};` : '';
    html += `<div class="${cls}" style="font-size:.68rem;min-height:22px;${ring}" onclick="AgendaSystem.selectDate('${ds}');agHomeCalRender();goPanel('agenda')">${d}</div>`;
  }
  const total = firstDay + daysInMonth;
  const rem = total % 7 === 0 ? 0 : 7 - (total % 7);
  for (let i = 1; i <= rem; i++) {
    html += `<div class="ag-day other-month" style="font-size:.65rem;min-height:22px">${i}</div>`;
  }
  grid.innerHTML = html;
}

// Patch AgendaSystem to expose state + call home calendar render
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof AgendaSystem !== 'undefined') {
      // Monkey-patch getCalInfo to expose internal state
      if (!AgendaSystem.getCalInfo) {
        // We'll piggyback on the navigate + init to update home cal
        const _origRefresh = AgendaSystem.refresh.bind(AgendaSystem);
        AgendaSystem.refresh = function() { _origRefresh(); agHomeCalRender(); };
      }
      agHomeCalRender();
    }
  }, 300);
});

// chip/mt ripple effect removed — animasi disederhanakan

// ===========================
// STAT SCALE SYSTEM (1H / 7H / 30H)
// ===========================
let currentStatScale = 1;

// statData is dynamically built from real localStorage activity logs
// Format: { mapel: [today_mnt, 7day_mnt, 30day_mnt] }
function buildStatData() {
  const today = new Date().toDateString();
  const now = Date.now();
  const day7 = 7 * 24 * 60 * 60 * 1000;
  const day30 = 30 * 24 * 60 * 60 * 1000;
  // Include all possible mapels
  const mapelList = ['matematika','fisika','bahasa_inggris','kimia','biologi','bahasa_indonesia','sejarah','ekonomi','geografi','sosiologi'];
  const result = {};
  mapelList.forEach(m => result[m] = [0, 0, 0]);
  try {
    const logs = JSON.parse(localStorage.getItem('edufun_activity_logs') || '[]');
    logs.forEach(entry => {
      const mapel = entry.mapel;
      const mnt = entry.mnt || 0;
      const ts = entry.ts || 0;
      if (!result[mapel]) result[mapel] = [0, 0, 0];
      const age = now - ts;
      if (new Date(ts).toDateString() === today) result[mapel][0] += mnt;
      if (age <= day7)  result[mapel][1] += mnt;
      if (age <= day30) result[mapel][2] += mnt;
    });
  } catch(e) {}
  return result;
}

const statLabels = { 1: '📅 Hari ini', 7: '📆 7 hari terakhir' };
const statScaleIdx = { 1: 0, 7: 1 };
const xpChartLabels = { 1: '⚡ XP Hari Ini', 7: '⚡ XP 7 Hari' };

function setStatScale(scale, el) {
  currentStatScale = scale;
  document.querySelectorAll('.stat-scale-btn').forEach(b => {
    b.style.background = 'var(--bg,#f8fafc)';
    b.style.borderColor = 'var(--border,#e2e8f0)';
    b.style.color = 'var(--muted,#64748b)';
  });
  el.style.background = 'var(--ac)';
  el.style.borderColor = 'var(--ac)';
  el.style.color = '#fff';
  // stat-scale-label dihapus (tidak dipakai)
  const chartLbl = document.getElementById('xp-chart-label');
  if (chartLbl) chartLbl.textContent = xpChartLabels[scale] || '⚡ XP';
  renderStatBars(scale);
  renderXPChart(scale);
}

function renderStatBars(scale) {
  const idx = statScaleIdx[scale];
  const statData = buildStatData();
  // Summary chips - only from real data
  const allVals = Object.values(statData).map(v => v[idx]);
  const totalMnt = allVals.reduce((a,b) => a+b, 0);
  // XP/pomo/flash: only show real today data for 1H; show 0 for 7H if no logs
  const xpMap = { 1: Math.round(xp * 0.1), 7: idx===1&&totalMnt>0?Math.round(xp*0.4):0 };
  const pomoMap = { 1: pSessions, 7: 0 };
  const flashMap = { 1: cards.length, 7: 0 };
  // For 7H, derive from logs if available
  try {
    const logs = JSON.parse(localStorage.getItem('edufun_activity_logs') || '[]');
    const now = Date.now();
    if (scale === 7)  { pomoMap[7]  = logs.filter(l=>l.type==='pomo'&&(now-l.ts)<=7*86400000).length; flashMap[7]  = logs.filter(l=>l.type==='flash'&&(now-l.ts)<=7*86400000).length; }
  } catch(e) {}
  // Calculate actual XP earned from history logs
  let xpEarned = 0;
  try {
    const xpHist = JSON.parse(localStorage.getItem('ef_xp_history') || '[]');
    const cutoff = scale === 7 ? Date.now() - 7*86400000 : new Date().setHours(0,0,0,0);
    xpEarned = xpHist.filter(l => l.ts >= cutoff && l.amt > 0).reduce((s, l) => s + l.amt, 0);
  } catch(e) {}
  document.getElementById('stat-xp-earned').textContent = xpEarned;
  document.getElementById('stat-pomo-count').textContent = scale===1 ? pSessions : pomoMap[scale];
  document.getElementById('stat-flash-count').textContent = scale===1 ? cards.length : flashMap[scale];

  // ── Dynamic bar rendering: update existing + add dynamic bars for new mapels ──
  const maxForPeriod = Math.max(1, ...Object.values(statData).map(v => v[idx] || 0));
  const emptyHint = document.getElementById('stat-empty-hint');
  if (emptyHint) {
    emptyHint.style.display = totalMnt === 0 && scale === 7 ? 'block' : 'none';
  }

  // Map for display names
  const mapelDisplayNames = {
    matematika: '🧮 Matematika', fisika: '⚡ Fisika', kimia: '🧪 Kimia',
    biologi: '🌿 Biologi', bahasa_inggris: '🌍 B. Inggris', bahasa_indonesia: '✍️ B. Indonesia',
    sejarah: '🏛️ Sejarah', ekonomi: '📊 Ekonomi', geografi: '🗺️ Geografi', sosiologi: '🤝 Sosiologi'
  };

  // First update hardcoded bars (existing HTML)
  document.querySelectorAll('#stat-bars [data-prog]').forEach(el => {
    const key = el.dataset.prog;
    const vals = statData[key] || [0, 0, 0];
    const val = vals[idx] || 0;
    const pct = val === 0 ? 0 : Math.min(100, Math.round((val / maxForPeriod) * 100));
    const lbl = el.querySelector('.prog-lbl');
    const bar = el.querySelector('.pf');
    if (lbl) {
      if (val > 0) { lbl.textContent = val + ' mnt'; lbl.style.color = 'var(--ac,#3b82f6)'; }
      else { lbl.textContent = '—'; lbl.style.color = '#94a3b8'; }
    }
    if (bar) { bar.style.transition = 'width 0.5s ease'; bar.style.width = pct + '%'; }
  });

  // Dynamically add bars for mapels that have data but no hardcoded bar
  const dynContainer = document.getElementById('stat-bars-dynamic');
  if (dynContainer) {
    const hardcodedKeys = new Set(Array.from(document.querySelectorAll('#stat-bars [data-prog]')).map(el => el.dataset.prog));
    dynContainer.innerHTML = '';
    Object.entries(statData).forEach(([key, vals]) => {
      if (hardcodedKeys.has(key)) return; // already rendered above
      const val = vals[idx] || 0;
      if (val === 0) return; // hide empty dynamic mapels
      const pct = Math.min(100, Math.round((val / maxForPeriod) * 100));
      const name = mapelDisplayNames[key] || key;
      dynContainer.innerHTML += `
        <div data-prog="${key}" style="margin-bottom:.55rem">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.25rem">
            <span style="font-size:.78rem;font-weight:700;color:#334155">${name}</span>
            <span class="prog-lbl" style="font-size:.72rem;font-weight:700;color:var(--ac)">${val} mnt</span>
          </div>
          <div style="height:8px;background:#f1f5f9;border-radius:99px;overflow:hidden">
            <div class="pf" style="height:100%;background:var(--ac);border-radius:99px;transition:width 0.5s ease;width:${pct}%"></div>
          </div>
        </div>`;
    });
  }
}

// Auto-init stat bars
setTimeout(() => renderStatBars(1), 500);

// ===========================
// FLASHCARD MAPEL FILTER
// ===========================
let currentFcMapel = 'semua';

function setFcMapel(mapel, el) {
  currentFcMapel = mapel;
  document.querySelectorAll('#fc-mapel-tabs .chip').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel');
  renderFCList();
}

// Override renderFCList to support filter
const _origRenderFCList = renderFCList;
window.renderFCList = function() {
  const l = document.getElementById('fc-list');
  const filtered = currentFcMapel === 'semua' ? cards : cards.filter(c => c.c === currentFcMapel);
  document.getElementById('fc-count').textContent = cards.length;
  
  if (!filtered.length) {
    if (cards.length > 0 && currentFcMapel !== 'semua') {
      l.innerHTML = `<div style="text-align:center;padding:1.75rem;color:#94a3b8;font-size:.86rem;border:1.5px dashed #e2e8f0;border-radius:12px">Belum ada kartu untuk <b>${currentFcMapel}</b>.<br>Buat di atas atau pilih tab lain.</div>`;
    } else {
      l.innerHTML = '<div style="text-align:center;padding:1.75rem;color:#94a3b8;font-size:.86rem;border:1.5px dashed #e2e8f0;border-radius:12px">Belum ada kartu. Buat di atas!</div>';
    }
    document.getElementById('fc-start-wrap').style.display = 'none';
    document.getElementById('fc-study').style.display = 'none';
    return;
  }
  
  // Group by mapel if "semua"
  if (currentFcMapel === 'semua') {
    const groups = {};
    filtered.forEach(c => {
      if (!groups[c.c]) groups[c.c] = [];
      groups[c.c].push(c);
    });
    const mapelIcons2 = { Matematika:'🧮', Fisika:'⚡', Kimia:'🧪', 'Bahasa Inggris':'🌍', 'B. Indonesia':'✍️', Biologi:'🌿', Lainnya:'📂' };
    l.innerHTML = Object.entries(groups).map(([mapel, mcards]) => `
      <div style="margin-bottom:.75rem">
        <div style="font-size:.76rem;font-weight:800;color:#64748b;margin-bottom:.35rem;display:flex;align-items:center;gap:.3rem">
          ${mapelIcons2[mapel]||'📂'} ${mapel} <span style="font-size:.68rem;color:#94a3b8">(${mcards.length} kartu)</span>
        </div>
        ${mcards.map((c, i) => {
          const origIdx = cards.indexOf(c);
          return `<div style="display:flex;align-items:flex-start;gap:.65rem;background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:.7rem .9rem;transition:border-color .15s;margin-bottom:.3rem" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="this.style.borderColor='#e2e8f0'"><div style="flex:1"><div style="font-weight:700;font-size:.84rem">${c.f}</div><div style="font-size:.76rem;color:#64748b">${c.b}</div></div><button onclick="delCard(${origIdx})" style="background:none;border:none;cursor:pointer;color:#94a3b8;padding:.15rem;border-radius:6px;font-size:.9rem" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">✕</button></div>`;
        }).join('')}
      </div>
    `).join('');
  } else {
    l.innerHTML = filtered.map((c) => {
      const origIdx = cards.indexOf(c);
      return `<div style="display:flex;align-items:flex-start;gap:.65rem;background:#fff;border:2px solid #e2e8f0;border-radius:12px;padding:.7rem .9rem;transition:border-color .15s;margin-bottom:.3rem" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="this.style.borderColor='#e2e8f0'"><div style="flex:1"><div style="font-weight:700;font-size:.84rem">${c.f}</div><div style="font-size:.76rem;color:#64748b">${c.b}</div></div><button onclick="delCard(${origIdx})" style="background:none;border:none;cursor:pointer;color:#94a3b8;padding:.15rem;border-radius:6px;font-size:.9rem" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#94a3b8'">✕</button></div>`;
    }).join('');
  }
  
  document.getElementById('fc-start-wrap').style.display = filtered.length ? 'block' : 'none';
};

// ===========================
// SEARCH BOX FIX - Metode Belajar
// ===========================
const _origRenderAudioVocab = renderAudioVocab;
window.renderAudioVocab = function() {
  const search = (document.getElementById('audio-vocab-search').value || '').toLowerCase().trim();
  const filtered = audioVocabData.filter(v => {
    const matchCat = audioVocabCat === 'all' || v.cat === audioVocabCat;
    const matchSearch = !search || v.word.toLowerCase().includes(search) || v.id.toLowerCase().includes(search) || v.ex.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });
  
  const countEl = document.getElementById('audio-vocab-count');
  if (filtered.length === 0 && search) {
    // Kata kunci belum ada
    document.getElementById('audio-vocab-grid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:2rem;background:#fef9c3;border:1.5px dashed #fcd34d;border-radius:14px">
        <div style="font-size:1.5rem;margin-bottom:.5rem">🔍</div>
        <div style="font-weight:800;font-size:.9rem;color:#92400e">Kata kunci "<b>${search}</b>" belum ditambahkan</div>
        <div style="font-size:.78rem;color:#b45309;margin-top:.3rem">Coba kata lain, atau hubungi pengembang untuk menambahkan kosakata ini</div>
        <div style="font-size:.72rem;color:#d97706;margin-top:.5rem;padding:.35rem .7rem;background:#fff8d6;border-radius:8px;display:inline-block">💡 Tip: coba "${search.slice(0,3)}..." atau cari dalam bahasa Indonesia</div>
      </div>`;
    if (countEl) countEl.textContent = `Tidak ada hasil untuk "${search}"`;
    return;
  }
  
  if (countEl) countEl.textContent = `Menampilkan ${filtered.length} dari ${audioVocabData.length} kata`;
  document.getElementById('audio-vocab-grid').innerHTML = filtered.map(v => `
    <div style="background:#fff;border:2px solid #e2e8f0;border-radius:14px;padding:.85rem 1rem;cursor:pointer;transition:all .2s" onclick="speakVocab('${v.word}')" onmouseenter="this.style.borderColor='var(--ac)'" onmouseleave="this.style.borderColor='#e2e8f0'">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem">
        <span style="font-size:1.3rem">${v.icon}</span>
        <div>
          <div style="font-weight:800;font-size:.95rem;color:var(--ac)">${v.word}</div>
          <div style="font-size:.72rem;color:#94a3b8;font-family:'Courier New',monospace;letter-spacing:.02em">${v.pron}</div>
        </div>
        <span style="margin-left:auto;font-size:1.1rem;color:#94a3b8">🔊</span>
      </div>
      <div style="font-size:.82rem;color:#0f172a;font-weight:600;margin-bottom:.2rem">${v.id}</div>
      <div style="font-size:.76rem;color:#64748b;font-style:italic;margin-bottom:.3rem">"${v.ex}"</div>
      <span style="font-size:.67rem;font-weight:800;padding:.15rem .5rem;border-radius:99px;background:${audioCatBg[v.cat]||'#f1f5f9'};color:${audioCatColors[v.cat]||'#64748b'}">${audioCatIcons[v.cat]||''} ${v.cat}</span>
    </div>
  `).join('');
};

const _origRenderAudioSains = renderAudioSains;
window.renderAudioSains = function() {
  const search = (document.getElementById('audio-sains-search').value || '').toLowerCase().trim();
  const filtered = audioSainsData.filter(s => {
    const matchCat = audioSainsCat === 'all' || s.cat === audioSainsCat;
    const matchSearch = !search || s.term.toLowerCase().includes(search) || s.def.toLowerCase().includes(search) || s.latin.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });
  
  const countEl = document.getElementById('audio-sains-count');
  if (filtered.length === 0 && search) {
    document.getElementById('audio-sains-grid').innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:2rem;background:#fef9c3;border:1.5px dashed #fcd34d;border-radius:14px">
        <div style="font-size:1.5rem;margin-bottom:.5rem">🔍</div>
        <div style="font-weight:800;font-size:.9rem;color:#92400e">Istilah "<b>${search}</b>" belum ditambahkan</div>
        <div style="font-size:.78rem;color:#b45309;margin-top:.3rem">Coba istilah lain atau cari dengan kata kunci yang berbeda</div>
        <div style="font-size:.72rem;color:#d97706;margin-top:.5rem;padding:.35rem .7rem;background:#fff8d6;border-radius:8px;display:inline-block">💡 Tip: coba nama latin atau kata dasar dari istilah ini</div>
      </div>`;
    if (countEl) countEl.textContent = `Tidak ada hasil untuk "${search}"`;
    return;
  }
  
  if (countEl) countEl.textContent = `Menampilkan ${filtered.length} dari ${audioSainsData.length} istilah`;
  document.getElementById('audio-sains-grid').innerHTML = filtered.map(s => `
    <div style="background:#fff;border:2px solid #e2e8f0;border-radius:14px;padding:.85rem 1rem;cursor:pointer;transition:all .2s" onclick="speakSains('${s.latin}')" onmouseenter="this.style.borderColor='${sainsCatColor[s.cat]||'#64748b'}'" onmouseleave="this.style.borderColor='#e2e8f0'">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.35rem">
        <span style="font-size:1.3rem">${s.icon}</span>
        <div style="flex:1">
          <div style="font-weight:800;font-size:.92rem;color:${sainsCatColor[s.cat]||'#334155'}">${s.term}</div>
          <div style="font-size:.72rem;color:#94a3b8;font-style:italic;font-family:'Courier New',monospace">${s.latin}</div>
        </div>
        <span style="font-size:1.1rem;color:#94a3b8">🔊</span>
      </div>
      <div style="font-size:.78rem;color:#334155;line-height:1.55;margin-bottom:.35rem">${s.def}</div>
      <div style="font-size:.74rem;color:#64748b;font-style:italic;padding:.3rem .6rem;background:#f8fafc;border-radius:7px;margin-bottom:.35rem">${s.ex}</div>
      <span style="font-size:.67rem;font-weight:800;padding:.15rem .5rem;border-radius:99px;background:${sainsCatBg[s.cat]||'#f1f5f9'};color:${sainsCatColor[s.cat]||'#64748b'}">${s.cat.toUpperCase()}</span>
    </div>
  `).join('');
};

// ===========================
// LEADERBOARD ONLINE SYSTEM
// ===========================
const OnlineLeaderboard = (() => {
  // Real players only — loaded from Firebase. No bots, no fake data.
  let realPlayers = [];

  const rankMedals = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];

  function getRankLabel(xpVal) {
    if (xpVal >= 2000) return 'Gold III';
    if (xpVal >= 1600) return 'Gold I';
    if (xpVal >= 1200) return 'Silver III';
    if (xpVal >= 900)  return 'Silver II';
    if (xpVal >= 650)  return 'Silver I';
    if (xpVal >= 400)  return 'Bronze III';
    if (xpVal >= 200)  return 'Bronze II';
    return 'Bronze I';
  }

  function render() {
    const rows = document.getElementById('lb-rows');
    if (!rows) return;

    // Update my own XP in the footer strip
    const myXpEl = document.getElementById('lb-my-xp');
    if (myXpEl) myXpEl.textContent = xp;

    if (!realPlayers.length) {
      rows.innerHTML = `
        <div style="text-align:center;padding:2rem 1rem;color:#94a3b8">
          <div style="font-size:2rem;margin-bottom:.5rem">🏆</div>
          <div style="font-weight:700;font-size:.88rem;color:#64748b;margin-bottom:.25rem">Belum ada pemain lain</div>
          <div style="font-size:.76rem">Ajak temanmu bergabung ke EduFun!</div>
        </div>`;
      const myRankEl = document.getElementById('lb-my-rank');
      if (myRankEl) myRankEl.textContent = 'Peringkat #1';
      const myWrEl = document.getElementById('lb-my-wr');
      if (myWrEl) myWrEl.textContent = '-';
      return;
    }

    // Sort by XP descending
    const allSorted = [...realPlayers].sort((a, b) => b.xp - a.xp);
    const myName = typeof userName !== 'undefined' ? userName : '';
    const myPos  = allSorted.findIndex(p => p.name === myName);
    const sorted = allSorted.slice(0, 10);

    const rankColors = ['#f59e0b','#94a3b8','#cd7c2f','#64748b','#64748b','#64748b','#64748b','#64748b','#64748b','#64748b'];

    rows.innerHTML = sorted.map((p, i) => {
      const isMe = p.name === myName;
      return `<div style="display:flex;align-items:center;gap:.65rem;padding:.65rem 1rem;border-bottom:1px solid #f8fafc;background:${isMe ? '#f0f9ff' : 'transparent'};border-left:${isMe ? '3px solid var(--ac)' : '3px solid transparent'}">
        <div style="width:26px;font-size:.95rem;text-align:center;font-weight:800;color:${rankColors[i]}">${rankMedals[i] || (i+1)}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.85rem">${p.name}${isMe ? ' <span style="font-size:.65rem;color:var(--ac)">(Kamu)</span>' : ''}</div>
          <div style="font-size:.7rem;color:#94a3b8">${getRankLabel(p.xp)}${p.school ? ' · ' + p.school : ''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800;font-size:.85rem;color:var(--ac)">${p.xp} XP</div>
        </div>
      </div>`;
    }).join('');

    // My rank position
    const myRankEl = document.getElementById('lb-my-rank');
    if (myRankEl) myRankEl.textContent = myPos >= 0 ? 'Peringkat #' + (myPos + 1) : 'Peringkat #' + (allSorted.length + 1);
    const myWrEl = document.getElementById('lb-my-wr');
    if (myWrEl) myWrEl.textContent = getRankLabel(typeof xp !== 'undefined' ? xp : 0);
  }

  function loadFromFirebase() {
    try {
      if (typeof fbDB !== 'undefined') {
        fbDB.collection('users').orderBy('xp', 'desc').limit(20).get().then(snap => {
          realPlayers = [];
          snap.forEach(doc => {
            const d = doc.data();
            if (d && d.username) {
              realPlayers.push({ name: d.username, xp: d.xp || 0, school: d.school || '', level: d.level || 1 });
            }
          });
          // Pastikan user sendiri masuk jika belum ada
          const myName = typeof userName !== 'undefined' ? userName : '';
          if (myName && !realPlayers.find(p => p.name === myName)) {
            realPlayers.push({ name: myName, xp: typeof xp !== 'undefined' ? xp : 0, school: '' });
          }
          render();
        }).catch(e => {
          console.warn('[LB] load error:', e.code);
          render();
        });
      } else if (typeof FirebaseSync !== 'undefined' && FirebaseSync.getLeaderboard) {
        FirebaseSync.getLeaderboard(players => { realPlayers = players || []; render(); });
      } else {
        render();
      }
    } catch(e) { render(); }
  }

  function init() {
    render(); // show immediately (empty or cached)
    loadFromFirebase();
    // Refresh every 30s from real source only
    setInterval(loadFromFirebase, 30000);
  }

  return { init, render, setPlayers: (p) => { realPlayers = p || []; render(); } };
})();

// ===========================
// AGENDA SOUND NOTIFICATIONS
// ===========================
const AgendaSound = (() => {
  let checkInterval = null;
  let firedEvents = new Set();
  
  function playAgendaStart() {
    // Fanfare sound for start
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0, c.currentTime + i*0.15);
        g.gain.linearRampToValueAtTime(0.35, c.currentTime + i*0.15 + 0.02);
        g.gain.linearRampToValueAtTime(0, c.currentTime + i*0.15 + 0.2);
        o.start(c.currentTime + i*0.15);
        o.stop(c.currentTime + i*0.15 + 0.25);
      });
    } catch(e) {}
  }
  
  function playAgendaEnd() {
    // Descending tone for end
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [784, 659, 523, 392];
      notes.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0, c.currentTime + i*0.18);
        g.gain.linearRampToValueAtTime(0.3, c.currentTime + i*0.18 + 0.02);
        g.gain.linearRampToValueAtTime(0, c.currentTime + i*0.18 + 0.22);
        o.start(c.currentTime + i*0.18);
        o.stop(c.currentTime + i*0.18 + 0.28);
      });
    } catch(e) {}
  }
  
  function playAgendaReminder() {
    // Reminder: 3 beeps
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.2, 0.4].forEach(delay => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sine'; o.frequency.value = 880;
        g.gain.setValueAtTime(0, c.currentTime + delay);
        g.gain.linearRampToValueAtTime(0.25, c.currentTime + delay + 0.01);
        g.gain.linearRampToValueAtTime(0, c.currentTime + delay + 0.1);
        o.start(c.currentTime + delay);
        o.stop(c.currentTime + delay + 0.12);
      });
    } catch(e) {}
  }

  function showAgendaToast(msg, color) {
    const t = document.getElementById('toast');
    if (t) {
      t.textContent = msg;
      t.style.background = color || '';
      t.classList.add('on');
      setTimeout(() => { t.classList.remove('on'); t.style.background = ''; }, 5000);
    }
  }
  
  function check() {
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
    const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const nowMinus15 = new Date(now.getTime() - 15*60000);
    const minus15Time = `${pad(nowMinus15.getHours())}:${pad(nowMinus15.getMinutes())}`;
    
    // Get today's events from AgendaSystem
    let agendaDB = {};
    try { agendaDB = JSON.parse(localStorage.getItem('edufun_agenda_v1') || '{}'); } catch(e) {}
    const events = agendaDB[todayStr] || [];
    
    events.forEach(ev => {
      if (!ev.notif) return;
      
      // 15-min reminder
      const remKey = `rem_${todayStr}_${ev.id}`;
      if (ev.timeStart === nowTime && !firedEvents.has(remKey) && nowMinus15.getMinutes() !== now.getMinutes()) {
        // actually check if we're within 1 min of reminder time
      }
      
      // Start time notification
      const startKey = `start_${todayStr}_${ev.id}`;
      if (ev.timeStart === nowTime && !firedEvents.has(startKey)) {
        firedEvents.add(startKey);
        playAgendaStart();
        showAgendaToast(`🟢 ${ev.name} dimulai sekarang!`, 'linear-gradient(135deg,#22c55e,#16a34a)');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🟢 Agenda Dimulai: ${ev.name}`, { body: `Waktu: ${ev.timeStart} – ${ev.timeEnd}`, icon: '/favicon.ico' });
        }
      }
      
      // End time notification
      const endKey = `end_${todayStr}_${ev.id}`;
      if (ev.timeEnd === nowTime && !firedEvents.has(endKey)) {
        firedEvents.add(endKey);
        playAgendaEnd();
        showAgendaToast(`🔴 ${ev.name} telah berakhir`, 'linear-gradient(135deg,#ef4444,#dc2626)');
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`🔴 Agenda Selesai: ${ev.name}`, { body: `Agenda telah berakhir pukul ${ev.timeEnd}`, icon: '/favicon.ico' });
        }
      }
      
      // 15-min before reminder
      const reminderKey = `remind_${todayStr}_${ev.id}`;
      if (!firedEvents.has(reminderKey)) {
        const [h, m] = ev.timeStart.split(':').map(Number);
        const eventTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
        const diff = eventTime - now;
        if (diff > 0 && diff <= 15*60*1000 && diff > 14*60*1000) {
          firedEvents.add(reminderKey);
          playAgendaReminder();
          showAgendaToast(`⏰ ${ev.name} dimulai 15 menit lagi!`, 'linear-gradient(135deg,#f59e0b,#d97706)');
        }
      }
    });
  }
  
  function init() {
    check();
    checkInterval = setInterval(check, 30000); // check every 30 seconds
  }
  
  return { init, playAgendaStart, playAgendaEnd, playAgendaReminder };
})();

// ===========================
// AGENDA TIME INDICATOR
// ===========================
function renderAgendaTimeIndicator() {
  // Add current-time indicator to event list
  const list = document.getElementById('ag-event-list');
  if (!list) return;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const pad = n => String(n).padStart(2,'0');
  const nowStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  
  // Inject time marker into event list items
  const items = list.querySelectorAll('.ag-event-item');
  items.forEach(item => {
    const timeEl = item.querySelector('[data-time-start]');
    if (!timeEl) return;
    const [sh, sm] = timeEl.dataset.timeStart.split(':').map(Number);
    const [eh, em] = timeEl.dataset.timeEnd.split(':').map(Number);
    const startMin = sh*60+sm, endMin = eh*60+em;
    
    // Currently ongoing?
    if (nowMin >= startMin && nowMin < endMin) {
      item.style.borderLeft = '4px solid #22c55e';
      item.style.background = '#f0fdf4';
    }
  });
}

// ===========================
// INIT ALL NEW SYSTEMS
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    OnlineLeaderboard.init();
    AgendaSound.init();
    renderStatBars(1);
    
    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(0.8); }
      }
      .fc-mapel-section { margin-bottom: .75rem; }
    `;
    document.head.appendChild(style);
  }, 1000);
  
  // Refresh leaderboard every 30s
  setInterval(() => {
    if (typeof OnlineLeaderboard !== 'undefined') OnlineLeaderboard.render();
  }, 30000);
});

// Also init when going to arena panel
const _origGoPanelArena = goPanel;
goPanel = function(panel) {
  _origGoPanelArena(panel);
  if (panel === 'arena') {
    setTimeout(() => OnlineLeaderboard.render(), 100);
  }
};

// ── Handle navigation back from sub-pages (e.g. termodinamika.html) ──
(function() {
  try {
    const target = sessionStorage.getItem('ef_goto');
    if (target) {
      sessionStorage.removeItem('ef_goto');
      // Wait for app to fully init then switch panel
      setTimeout(() => { if (typeof goPanel === 'function') goPanel(target); }, 120);
    }
  } catch(e) {}
})();

// ===========================
// XP HISTORY CHART
// ===========================
function renderXPChart(scale) {
  scale = scale || currentStatScale || 1;
  const canvas = document.getElementById('xp-history-canvas');
  if (!canvas) return;

  // FIX: wait for canvas to have real dimensions before drawing
  const W = canvas.clientWidth || canvas.parentElement && canvas.parentElement.clientWidth || 320;
  const H = 120;
  if (W < 10) { setTimeout(() => renderXPChart(scale), 80); return; }

  const dpr = window.devicePixelRatio || 1;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  const ctx = canvas.getContext('2d');
  ctx.setTransform(1,0,0,1,0,0);
  ctx.scale(dpr, dpr);

  // Load XP history
  let logs = [];
  try { logs = JSON.parse(localStorage.getItem('ef_xp_history') || '[]'); } catch(e) {}

  const now = Date.now();
  const msPerDay  = 86400000;
  const msPerHour = 3600000;

  // ── Build data points ─────────────────────────────────────
  let cumulData = [], xLabels = [], xLabelIdxs = [];

  if (scale === 1) {
    // 1H mode: 24 hourly buckets for today (midnight → now)
    const pts = 24;
    const midnightToday = new Date(); midnightToday.setHours(0,0,0,0);
    const startOfDay = midnightToday.getTime();
    const buckets = Array(pts).fill(0);
    logs.forEach(entry => {
      if (entry.amt <= 0) return;
      const hrIdx = Math.floor((entry.ts - startOfDay) / msPerHour);
      if (hrIdx >= 0 && hrIdx < pts) buckets[hrIdx] += entry.amt;
    });
    // Build cumulative: buckets[i] = XP gained in hour i; cumulData[i] = running total up to end of hour i
    let running = 0;
    for (let i = 0; i < pts; i++) {
      running += buckets[i];
      cumulData[i] = running;
    }
    xLabels    = ['00:00', '06:00', '12:00', '18:00', 'Skrg'];
    xLabelIdxs = [0, 6, 12, 18, 23];

  } else {
    // 7H mode: 7 daily buckets (7 days ago → today)
    const pts = 7;
    const buckets = Array(pts).fill(0);
    // day index 0 = 6 days ago, index 6 = today
    logs.forEach(entry => {
      if (entry.amt <= 0) return;
      const daysAgo = Math.floor((now - entry.ts) / msPerDay);
      const dayIdx = pts - 1 - daysAgo;
      if (dayIdx >= 0 && dayIdx < pts) buckets[dayIdx] += entry.amt;
    });
    let running = 0;
    for (let i = 0; i < pts; i++) {
      running += buckets[i];
      cumulData[i] = running;
    }
    // Build date labels for x axis
    const dayNames = [];
    for (let d = 6; d >= 0; d--) {
      const dt = new Date(now - d * msPerDay);
      dayNames.push(d === 0 ? 'Hari ini' : `${dt.getDate()}/${dt.getMonth()+1}`);
    }
    xLabels    = [dayNames[0], dayNames[3], dayNames[6]];
    xLabelIdxs = [0, 3, 6];
  }

  const pts     = cumulData.length;
  const maxVal  = Math.max(...cumulData, 10);
  const minVal  = 0;

  // ── Colors ────────────────────────────────────────────────
  const acColor = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim() || '#3b82f6';
  const acHex   = acColor.startsWith('#') ? acColor : '#3b82f6';

  // ── Background ────────────────────────────────────────────
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, 'rgba(240,249,255,0.85)');
  bgGrad.addColorStop(1, 'rgba(248,250,252,0.5)');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

  // ── Layout ────────────────────────────────────────────────
  const padL = 32, padR = 10, padT = 14, padB = 20;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  function xPos(i) { return pts < 2 ? padL + chartW : padL + (i / (pts - 1)) * chartW; }
  function yPos(v) { return padT + chartH - (maxVal > 0 ? ((v - minVal) / maxVal) * chartH : 0); }

  // ── Grid lines + Y labels ─────────────────────────────────
  ctx.strokeStyle = 'rgba(203,213,225,0.55)';
  ctx.lineWidth   = 1;
  const gridSteps = 3;
  for (let g = 0; g <= gridSteps; g++) {
    const frac = g / gridSteps;
    const gy   = padT + chartH * frac;
    const val  = Math.round(maxVal * (1 - frac));
    ctx.beginPath(); ctx.moveTo(padL - 4, gy); ctx.lineTo(W, gy); ctx.stroke();
    ctx.fillStyle = 'rgba(100,116,139,0.65)';
    ctx.font      = `${Math.round(8.5 * Math.min(W/320, 1))}px Plus Jakarta Sans, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(val, padL - 6, gy + 3);
  }

  // ── Area fill ─────────────────────────────────────────────
  const areaGrad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
  areaGrad.addColorStop(0, acHex + '35');
  areaGrad.addColorStop(1, acHex + '05');

  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(cumulData[0]));
  for (let i = 1; i < pts; i++) {
    const cx = (xPos(i-1) + xPos(i)) / 2;
    ctx.bezierCurveTo(cx, yPos(cumulData[i-1]), cx, yPos(cumulData[i]), xPos(i), yPos(cumulData[i]));
  }
  ctx.lineTo(xPos(pts-1), padT + chartH);
  ctx.lineTo(xPos(0),     padT + chartH);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // ── Line ──────────────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(xPos(0), yPos(cumulData[0]));
  for (let i = 1; i < pts; i++) {
    const cx = (xPos(i-1) + xPos(i)) / 2;
    ctx.bezierCurveTo(cx, yPos(cumulData[i-1]), cx, yPos(cumulData[i]), xPos(i), yPos(cumulData[i]));
  }
  ctx.strokeStyle = acColor;
  ctx.lineWidth   = 2.5;
  ctx.shadowColor = acColor;
  ctx.shadowBlur  = 5;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // ── Endpoint dot ─────────────────────────────────────────
  ctx.beginPath();
  ctx.arc(xPos(pts-1), yPos(cumulData[pts-1]), 4.5, 0, Math.PI*2);
  ctx.fillStyle   = '#fff';
  ctx.fill();
  ctx.strokeStyle = acColor;
  ctx.lineWidth   = 2;
  ctx.stroke();

  // ── X-axis labels ─────────────────────────────────────────
  ctx.fillStyle = 'rgba(100,116,139,0.8)';
  ctx.font      = `${Math.round(8 * Math.min(W/320, 1))}px Plus Jakarta Sans, sans-serif`;
  xLabelIdxs.forEach((di, li) => {
    ctx.textAlign = li === 0 ? 'left' : li === xLabelIdxs.length - 1 ? 'right' : 'center';
    const lx = li === 0 ? xPos(di) : li === xLabelIdxs.length - 1 ? xPos(di) : xPos(di);
    ctx.fillText(xLabels[li], lx, H - 4);
  });
  ctx.textAlign = 'left';

  // ── Overlay labels ────────────────────────────────────────
  const totalXP = cumulData[pts - 1];
  const xpChartLabel2 = document.getElementById('xp-chart-current');
  if (xpChartLabel2) { xpChartLabel2.textContent = totalXP + ' XP'; xpChartLabel2.style.color = acColor; xpChartLabel2.style.textShadow = 'none'; }
  const xpLbl = document.getElementById('xp-chart-label');
  if (xpLbl) { xpLbl.style.color = acColor; xpLbl.style.textShadow = 'none'; xpLbl.style.opacity = '0.85'; }
}

// Auto-render XP chart when stats panel is opened
const _origGoPanel_xp = goPanel;
goPanel = function(panel) {
  _origGoPanel_xp(panel);
  if (panel === 'home') setTimeout(() => renderXPChart(currentStatScale || 1), 120);
};
// First render: wait for layout to settle
function _initXPChart() {
  const canvas = document.getElementById('xp-history-canvas');
  if (!canvas || canvas.clientWidth < 10) { setTimeout(_initXPChart, 100); return; }
  renderXPChart(1);
}
setTimeout(_initXPChart, 300);
window.addEventListener('resize', () => renderXPChart(currentStatScale || 1));

// ═══════════════════════════════════════════════════════════════
// REALTIME PRIVATE BATTLE SYSTEM — PATCH (replaces old functions)
// ═══════════════════════════════════════════════════════════════

(function() {
  // ── UID helper ──
  function myUid() {
    return (typeof Auth !== 'undefined' && Auth.getSession && Auth.getSession()) ? Auth.getSession().uid : (userName || 'guest');
  }

  let _roomListener = null;
  let _battleListener = null;

  window._roomListener = null;

  // ── Override openPrivateLobby ──
  window.openPrivateLobby = function(code) {
    if (window._roomListener) { window._roomListener(); window._roomListener = null; }
    if (typeof brPollIv !== 'undefined' && brPollIv) { clearInterval(brPollIv); brPollIv = null; }

    showArenaMode('private-lobby');
    document.getElementById('priv-room-code').textContent = code;
    document.getElementById('priv-players-list').innerHTML =
      '<div style="text-align:center;padding:1rem;color:#94a3b8">⏳ Memuat...</div>';

    window._roomListener = fbDB.collection('rooms').doc(code).onSnapshot((snap) => {
      if (!snap.exists) {
        if (window._roomListener) { window._roomListener(); window._roomListener = null; }
        toast('⚠️ Room sudah dihapus');
        showArenaMode('sel');
        return;
      }
      const room = snap.data();
      window._currentRoom = room;
      document.getElementById('priv-room-meta').textContent =
        (room.mapel || '') + ' · ' + (room.level || '') + ' · Maks. 2 pemain';

      // Jika battle sudah dimulai, langsung masuk game
      if (room.battleStarted) {
        renderLobbyReady();
        if (!window._btEntering) {
          window._btEntering = true;
          setTimeout(() => { window._btEntering = false; enterBattleFromRoom(room); }, 600);
        }
      } else {
        renderLobbyFromRoom(room, code);
      }
    }, (err) => {
      console.error('[Room] listener error:', err);
      toast('❌ Koneksi room terputus');
      showArenaMode('sel');
    });
  };

  function renderLobbyReady() {
    const statusEl = document.getElementById('priv-room-status');
    const startBtn = document.getElementById('priv-start-btn');
    if (statusEl) { statusEl.textContent = '🚀 Semua siap! Memasuki arena...'; statusEl.style.background = '#f0fdf4'; statusEl.style.borderColor = '#86efac'; statusEl.style.color = '#166634'; }
    if (startBtn) startBtn.style.display = 'none';
  }

  function renderLobbyFromRoom(room, code) {
    const uid = myUid();
    const players = Object.values(room.players || {}).filter(p => !p.left);
    const list = document.getElementById('priv-players-list');

    list.innerHTML = players.map((p, i) => {
      const isMe = p.uid === uid;
      const isReady = !!p.ready;
      return `<div style="display:flex;align-items:center;gap:.65rem;background:${isReady ? '#f0fdf4' : '#f8fafc'};border:2px solid ${isReady ? '#86efac' : '#e2e8f0'};border-radius:10px;padding:.55rem .75rem;transition:all .3s">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--ac-l);border:2px solid var(--ac-m);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.8rem;color:var(--ac)">${i+1}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:.85rem">${p.name}${isMe ? ' <span style="font-size:.65rem;color:#94a3b8">(Kamu)</span>' : ''}</div>
        </div>
        <div style="font-size:.78rem;font-weight:800;color:${isReady ? '#16a34a' : '#f59e0b'}">${isReady ? '✅ Siap' : '⏳ Belum'}</div>
      </div>`;
    }).join('') +
      (players.length < 2
        ? `<div style="text-align:center;padding:.5rem;color:#94a3b8;font-size:.76rem;border:1.5px dashed #e2e8f0;border-radius:10px">⏳ Menunggu ${2 - players.length} pemain lagi...</div>`
        : '');

    const statusEl = document.getElementById('priv-room-status');
    const startBtn = document.getElementById('priv-start-btn');
    const myPlayer = (room.players || {})[uid];
    const meReady  = myPlayer && myPlayer.ready;
    const allReady = players.length >= 2 && players.every(p => p.ready);

    if (allReady) {
      renderLobbyReady();
      // Host (first creator uid) mulai battle
      const hostUid = room.hostUid || Object.keys(room.players || {})[0];
      if (uid === hostUid && !room.battleStarted) {
        hostStartBattle(room, code);
      }
    } else if (players.length >= 2) {
      if (statusEl) {
        statusEl.textContent = meReady ? '✅ Kamu sudah siap! Menunggu lawan...' : '👆 Klik "Siap Battle!" untuk lanjut';
        statusEl.style.background = meReady ? '#f0fdf4' : '#fffbeb';
        statusEl.style.borderColor = meReady ? '#bbf7d0' : '#fde68a';
        statusEl.style.color = meReady ? '#166634' : '#92400e';
      }
      if (startBtn) {
        startBtn.style.display = '';
        startBtn.disabled = meReady;
        startBtn.style.opacity = meReady ? '.5' : '1';
        startBtn.style.cursor = meReady ? 'not-allowed' : 'pointer';
        startBtn.textContent = meReady ? '✅ Sudah Siap!' : '⚔️ Siap Battle!';
      }
    } else {
      if (statusEl) { statusEl.textContent = '⏳ Menunggu pemain lain bergabung...'; statusEl.style.background = '#fffbeb'; statusEl.style.borderColor = '#fde68a'; statusEl.style.color = '#92400e'; }
      if (startBtn) startBtn.style.display = 'none';
    }
  }

  // Tombol Siap — simpan ready + karakter ke Firestore
  window.startPrivateBattle = async function() {
    const uid = myUid();
    const code = brCode || (window._currentRoom && window._currentRoom.code);
    if (!code) return;
    try {
      await fbDB.collection('rooms').doc(code).update({
        ['players.' + uid + '.ready']: true,
        ['players.' + uid + '.character']: Object.assign({}, ch),
      });
      toast('✅ Siap! Menunggu lawan...');
      const startBtn = document.getElementById('priv-start-btn');
      if (startBtn) { startBtn.disabled = true; startBtn.style.opacity = '.5'; startBtn.textContent = '✅ Sudah Siap!'; }
    } catch(e) {
      console.error('[Room] set ready error:', e);
      toast('❌ Gagal. Cek koneksi.');
    }
  };

  // Host load soal lalu set battleStarted di Firestore
  async function hostStartBattle(room, code) {
    if (window._hostStarting) return;
    window._hostStarting = true;
    try {
      const soal = await GeminiQuiz.getQuestions(room.mapel, room.level || 'Sedang');
      const questions = soal.slice(0, 10).map(q => ({ q: q.q, o: q.o, a: q.a }));
      // Inisialisasi HP semua pemain
      const playerHP = {};
      Object.keys(room.players || {}).forEach(k => { if (!room.players[k].left) playerHP[k] = 100; });
      await fbDB.collection('rooms').doc(code).update({
        battleStarted: true,
        battleState: { questions, playerHP, startedAt: Date.now() }
      });
    } catch(e) {
      console.error('[Room] host start error:', e);
      toast('❌ Gagal memulai battle. Coba lagi.');
    }
    window._hostStarting = false;
  }

  // Masuk ke arena dari data room Firestore
  function enterBattleFromRoom(room) {
    if (window._roomListener) { window._roomListener(); window._roomListener = null; }

    const uid = myUid();
    const players = Object.values(room.players || {}).filter(p => !p.left);
    const me = players.find(p => p.uid === uid);
    const opponent = players.find(p => p.uid !== uid);
    if (!me || !opponent) { toast('❌ Data pemain tidak lengkap'); showArenaMode('sel'); return; }

    const bs = room.battleState || {};
    window._btQs = bs.questions || [];
    window._btSubj = room.mapel;
    window._btIsBot = false;
    btMode = 'room'; btXpWin = 50; btQ = 0;
    window._btFinished = false;
    window._opponentUid = opponent.uid;
    window._myUidBt = uid;

    const hpMap = bs.playerHP || {};
    btPHP = hpMap[uid] != null ? hpMap[uid] : 100;
    btEHP = hpMap[opponent.uid] != null ? hpMap[opponent.uid] : 100;

    // Nama
    document.getElementById('bt-p-name').textContent = me.name;
    document.getElementById('bt-p-label').textContent = me.name;
    document.getElementById('bt-e-name').textContent = '👤 ' + opponent.name;
    document.getElementById('bt-e-label').textContent = '👤 ' + opponent.name;

    // Karakter — kita pakai data asli dari Firestore!
    renderAvWithData('bt-player-svg', me.character || ch);
    if (opponent.character && Object.keys(opponent.character).length > 0) {
      renderAvWithData('bt-enemy-svg', opponent.character);
    } else {
      renderBotSvg('bt-enemy-svg');
    }

    // HP bars
    document.getElementById('bt-p-hp').textContent = btPHP + ' HP';
    document.getElementById('bt-e-hp').textContent = btEHP + ' HP';
    document.getElementById('bt-p-bar').style.width = btPHP + '%';
    document.getElementById('bt-e-bar').style.width = btEHP + '%';
    document.getElementById('bt-p-bar').style.background = 'linear-gradient(90deg,#22c55e,#86efac)';
    document.getElementById('bt-e-bar').style.background = 'linear-gradient(90deg,#ef4444,#fca5a5)';

    showArenaMode('game');
    SFX.battleStart();
    setTimeout(() => SFX.startBattleBg(), 300);

    // ── Realtime listener untuk HP sync ──
    if (_battleListener) { _battleListener(); _battleListener = null; }
    const code = room.code || brCode;
    _battleListener = fbDB.collection('rooms').doc(code).onSnapshot((snap) => {
      if (!snap.exists || window._btFinished) return;
      const data = snap.data();
      const hps = (data.battleState || {}).playerHP || {};
      const newMyHp  = hps[uid];
      const newOppHp = hps[opponent.uid];

      // HP kita dikurangi lawan
      if (newMyHp != null && newMyHp !== btPHP) {
        const oldHp = btPHP;
        btPHP = newMyHp;
        updateHP();
        if (oldHp > btPHP) {
          const playerSvg = document.getElementById('bt-player-svg');
          if (playerSvg) { playerSvg.classList.remove('char-hit'); void playerSvg.offsetWidth; playerSvg.classList.add('char-hit'); }
          document.getElementById('bt-log').textContent = '💥 Lawan menjawab benar! -' + (oldHp - btPHP) + ' HP kamu!';
        }
        if (btPHP <= 0) { finishPrivateBattle(false, code); return; }
      }

      // HP lawan dikurangi kita (sync ke device lain)
      if (newOppHp != null && newOppHp !== btEHP) {
        btEHP = newOppHp;
        updateHP();
        if (btEHP <= 0) { finishPrivateBattle(true, code); return; }
      }
    });

    logActivity(room.mapel, 1, 'room_join');
    updateStatBarsSafe();
    document.getElementById('bt-log').textContent = '⚡ Battle dimulai! Jawab sebelum waktu habis!';
    renderBQ();
  }

  function finishPrivateBattle(won, code) {
    if (window._btFinished) return;
    window._btFinished = true;
    clearInterval(btInterval);
    SFX.stopBattleBg();
    if (_battleListener) { _battleListener(); _battleListener = null; }
    const xpGain   = btXpWin;
    const xpLoss   = Math.round(btXpWin * 2);
    document.getElementById('bt-log').textContent = won
      ? '🏆 MENANG! Lawan HP habis! +' + xpGain + ' XP! 🎉'
      : '💀 HP kamu habis! Kalah! -' + xpLoss + ' XP';
    if (won) { SFX.win(); addXP(xpGain); }
    else { SFX.lose(); addXP(-xpLoss); }
    logActivity(window._btSubj || 'Fisika', Math.max(2, btQ), 'battle');
    if (typeof FirebaseSync !== 'undefined') {
      FirebaseSync.onBattleResult(won, won ? xpGain : 0);
      FirebaseSync.saveXPLevel(xp, level);
    }
    setTimeout(() => showArenaMode('sel'), 3000);
  }

  // Override answerBattle untuk mode room — push HP ke Firestore
  const _origAnswerBattle = window.answerBattle;
  window.answerBattle = function(idx) {
    if (btMode !== 'room') { _origAnswerBattle(idx); return; }
    if (btAnswered || window._btFinished) return;
    btAnswered = true; clearInterval(btInterval);
    const q = window._btQs[btQ];
    const btns = document.querySelectorAll('#bt-opts button');
    btns.forEach(b => b.style.cursor = 'default');
    if (btns[q.a]) { btns[q.a].style.borderColor = '#22c55e'; btns[q.a].style.background = '#f0fdf4'; btns[q.a].style.color = '#166534'; }
    const code = brCode || (window._currentRoom && window._currentRoom.code);

    if (idx === q.a) {
      SFX.correct();
      btEHP = Math.max(0, btEHP - 25);
      document.getElementById('bt-log').textContent = '✅ Benar! Lawan -25 HP! +' + Math.round(btXpWin / 3) + ' XP';
      addXP(Math.round(btXpWin / 3));
      const enemySvg = document.getElementById('bt-enemy-svg');
      if (enemySvg) { enemySvg.classList.remove('char-hit-r'); void enemySvg.offsetWidth; enemySvg.classList.add('char-hit-r'); }
      const playerSvg = document.getElementById('bt-player-svg');
      if (playerSvg) { playerSvg.classList.remove('char-win'); void playerSvg.offsetWidth; playerSvg.classList.add('char-win'); }
      // Push HP lawan ke Firestore → device lawan akan melihat HP-nya berkurang
      if (code && window._opponentUid) {
        fbDB.collection('rooms').doc(code).update({
          ['battleState.playerHP.' + window._opponentUid]: btEHP
        }).catch(e => console.warn('[Battle] push opp HP error:', e));
      }
      updateHP();
      if (btEHP <= 0) { finishPrivateBattle(true, code); return; }
    } else {
      SFX.wrong();
      if (btns[idx]) { btns[idx].style.borderColor = '#ef4444'; btns[idx].style.background = '#fef2f2'; btns[idx].style.color = '#991b1b'; }
      btPHP = Math.max(0, btPHP - 20);
      addXP(-Math.round(btXpWin / 3));
      document.getElementById('bt-log').textContent = '❌ Salah! -20 HP kamu. Jawaban: ' + q.o[q.a];
      const playerSvg = document.getElementById('bt-player-svg');
      if (playerSvg) { playerSvg.classList.remove('char-hit'); void playerSvg.offsetWidth; playerSvg.classList.add('char-hit'); }
      // Push HP kita ke Firestore
      if (code && window._myUidBt) {
        fbDB.collection('rooms').doc(code).update({
          ['battleState.playerHP.' + window._myUidBt]: btPHP
        }).catch(e => console.warn('[Battle] push my HP error:', e));
      }
      updateHP();
      if (btPHP <= 0) { finishPrivateBattle(false, code); return; }
    }
    btQ++; setTimeout(renderBQ, 1600);
  };

  // Override leavePrivateRoom
  window.leavePrivateRoom = async function() {
    if (window._roomListener) { window._roomListener(); window._roomListener = null; }
    if (_battleListener) { _battleListener(); _battleListener = null; }
    if (typeof brPollIv !== 'undefined' && brPollIv) { clearInterval(brPollIv); brPollIv = null; }
    const code = brCode || (window._currentRoom && window._currentRoom.code);
    if (code) {
      try {
        const uid = myUid();
        await fbDB.collection('rooms').doc(code).update({ ['players.' + uid + '.left']: true });
        const snap = await fbDB.collection('rooms').doc(code).get();
        if (snap.exists) {
          const room = snap.data();
          const anyActive = Object.values(room.players || {}).some(p => !p.left);
          if (!anyActive) await fbDB.collection('rooms').doc(code).delete();
        }
      } catch(e) { console.warn('[Room] leave error:', e); }
      brCode = '';
    }
    showArenaMode('sel');
  };

})();

// ── Admin button visibility ──
(function() {
  function showAdminBtn() {
    ['admin-btn-dd','admin-btn-dd-mob'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });
  }
  // Cek setiap kali userRole berubah (dipanggil setelah login)
  const origOnSessionLoad = window._onSessionLoaded;
  window._onSessionLoaded = function(session) {
    if (origOnSessionLoad) origOnSessionLoad(session);
    if (session && session.role === 'admin') showAdminBtn();
  };
  // Fallback: cek setelah 2 detik
  setTimeout(() => {
    if (typeof userRole !== 'undefined' && userRole === 'admin') showAdminBtn();
  }, 2000);
})();

// ═══════════════════════════════════════════════════════════════
// MABAR FIX: timeout sync + exit notification
// ═══════════════════════════════════════════════════════════════
(function() {

  // ── Override btTimeout agar push HP ke Firestore saat waktu habis ──
  window.btTimeout = function() {
    SFX.timeOut();
    document.getElementById('bt-timer').classList.remove('urgent');

    if (btMode === 'room' && !window._btFinished) {
      // Mode mabar: timeout = kurangi HP sendiri & push ke Firestore
      btPHP = Math.max(0, btPHP - 15);
      document.getElementById('bt-log').textContent = '⏰ Waktu habis! -15 HP kamu!';
      const playerSvg = document.getElementById('bt-player-svg');
      if (playerSvg) { playerSvg.classList.remove('char-hit'); void playerSvg.offsetWidth; playerSvg.classList.add('char-hit'); }
      updateHP();

      // Push HP kita ke Firestore supaya device lawan lihat bar kita turun
      const code = brCode || (window._currentRoom && window._currentRoom.code);
      const myUid = window._myUidBt;
      if (code && myUid) {
        fbDB.collection('rooms').doc(code).update({
          ['battleState.playerHP.' + myUid]: btPHP
        }).catch(e => console.warn('[BT] timeout push HP error:', e));
      }

      if (btPHP <= 0) {
        // Tulis flag "surrendered" agar lawan tahu kita sudah kalah
        if (code) {
          fbDB.collection('rooms').doc(code).update({ battleEnded: myUid + '_dead' })
            .catch(() => {});
        }
        // Panggil finishPrivateBattle (sudah di-define di patch sebelumnya)
        if (typeof finishPrivateBattle === 'function') {
          finishPrivateBattle(false, code);
        } else {
          setTimeout(() => showArenaMode('sel'), 800);
        }
        return;
      }
      btAnswered = false;
      btQ++; setTimeout(renderBQ, 1200);
    } else {
      // Mode bot: perilaku asli
      btPHP = Math.max(0, btPHP - 15);
      document.getElementById('bt-log').textContent = '⏰ Waktu habis! -15 HP';
      const playerSvg = document.getElementById('bt-player-svg');
      if (playerSvg) { playerSvg.classList.remove('char-hit'); void playerSvg.offsetWidth; playerSvg.classList.add('char-hit'); }
      updateHP();
      if (btPHP <= 0) { setTimeout(finishBattle, 800); return; }
      btQ++; setTimeout(renderBQ, 1200);
    }
  };

  // ── Override endBattle (tombol "Keluar Battle") ──
  window.endBattle = function() {
    clearInterval(btInterval);
    SFX.stopBattleBg();
    document.getElementById('bt-timer').classList.remove('urgent');

    if (btMode === 'room' && !window._btFinished) {
      // Beritahu lawan bahwa kita keluar = lawan menang
      const code = brCode || (window._currentRoom && window._currentRoom.code);
      const myUid = window._myUidBt;
      if (code && myUid) {
        // Set flag forfeit di Firestore — lawan akan dapat notif menang
        fbDB.collection('rooms').doc(code).update({
          battleEnded: myUid + '_forfeit',
          ['battleState.playerHP.' + myUid]: 0
        }).catch(() => {});
      }
      window._btFinished = true;
      // Stop battle listener
      // (akan di-cleanup sendiri karena _btFinished = true)
      toast('🏳️ Kamu menyerah. Battle dibatalkan.');
    }

    showArenaMode('sel');
  };

  // ── Patch battle listener untuk deteksi forfeit/exit lawan ──
  // Inject ke dalam enterBattleFromRoom yang sudah override onSnapshot
  // Caranya: tambahkan cek battleEnded di listener yang sudah ada

  const _origEnterBattle = window.enterBattleFromRoom;

  // Tambahkan watcher battleEnded ke Firestore listener yang sudah ada
  // dengan meng-override fungsi di dalam IIFE sebelumnya via event
  document.addEventListener('_btRoomReady', function(e) {
    const code = e.detail && e.detail.code;
    const opponentUid = e.detail && e.detail.opponentUid;
    if (!code || !opponentUid) return;

    // Extra listener khusus battleEnded flag
    const unsub = fbDB.collection('rooms').doc(code).onSnapshot((snap) => {
      if (!snap.exists || window._btFinished) { unsub(); return; }
      const data = snap.data();
      if (!data.battleEnded) return;

      const ended = data.battleEnded;
      // Kalau yang forfeit/dead adalah lawan → kita menang
      if (ended.startsWith(opponentUid)) {
        unsub();
        if (!window._btFinished) {
          window._btFinished = true;
          clearInterval(btInterval);
          SFX.stopBattleBg();
          const reason = ended.endsWith('forfeit') ? '🏳️ Lawan keluar dari battle!' : '💀 Lawan HP habis!';
          document.getElementById('bt-log').textContent = reason + ' Kamu MENANG! +' + btXpWin + ' XP 🎉';
          SFX.win(); addXP(btXpWin);
          logActivity(window._btSubj || 'Fisika', Math.max(2, btQ), 'battle');
          if (typeof FirebaseSync !== 'undefined') { FirebaseSync.onBattleResult(true, btXpWin); FirebaseSync.saveXPLevel(xp, level); }
          setTimeout(() => showArenaMode('sel'), 3000);
        }
      }
    });
  });

  // ── Patch enterBattleFromRoom untuk dispatch event setelah siap ──
  // Karena enterBattleFromRoom sudah di dalam IIFE sebelumnya, kita perlu
  // meng-intercept setelah _opponentUid dan brCode di-set
  const _checkBtReady = setInterval(() => {
    if (window._opponentUid && (brCode || (window._currentRoom && window._currentRoom.code))) {
      const code = brCode || (window._currentRoom && window._currentRoom.code);
      if (window._lastBtCode !== code) {
        window._lastBtCode = code;
        document.dispatchEvent(new CustomEvent('_btRoomReady', {
          detail: { code, opponentUid: window._opponentUid }
        }));
      }
    }
  }, 500);

})();

// ═══════════════════════════════════════════════════════════════
// STATISTIK BARU — Arena · Materi · Pomodoro
// ═══════════════════════════════════════════════════════════════

// ── Storage helpers ──
function _statGet(key) {
  try { return JSON.parse(localStorage.getItem('ef_stat_' + key) || 'null'); } catch(e) { return null; }
}
function _statSet(key, val) {
  try { localStorage.setItem('ef_stat_' + key, JSON.stringify(val)); } catch(e) {}
}

// ── Arena stat tracking ──
function arenaStatRecord(won) {
  const d = _statGet('arena') || { total: 0, wins: 0, lastTs: null, lastMapel: null };
  d.total++;
  if (won) d.wins++;
  d.lastTs = Date.now();
  d.lastMapel = window._btSubj || null;
  _statSet('arena', d);
  renderArenaStatWidget();
}

function renderArenaStatWidget() {
  const d = _statGet('arena') || { total: 0, wins: 0, lastTs: null };
  const total = d.total || 0;
  const wins  = d.wins  || 0;
  const wr    = total > 0 ? Math.round((wins / total) * 100) : 0;

  const elTotal = document.getElementById('arena-stat-total');
  const elWin   = document.getElementById('arena-stat-win');
  const elWr    = document.getElementById('arena-stat-wr');
  const elLast  = document.getElementById('arena-stat-last');

  if (elTotal) elTotal.textContent = total;
  if (elWin)   elWin.textContent   = wins;
  if (elWr)    elWr.textContent    = wr + '%';
  if (elLast) {
    if (d.lastTs) {
      const diff = Date.now() - d.lastTs;
      const mins = Math.floor(diff / 60000);
      const hrs  = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      const ago  = days > 0 ? days + ' hari lalu' : hrs > 0 ? hrs + ' jam lalu' : mins > 0 ? mins + ' mnt lalu' : 'Baru saja';
      elLast.textContent = 'Battle terakhir: ' + ago + (d.lastMapel ? ' · ' + d.lastMapel : '');
    } else {
      elLast.textContent = 'Belum pernah battle';
    }
  }
}

// ── Materi stat tracking ──
function materiStatRecord(mapel, bab) {
  const d = _statGet('materi') || { total: 0, lastMapel: null, lastBab: null, lastTs: null };
  d.total++;
  d.lastMapel = mapel || d.lastMapel;
  d.lastBab   = bab   || d.lastBab;
  d.lastTs    = Date.now();
  _statSet('materi', d);
  renderMateriStatWidget();
}

// Simpan context materi terakhir untuk tombol "Lanjut"
let _lastMateriContext = null;

function renderMateriStatWidget() {
  const d = _statGet('materi') || { total: 0, lastMapel: null, lastBab: null };
  const total = d.total || 0;

  const elTotal  = document.getElementById('materi-stat-total');
  const elMapel  = document.getElementById('materi-stat-mapel');
  const lanjutEl = document.getElementById('materi-lanjut-area');
  const emptyEl  = document.getElementById('materi-empty-area');
  const lanjutNm = document.getElementById('materi-lanjut-nama');

  if (elTotal) elTotal.textContent = total;

  if (total > 0 && d.lastMapel) {
    const mapelShort = { matematika:'Mat', fisika:'Fisika', kimia:'Kimia', biologi:'Bio', bahasa_inggris:'B.Ing', bahasa_indonesia:'B.Ind', sejarah:'Sej' };
    if (elMapel) elMapel.textContent = mapelShort[d.lastMapel] || d.lastMapel;
    if (lanjutEl) lanjutEl.style.display = '';
    if (emptyEl)  emptyEl.style.display  = 'none';
    if (lanjutNm) lanjutNm.textContent   = (d.lastBab || d.lastMapel) + (d.lastTs ? ' · ' + _timeAgo(d.lastTs) : '');
    _lastMateriContext = { mapel: d.lastMapel, bab: d.lastBab };
  } else {
    if (elMapel)  elMapel.textContent   = '—';
    if (lanjutEl) lanjutEl.style.display = 'none';
    if (emptyEl)  emptyEl.style.display  = '';
    _lastMateriContext = null;
  }
}

function lanjutkanMateri() {
  // Buka panel materi dan coba scroll ke bab terakhir
  goPanel('materi');
  if (_lastMateriContext && _lastMateriContext.mapel) {
    toast('📖 Lanjut belajar ' + (_lastMateriContext.bab || _lastMateriContext.mapel));
  }
}

function _timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return days + 'h lalu';
  if (hrs  > 0) return hrs  + 'j lalu';
  if (mins > 0) return mins + 'mnt lalu';
  return 'Baru saja';
}

// ── Pomodoro stat tracking ──
function pomoStatRecord(durationMinutes) {
  const today = new Date().toDateString();
  const d = _statGet('pomo') || { total: 0, todayDate: null, todayCount: 0, todayMnt: 0 };
  // Reset today count kalau hari beda
  if (d.todayDate !== today) { d.todayDate = today; d.todayCount = 0; d.todayMnt = 0; }
  d.total++;
  d.todayCount++;
  d.todayMnt += (durationMinutes || 25);
  _statSet('pomo', d);
  renderPomoStatWidget();
}

function renderPomoStatWidget() {
  const today = new Date().toDateString();
  const d = _statGet('pomo') || { total: 0, todayDate: null, todayCount: 0, todayMnt: 0 };
  const todayCount = d.todayDate === today ? (d.todayCount || 0) : 0;
  const todayMnt   = d.todayDate === today ? (d.todayMnt   || 0) : 0;
  const total      = d.total || 0;

  const elHari  = document.getElementById('pomo-stat-hari');
  const elTotal = document.getElementById('pomo-stat-total');
  const elMnt   = document.getElementById('pomo-stat-mnt');

  if (elHari)  elHari.textContent  = todayCount;
  if (elTotal) elTotal.textContent = total;
  if (elMnt)   elMnt.textContent   = todayMnt + ' menit fokus hari ini';
}

// ── Hook ke sistem yang sudah ada ──

// Hook finishBattle → arena stat
(function() {
  const _orig = window.finishBattle;
  window.finishBattle = function() {
    const won = btEHP <= 0 || (btPHP > 0 && btPHP > btEHP);
    arenaStatRecord(won);
    if (_orig) _orig.apply(this, arguments);
  };

  // Hook finishPrivateBattle (dari patch mabar)
  const _origFPB = window.finishPrivateBattle;
  if (_origFPB) {
    window.finishPrivateBattle = function(won, code) {
      arenaStatRecord(won);
      _origFPB.apply(this, arguments);
    };
  }
})();

// Hook openBab → materi stat
(function() {
  const _orig = window.openBab;
  window.openBab = function(subj, bab) {
    materiStatRecord(subj, bab);
    if (_orig) _orig.apply(this, arguments);
  };
  // Hook selectBab juga (bab yang belum ada halaman tapi tetap dicatat)
  const _origSB = window.selectBab;
  window.selectBab = function(subj, bab) {
    materiStatRecord(subj, bab);
    if (_orig) _orig.apply(this, arguments); // tetap buka modal coming soon
  };
})();

// Hook pomodoro selesai sesi → pomo stat
// pSessions++ sudah ada di baris ~661, kita hook dari logActivity type 'pomo'
(function() {
  const _origLog = window.logActivity;
  window.logActivity = function(mapel, mnt, type) {
    if (type === 'pomo') {
      pomoStatRecord(mnt);
    }
    if (type === 'materi') {
      materiStatRecord(mapel, null);
    }
    if (type === 'battle') {
      // battle sudah di-hook via finishBattle
    }
    if (_origLog) _origLog.apply(this, arguments);
  };
})();

// ── Render semua widget saat load ──
function renderAllStatWidgets() {
  renderArenaStatWidget();
  renderMateriStatWidget();
  renderPomoStatWidget();
}

// Render saat halaman siap — tunggu FirebaseSync ready agar data Firestore sudah masuk dulu
(function() {
  const MAX_WAIT = 6000;
  const INTERVAL = 200;
  let waited = 0;
  function _waitAndRender() {
    const fsReady = (typeof FirebaseSync === 'undefined') || FirebaseSync.isReady();
    if (fsReady || waited >= MAX_WAIT) {
      renderAllStatWidgets();
    } else {
      waited += INTERVAL;
      setTimeout(_waitAndRender, INTERVAL);
    }
  }
  setTimeout(_waitAndRender, 300);
})();

// Render juga setiap kali ke home panel
(function() {
  const _origGoPanel = window.goPanel;
  window.goPanel = function(panel) {
    if (_origGoPanel) _origGoPanel.apply(this, arguments);
    if (panel === 'home') setTimeout(renderAllStatWidgets, 150);
  };
})();


// ═══════════════════════════════════════════════════════════════
// STAT WIDGETS — Firestore sync layer
// Menggantikan _statGet/_statSet localStorage-only
// ═══════════════════════════════════════════════════════════════
(function() {

  // Override arenaStatRecord → juga push ke Firestore
  const _origArena = window.arenaStatRecord;
  window.arenaStatRecord = function(won) {
    // Update lokal dulu (cepat)
    if (_origArena) _origArena(won);
    // Lalu push ke Firestore
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.onBattleResult) {
      FirebaseSync.onBattleResult(won, won ? btXpWin : 0);
    }
  };

  // Override materiStatRecord → juga push ke Firestore
  const _origMateri = window.materiStatRecord;
  window.materiStatRecord = function(mapel, bab) {
    // Update lokal dulu
    if (_origMateri) _origMateri(mapel, bab);
    // Lalu push ke Firestore
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.onMateriOpen) {
      FirebaseSync.onMateriOpen(mapel, bab);
    }
  };

  // Override pomoStatRecord → juga push ke Firestore
  const _origPomo = window.pomoStatRecord;
  window.pomoStatRecord = function(durationMinutes) {
    // Update lokal dulu
    if (_origPomo) _origPomo(durationMinutes);
    // Lalu push ke Firestore
    if (typeof FirebaseSync !== 'undefined' && FirebaseSync.onPomodoroComplete) {
      FirebaseSync.onPomodoroComplete();
    }
  };

  // Saat login → data stats dimuat dari Firestore via onSnapshot → _applyStats dipanggil
  // → _applyStats sudah memanggil renderArenaStatWidget / renderMateriStatWidget / renderPomoStatWidget
  // Tidak perlu setTimeout buta di sini — membiarkan onSnapshot yang trigger render
  // sehingga data sudah pasti tersedia saat render dijalankan

})();
