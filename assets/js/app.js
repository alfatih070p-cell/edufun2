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
      { q: 'Partikel penyusun inti atom adalah?', o: ['Proton dan elektron', 'Proton dan neutron', 'Neutron dan elektron', 'Hanya proton'], a: 1 },
      { q: 'Massa atom relatif (Ar) dari Hidrogen adalah?', o: ['1', '2', '4', '12'], a: 0 },
      { q: 'Gas yang paling banyak terdapat di atmosfer bumi adalah?', o: ['Oksigen', 'Karbondioksida', 'Nitrogen', 'Argon'], a: 2 },
      { q: 'Lambang unsur Kalium adalah?', o: ['K', 'Ca', 'Ka', 'Kr'], a: 0 },
      { q: 'Zat yang tidak dapat diuraikan lagi menjadi zat yang lebih sederhana disebut?', o: ['Senyawa', 'Campuran', 'Unsur', 'Molekul'], a: 2 },
      { q: 'Perubahan wujud dari gas langsung menjadi padat disebut?', o: ['Mencair', 'Menyublim', 'Mengristal', 'Menguap'], a: 2 },
      { q: 'Rumus kimia dari Garam Dapur adalah?', o: ['NaOH', 'NaCl', 'KCl', 'MgCl2'], a: 1 },
      { q: 'Elektron valensi dari atom Karbon adalah?', o: ['2', '4', '6', '8'], a: 1 },
      { q: 'Indikator alami yang sering digunakan untuk uji asam basa adalah?', o: ['Bayam', 'Kunyit', 'Wortel', 'Singkong'], a: 1 },
      { q: 'Suatu atom yang bermuatan positif disebut?', o: ['Anion', 'Kation', 'Isotop', 'Isobar'], a: 1 },
      { q: 'Satuan internasional untuk jumlah zat adalah?', o: ['Gram', 'Liter', 'Mol', 'Molekul'], a: 2 },
      { q: 'Asam yang terdapat dalam lambung manusia adalah?', o: ['H2SO4', 'CH3COOH', 'HCl', 'HNO3'], a: 2 },
      { q: 'Logam yang berwujud cair pada suhu ruang adalah?', o: ['Emas', 'Perak', 'Raksa', 'Tembaga'], a: 2 },
      { q: 'Reaksi kimia yang melepaskan kalor ke lingkungan disebut?', o: ['Endoterm', 'Eksoterm', 'Redoks', 'Presipitasi'], a: 1 },
      { q: 'Penemu inti atom melalui percobaan hamburan sinar alfa adalah?', o: ['Dalton', 'Thomson', 'Rutherford', 'Niels Bohr'], a: 2 },
      { q: 'Nama senyawa CO2 adalah?', o: ['Karbon monoksida', 'Karbon dioksida', 'Karbida', 'Karbonat'], a: 1 },
      { q: 'Unsur halogen yang berwujud gas berwarna kuning kehijauan adalah?', o: ['Fluorin', 'Klorin', 'Bromin', 'Iodin'], a: 1 },
      { q: 'Proses pemisahan campuran berdasarkan perbedaan titik didih disebut?', o: ['Filtrasi', 'Kristalisasi', 'Distilasi', 'Sublimasi'], a: 2 },
      { q: 'Asam cuka memiliki nama kimia?', o: ['Asam sulfat', 'Asam asetat', 'Asam nitrat', 'Asam format'], a: 1 },
      { q: 'Bilangan oksidasi Oksigen dalam senyawa air adalah?', o: ['+1', '+2', '-1', '-2'], a: 3 },
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

applyAc(localStorage.getItem('ef_ac') || '#3b82f6');

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
  xp += amt;
  if (xp >= 1000) { xp -= 1000; level++; SFX.levelUp(); toast('⚡ LEVEL UP! Kamu sekarang Level ' + level + '!'); }
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

function flipFC() { SFX.cardFlip(); fcFlipped = !fcFlipped; document.getElementById('fc-card').classList.toggle('fl', fcFlipped); if (fcFlipped) addXP(2); }
function nextFC() { fcIdx = (fcIdx + 1) % cards.length; renderFCCard(); }
function prevFC() { fcIdx = (fcIdx - 1 + cards.length) % cards.length; renderFCCard(); }
function shuffleFC() { for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; } fcIdx = 0; renderFCCard(); toast('🔀 Diacak!'); }

