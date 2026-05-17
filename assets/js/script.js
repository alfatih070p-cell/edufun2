// Render streak days
const days = ['S','M','S','R','K','J','S'];
document.getElementById('streak-days').innerHTML = days.map((d,i) =>
  `<div style="flex:1;text-align:center">
    <div style="font-size:.52rem;color:var(--muted);font-weight:700;margin-bottom:.15rem">${d}</div>
    <div style="width:15px;height:15px;border-radius:4px;background:${i<5?'var(--ac)':'var(--border)'};margin:0 auto;opacity:${i<5?1:.35}"></div>
  </div>`
).join('');

// Scroll reveal
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('on'); });
}, {threshold: 0.12});
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ===========================
// EduFun — app.js
// ===========================

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
  document.querySelectorAll('.csw').forEach(s => s.classList.toggle('sel', s.dataset.ac === hex));
  document.getElementById('color-pick').value = hex;
  document.getElementById('color-hex').textContent = hex;
  // Re-render calendar rings with new accent color
  if (typeof AgendaSystem !== 'undefined' && AgendaSystem.refresh) AgendaSystem.refresh();
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
  renderAv('mini-av-svg');
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

const panelTitles = { home: 'Beranda', belajar: 'Metode Belajar', pomo: 'Pomodoro Timer', flash: 'Flashcards', arena: 'Battle Arena', materi: 'Materi Belajar' };
const panelSubs   = { home: 'Dashboard utama', belajar: 'Visual · Audio · Praktek', pomo: 'Teknik fokus 25 menit', flash: 'Buat & latih kartu belajarmu', arena: '1vs1 Bot atau Room Online', materi: 'Eksplorasi bab per kelas' };

function goPanel(name) {
  SFX.click();
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
  const modeMap = {'sel':'arena-mode-sel','bot':'arena-bot-sel','room':'arena-room-sel','game':'arena-game','buat-room':'arena-buat-room','join-room':'arena-join-room','private-lobby':'arena-private-lobby'};
  Object.entries(modeMap).forEach(([m, id]) => { const el = document.getElementById(id); if (el) el.style.display = m === mode ? 'block' : 'none'; });
  if (mode === 'join-room') { setTimeout(() => { const i = document.getElementById('join-room-input'); if(i) i.focus(); }, 100); }
}

function startBotBattle(diff, subj, botAcc) {
  btMode = 'bot'; btXpWin = diff === 'Mudah' ? 15 : (diff === 'Sedang' ? 30 : 60);
  document.getElementById('bt-e-name').textContent = '🤖 Bot ' + diff;
  window._btBotAcc = botAcc;
  startBattle(subj);
}

function joinRoom(subj) {
  btMode = 'room'; btXpWin = 40;
  const names = ['Dini','Budi','Mega','Arif','Sari','Dewi'];
  document.getElementById('bt-e-name').textContent = '👤 ' + names[Math.floor(Math.random() * names.length)];
  toast('⚔️ Mencari lawan di room ' + subj + '...');
  setTimeout(() => { toast('🎮 Lawan ditemukan! Battle dimulai!'); startBattle(subj); }, 1000);
}