renderFCList();

// ===========================
// BATTLE ARENA
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
  document.getElementById('arena-mode-sel').style.display = mode === 'sel' ? 'block' : 'none';
  document.getElementById('arena-bot-sel').style.display  = mode === 'bot'  ? 'block' : 'none';
  document.getElementById('arena-room-sel').style.display = mode === 'room' ? 'block' : 'none';
  document.getElementById('arena-game').style.display     = mode === 'game' ? 'block' : 'none';
}

function startBotBattle(diff, subj, botAcc) {
  btMode = 'bot'; btXpWin = diff === 'Mudah' ? 15 : (diff === 'Sedang' ? 30 : 60);
  document.getElementById('bt-e-name').textContent = '🤖 Bot ' + diff;
  document.getElementById('bt-e-label').textContent = '🤖 Bot ' + diff;
  window._btBotAcc = botAcc;
  window._btDifficulty = diff;
  window._btIsBot = true;
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
    document.getElementById('bt-log').textContent = '❌ Salah! -20 HP kamu. Jawaban benar: ' + q.o[q.a];
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
  document.getElementById('bt-log').textContent = won ? '🏆 MENANG! +' + btXpWin + ' XP! 🎉' : '💀 Kalah! Coba lagi!';
  if (won) { SFX.win(); addXP(btXpWin); const el = document.getElementById('lb-my-xp'); el.textContent = parseInt(el.textContent) + btXpWin; }
  else SFX.lose();
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
}

// Podcast simulated playback
let podPlaying = -1, podPcts = [0, 0, 0], podIv = null;

function playPodcast(el, title) {
  const idx = parseInt(el.querySelector('[id^="pod-p-"]').id.split('-')[2]);
  if (podPlaying === idx) { clearInterval(podIv); podPlaying = -1; document.getElementById('pod-btn-' + idx).textContent = '▶'; return; }
  if (podPlaying >= 0) { document.getElementById('pod-btn-' + podPlaying).textContent = '▶'; clearInterval(podIv); }
  podPlaying = idx; document.getElementById('pod-btn-' + idx).textContent = '⏸';
  toast('🎵 Memutar: ' + title);
  podIv = setInterval(() => {
    podPcts[idx] = Math.min(100, podPcts[idx] + 0.3);
    document.getElementById('pod-p-' + idx).style.width = podPcts[idx] + '%';
    if (podPcts[idx] >= 100) { clearInterval(podIv); document.getElementById('pod-btn-' + idx).textContent = '✓'; podPlaying = -1; addXP(20); toast('✅ Podcast selesai! +20 XP'); }
  }, 300);
}

// Video modal
const vidUrls = {
  matematika: { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Persamaan Kuadrat — Matematika Kelas 11', desc: 'Penjelasan lengkap rumus kuadrat, diskriminan, dan cara menemukan akar persamaan.' },
  fisika:     { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Hukum Newton — Fisika Kelas 10', desc: 'Tiga hukum gerak Newton dan aplikasinya dalam kehidupan sehari-hari.' },
  kimia:      { url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Ikatan Kimia — Kimia Kelas 10', desc: 'Ikatan kovalen, ionik, dan logam serta perbedaannya.' }
};

function openVideoModal(key) {
  const v = vidUrls[key];
  document.getElementById('vid-title').textContent = v.title;
  document.getElementById('vid-desc').textContent = v.desc;
  document.getElementById('vid-iframe').src = v.url + '?autoplay=1';
  openModal('video-modal'); addXP(10);
}

function stopVideo() { document.getElementById('vid-iframe').src = ''; }

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
  toast('🔬 Memuat simulasi ' + title + '...'); addXP(15);
}

function closeLab() { document.getElementById('lab-active').style.display = 'none'; document.getElementById('lab-iframe').src = ''; }

// ===========================
// MATERI
// ===========================
const materiDB = {
  '10': {
    'Matematika':      ['Eksponen & Logaritma','Persamaan Linear','Sistem Pertidaksamaan','Statistika Dasar','Trigonometri Awal'],
    'Bahasa Indonesia':['Teks Laporan','Teks Anekdot','Hikayat','Negosiasi','Debat'],
    'Fisika':          ['Besaran & Satuan','Gerak Lurus','Hukum Newton','Usaha & Energi'],
    'Kimia':           ['Tabel Periodik','Ikatan Kimia','Stoikiometri','Termokimia'],
    'Biologi':         ['Sel Prokariotik & Eukariotik','Jaringan Hewan','Ekosistem Dasar'],
    'Bahasa Inggris':  ['Simple Tenses','Vocabulary Building','Reading Comprehension'],
  },
  '11': {
    'Matematika':      ['Fungsi Invers','Matriks','Vektor','Transformasi Geometri','Barisan & Deret'],
    'Fisika':          ['Fluida Statis','Fluida Dinamis','Suhu & Kalor','Gelombang','Optik Geometri'],
    'Kimia':           ['Laju Reaksi','Kesetimbangan Kimia','Asam-Basa','Elektrokimia'],
    'Biologi':         ['Sel & Organel','Jaringan Tumbuhan','Sistem Gerak','Metabolisme Sel'],
    'Bahasa Inggris':  ['Passive Voice','Conditional Sentences','Reported Speech','Essay Writing'],
    'Sejarah':         ['Masa Kolonialisme','Kebangkitan Nasional','Sumpah Pemuda','Proklamasi'],
  },
  '12': {
    'Matematika':      ['Limit Fungsi','Turunan & Integral','Peluang Lanjutan','Program Linear'],
    'Fisika':          ['Listrik Statis','Arus & Tegangan','Medan Magnet','Induksi EM','Fisika Modern'],
    'Kimia':           ['Senyawa Karbon','Polimer & Makromolekul','Kimia Analitik','Elektrolisis'],
    'Biologi':         ['Mutasi & Evolusi','Bioteknologi Modern','Regulasi Hormon','Ekosistem & Lingkungan'],
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
  document.getElementById('materi-content').innerHTML = Object.entries(data).map(([subj, babs]) => {
    const key = curKelas + '-' + subj, icon = mapelIcons[subj] || '📖';
    return `<div style="background:#fff;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div onclick="toggleAcc('${key}')" style="display:flex;align-items:center;gap:.7rem;padding:.9rem 1rem;cursor:pointer;transition:background .15s" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
        <div style="font-size:1.3rem">${icon}</div>
        <div style="flex:1"><div style="font-weight:800;font-size:.88rem">${subj}</div><div style="font-size:.72rem;color:#94a3b8">${babs.length} bab · Kelas ${curKelas}</div></div>
        <div style="display:flex;align-items:center;gap:.4rem"><div class="badge ba">${babs.length}</div><svg id="arr-${key}" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" style="transition:transform .2s;flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg></div>
      </div>
      <div class="acc-b" id="acc-${key}">
        <div style="padding:0 1rem .9rem">
          ${babs.map(bab => `<div onclick="selectBab('${subj}','${bab}')" style="display:flex;align-items:center;gap:.65rem;padding:.6rem .85rem;border-radius:10px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;transition:all .15s;margin-bottom:.38rem" onmouseover="this.style.borderColor='var(--ac)';this.style.background='var(--ac-l)'" onmouseout="this.style.borderColor='#e2e8f0';this.style.background='#fff'">
            <div style="width:26px;height:26px;border-radius:7px;background:var(--ac-l);border:1.5px solid var(--ac-m);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;color:var(--ac);flex-shrink:0">${bab.charAt(0)}</div>
            <div style="flex:1"><div style="font-weight:700;font-size:.84rem">${bab}</div></div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>`).join('')}
        </div>
      </div>
    </div>`;
  }).join('');
}

function selectBab(s, b) { toast('📖 Membuka: ' + s + ' — ' + b); addXP(5); }

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

// Patch addXP supaya juga sync ke Auth
const _origAddXPSession = window.addXP;
window.addXP = function(amt) {
  _origAddXPSession(amt);
  if (typeof Auth !== 'undefined') Auth.updateStats(xp, level, streak);
};

// Patch saveCharEdit supaya simpan ke Auth
const _origSaveCharEdit = window.saveCharEdit;
window.saveCharEdit = function() {
  _origSaveCharEdit();
  if (typeof Auth !== 'undefined') Auth.saveCharacter({ ...ch });
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

// Override goDash agar simpan karakter ke Auth sebelum masuk
const _origGoDash = goDash;
window.goDash = function() {
  // Simpan karakter ke session/DB
  if (typeof Auth !== 'undefined') Auth.saveCharacter({ ...ch });
  _origGoDash();
  // Render profile avatar setelah masuk
  setTimeout(() => { renderAv('profile-av-svg'); renderAv('profile-av-svg-mob'); }, 100);
  // Init Firebase sync setelah login
  if (typeof FirebaseSync !== 'undefined') FirebaseSync.init();
};

// ===========================
// SISTEM STREAK (v2)
// ===========================

const StreakSystem = (() => {
  const STREAK_KEY    = 'ef_streak_data';   // { days: ['2025-05-01',...], lastShown: '2025-05-01' }
  const LOGIN_XP_BASE = 10;                 // XP login dasar
  const STREAK_BONUS  = 5;                  // XP tambahan per hari streak

  // Ambil data streak dari localStorage
  function getData() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { days: [], lastShown: null }; }
    catch { return { days: [], lastShown: null }; }
  }

  function saveData(d) {
    localStorage.setItem(STREAK_KEY, JSON.stringify(d));
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

  // Fungsi utama — panggil saat login/init
  function checkAndShow() {
    const data    = getData();
    const todayStr = toDateStr(new Date());

    // Sudah tampil hari ini? Lewati modal, tapi tetap update counter
    const alreadyShownToday = data.lastShown === todayStr;

    // Tambahkan hari ini ke riwayat jika belum ada
    const isNewDay = !data.days.includes(todayStr);
    if (isNewDay) {
      data.days.push(todayStr);
      // Simpan max 60 hari terakhir
      if (data.days.length > 60) data.days = data.days.slice(-60);
    }

    const streakCount = calcStreak(data.days);
    const xpGained    = LOGIN_XP_BASE + (streakCount * STREAK_BONUS);

    // Update semua UI counter
    updateAllStreakUI(streakCount);

    if (!alreadyShownToday) {
      data.lastShown = todayStr;
      saveData(data);

      // Beri XP login bonus
      if (isNewDay && typeof addXP !== 'undefined') {
        setTimeout(() => addXP(xpGained), 1500);
      }

      // Tampilkan modal setelah sebentar
      setTimeout(() => showStreakModal(streakCount, xpGained, isNewDay), 900);
    } else {
      saveData(data);
    }
  }

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

  return { checkAndShow, calcStreak, getData, updateAllStreakUI };
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
      const colors = [...new Set(events.map(e => e.color))];
      const ringColor = colors[0];
      const colorMap = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };
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
    list.innerHTML = events.map(ev => `
      <div class="ag-event-item" onclick="AgendaSystem.editEvent('${selectedDate}','${ev.id}')">
        <div class="ag-bar ${ev.color}"></div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev.name}</div>
          <div style="font-size:.74rem;color:#64748b;margin-top:.1rem">⏰ ${ev.timeStart} – ${ev.timeEnd}${ev.note ? ' · ' + ev.note : ''}</div>
        </div>
        <div style="font-size:1rem">${ev.color==='green'?'🟢':ev.color==='yellow'?'🟡':'🔴'}</div>
      </div>`).join('');
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

  // Read state from AgendaSystem internals via a helper we added
  const info = AgendaSystem.getCalInfo ? AgendaSystem.getCalInfo() : null;
  if (!info) return;
  const { year, month, selectedDate, agendaDB, BULAN } = info;

  lbl.textContent = `${BULAN[month]} ${year}`;
  const today = AgendaSystem.getSelectedDate ? (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  })() : '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  let html = '';
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="ag-day other-month" style="font-size:.65rem;min-height:22px">${daysInPrev - i}</div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds === today;
    const isSel = ds === selectedDate;
    const events = (agendaDB && agendaDB[ds]) || [];
    const colors = [...new Set(events.map(e => e.color))].slice(0, 2);
    const ringColor2 = colors[0];
    const colorMap2 = { green: '#22c55e', yellow: '#eab308', red: '#ef4444' };
    let cls = 'ag-day';
    if (isToday) cls += ' today';
    else if (isSel) cls += ' selected';
    const ring2 = ringColor2 ? `box-shadow:0 0 0 2px ${colorMap2[ringColor2]};` : '';
    html += `<div class="${cls}" style="font-size:.68rem;min-height:22px;${ring2}" onclick="AgendaSystem.selectDate('${ds}');agHomeCalRender();goPanel('agenda')">${d}</div>`;
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