function startBattle(subj) {
  btPHP = 100; btEHP = 100; btQ = 0; btAnswered = false;
  document.getElementById('bt-p-name').textContent = userName.split(' ')[0];
  document.getElementById('bt-p-hp').textContent = '100 HP';
  document.getElementById('bt-e-hp').textContent = '100 HP';
  document.getElementById('bt-p-bar').style.width = '100%';
  document.getElementById('bt-e-bar').style.width = '100%';
  document.getElementById('bt-log').textContent = '⚡ Battle dimulai! Pilih jawaban sebelum waktu habis!';
  showArenaMode('game');
  SFX.battleStart();
  setTimeout(() => SFX.startBattleBg(), 600);
  const qs = btQs[subj] || btQs['Matematika'];
  window._btQs = qs; window._btSubj = subj;
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
      if (correct) { btPHP = Math.max(0, btPHP - 20); updateHP(); }
      document.getElementById('bt-log').textContent = correct ? '🤖 Bot menjawab benar! -20 HP kamu!' : '🤖 Bot salah! Kamu selamat!';
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
  } else {
    SFX.wrong();
    btns[idx].style.borderColor = '#ef4444'; btns[idx].style.background = '#fef2f2'; btns[idx].style.color = '#991b1b';
    btPHP = Math.max(0, btPHP - 20);
    document.getElementById('bt-log').textContent = '❌ Salah! -20 HP kamu. Jawaban benar: ' + q.o[q.a];
  }
  updateHP();
  if (btPHP <= 0 || btEHP <= 0) { setTimeout(finishBattle, 1200); return; }
  btQ++; setTimeout(renderBQ, 1600);
}

function btTimeout() {
  SFX.timeOut(); btPHP = Math.max(0, btPHP - 15);
  document.getElementById('bt-timer').classList.remove('urgent');
  document.getElementById('bt-log').textContent = '⏰ Waktu habis! -15 HP';
  updateHP();
  if (btPHP <= 0) { setTimeout(finishBattle, 800); return; }
  btQ++; setTimeout(renderBQ, 1200);
}

function updateHP() {
  document.getElementById('bt-p-bar').style.width = btPHP + '%';
  document.getElementById('bt-e-bar').style.width = btEHP + '%';
  document.getElementById('bt-p-hp').textContent = btPHP + ' HP';
  document.getElementById('bt-e-hp').textContent = btEHP + ' HP';
  if (btPHP < 30) document.getElementById('bt-p-bar').style.background = 'linear-gradient(90deg,#ef4444,#fca5a5)';
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

// Musik/Instrumen - Real YouTube Embed Player
let musPlaying = -1;
const musIcons = ['🎹','🎻','🌿','🎷','🎸','🎺'];

function filterMusik(genre, btn) {
  document.querySelectorAll('#musik-genre-tabs .chip').forEach(b => b.classList.remove('sel'));
  btn.classList.add('sel');
  document.querySelectorAll('.musik-item').forEach(el => {
    el.style.display = (genre === 'semua' || el.dataset.genre === genre) ? '' : 'none';
  });
}

function playMusik(el, title) {
  const items = Array.from(document.querySelectorAll('.musik-item'));
  const idx = items.indexOf(el);
  const ytId = el.dataset.ytid;
  if (!ytId) { toast('⚠️ Video tidak tersedia'); return; }
  document.querySelectorAll('[id^="mus-btn-"]').forEach(b => { b.textContent = '▶ Putar'; });
  if (musPlaying === idx) {
    musPlaying = -1;
    document.getElementById('mus-iframe').src = '';
    document.getElementById('musik-embed-wrap').style.display = 'none';
    return;
  }
  musPlaying = idx;
  el.querySelector('[id^="mus-btn-"]').textContent = '⏸ Pause';
  document.getElementById('mus-now-title').textContent = title;
  document.getElementById('mus-now-icon').textContent = musIcons[idx] || '🎵';
  document.getElementById('mus-iframe').src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
  document.getElementById('musik-embed-wrap').style.display = '';
  setTimeout(() => document.getElementById('musik-embed-wrap').scrollIntoView({behavior:'smooth',block:'nearest'}), 100);
}

function stopMusik() {
  if (musPlaying >= 0) {
    const items = Array.from(document.querySelectorAll('.musik-item'));
    if (items[musPlaying]) { const b = items[musPlaying].querySelector('[id^="mus-btn-"]'); if (b) b.textContent = '▶ Putar'; }
    musPlaying = -1;
  }
  document.getElementById('mus-iframe').src = '';
  document.getElementById('musik-embed-wrap').style.display = 'none';
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
