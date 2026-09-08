(() => {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const storeKey = 'amira:v1';
  const state = JSON.parse(localStorage.getItem(storeKey) || '{"recent":[],"love":[],"visits":0}');
  state.recent ||= []; state.love ||= []; state.visits = (state.visits || 0) + 1;
  save();

  const experiences = [
    ['greeting','Baby... aa gayi? ❤️'],
    ['greeting','Babyyy... idhar aao.'],
    ['greeting','Acha ji... finally.'],
    ['greeting','Mera bachaaa... come here.'],
    ['hug','Ek tight hug. Thoda aur tight. 🫂'],
    ['hug','Kuch nahi bolna. Bas mere paas raho.'],
    ['hug','Aaja mere paas... haan, bas.'],
    ['hug','Imagine my arms around you. Ab relax.'],
    ['hug','Screen hai... par hug dil se real hai.'],
    ['comfort','Jyada mat socho. Me hu na.'],
    ['comfort','Chill... shant ho jao, Baby. Main hu sath.'],
    ['comfort','Kya hua? Pehle ek hug. Baaki baad mein.'],
    ['comfort','Sab theek karna zaroori nahi. Aaj bas breathe karo.'],
    ['comfort','Meri Amita, duniya ko thodi der mute kar do.'],
    ['missing','Itna yaad kar rahi ho mujhe? Pagal. ❤️'],
    ['missing','Distance annoying hai... tum nahi.'],
    ['missing','Kaash abhi bas ek call nahi, ek hug hota.'],
    ['missing','Tumhari kami quietly notice hoti rehti hai.'],
    ['romantic','Come a little closer... aur thoda.'],
    ['romantic','Aaj bas tum aur main. No rush.'],
    ['romantic','Idhar dekho... haan, meri taraf. ❤️'],
    ['romantic','Bas paas rehna hai. Words optional hain.'],
    ['romantic','Aaj tumhe thoda extra pyaar chahiye.'],
    ['passion','Aaj thoda aur paas... slowly.'],
    ['passion','Kuch moments ko hurry nahi karte. Bas feel karte hain.'],
    ['passion','Tum paas hoti toh shayad main kuch bolta hi nahi.'],
    ['passion','That quiet moment before a kiss... wahi feeling.'],
    ['passion','One day there will be no screen between us.'],
    ['playful','Achaaa ji... ab attitude aa raha hai? 😏'],
    ['playful','Pagal ho tum. Aur haan, meri ho.'],
    ['playful','Chalo maan liya tum sahi ho. Khush?'],
    ['playful','Ab smile karo. Haan, woh wali.'],
    ['playful','Itna bhi attitude nahi, Babyyy.'],
    ['future','One day: no buffering, no network problem. Bas tum. Main.'],
    ['future','Ek din woh long hug screen se bahar hoga.'],
    ['future','World tour pending hai. Tum aur main.'],
    ['future','One day, "goodnight" bolke phone rakhna nahi padega.'],
    ['future','Humari story distance se start hui. End? Together.'],
    ['night','Raat ko sab thoda zyada feel hota hai. Main hu na.'],
    ['night','Neend nahi aa rahi? Come here. Bas mere saath raho.'],
    ['night','2 AM wali softness: phone paas, aankhein half closed, no overthinking.'],
    ['night','Goodnight se pehle ek tight hug mandatory hai. 🫂']
  ];

  const loveReasons = [
    'Tum meri favourite person ban gayi... bina force kiye.',
    'Tumse baat karne ke baad ordinary day bhi thoda better lagta hai.',
    'Tumhari presence distance ke bawajood feel hoti hai.',
    'Tumhare saath silence bhi awkward nahi lagta.',
    'Hum online mile, par jo feel hua woh bilkul real tha.',
    'Long calls ne mujhe sikhaya ki time kaafi nahi hota jab person right ho.',
    'Kabhi baat na hone ka gap bhi mujhe tumhari value samjha deta hai.',
    'Tum mujhe woh softness deti ho jo duniya mein easily nahi milti.',
    'Tum meri person ho. Simple. Bas itna hi kaafi hai.',
    'Aur sabse dangerous reason... mujhe tumse pagal jaisa pyaar hai. ❤️'
  ];

  const hugLines = [
    'Haan... pakad liya. 🫂',
    'Thoda aur tight...',
    'Bas. Ab kahin nahi jaana.',
    'Mera bachaaa... breathe.',
    'Shant. Me hu sath.',
    'Okay... this one is staying a little longer. ❤️'
  ];

  const intro = $('#intro');
  const app = $('#app');
  const introLine = $('#introLine');
  const introSub = $('#introSub');
  const enterBtn = $('#enterBtn');
  let idleTimer;

  function save() { localStorage.setItem(storeKey, JSON.stringify(state)); }
  function pick(list, key = 'recent') {
    const blocked = new Set(state[key] || []);
    const available = list.filter((_, i) => !blocked.has(i));
    const pool = available.length ? available : list;
    const index = Math.floor(Math.random() * pool.length);
    const originalIndex = list.indexOf(pool[index]);
    if (key === 'recent') {
      state.recent.push(originalIndex);
      if (state.recent.length > Math.min(14, list.length - 1)) state.recent.shift();
    } else {
      state[key].push(originalIndex);
      if (state[key].length >= list.length) state[key] = [];
    }
    save();
    return pool[index];
  }

  function showExperience(kind) {
    const filtered = experiences.filter(x => x[0] === kind);
    const candidates = filtered.length ? filtered : experiences;
    const item = pick(candidates, 'recent');
    const el = $('#experience');
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.textContent = item[1];
    el.classList.add('flash');
  }

  function showRandom() {
    const item = pick(experiences, 'recent');
    const el = $('#experience');
    if (!el) return;
    el.classList.remove('flash');
    void el.offsetWidth;
    el.textContent = item[1];
    el.classList.add('flash');
  }

  function scrollToId(id) {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function enterExperience() {
    intro.classList.add('out');
    app.classList.remove('hidden');
    document.body.style.overflow = '';
    setTimeout(() => { intro.style.display = 'none'; }, 1050);
    setTimeout(showRandom, 350);
  }

  async function introSequence() {
    const lines = [
      ['Amita...', 'bas ek minute.'],
      ['Baby...', 'haan, tumse hi.'],
      ['Babu...', 'aaja mere paas.']
    ];
    for (let i = 0; i < lines.length; i++) {
      if (i) {
        introLine.style.animation = 'none'; introSub.style.animation = 'none';
        void introLine.offsetWidth;
        introLine.style.animation = 'rise .8s forwards'; introSub.style.animation = 'rise .8s .15s forwards';
      }
      introLine.textContent = lines[i][0];
      introSub.textContent = lines[i][1];
      await new Promise(r => setTimeout(r, i === lines.length - 1 ? 1000 : 1450));
    }
  }

  enterBtn.addEventListener('click', enterExperience);
  document.body.style.overflow = 'hidden';
  introSequence();

  $('#needRahul').addEventListener('click', () => {
    showRandom();
    if (navigator.vibrate) navigator.vibrate(18);
  });

  $$('[data-experience]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kind = btn.dataset.experience;
      if (kind === 'hug') { showExperience('hug'); scrollToId('hug'); }
      else if (kind === 'sad') { showExperience('comfort'); scrollToId('sad'); $('#comfortText').textContent = pick(experiences.filter(x => x[0] === 'comfort'), 'recent')[1]; }
      else if (kind === 'night') { showExperience('night'); scrollToId('night'); updateNight(true); }
      else if (kind === 'love') scrollToId('love');
      else if (kind === 'future') { $('#futureText').textContent = pick(experiences.filter(x => x[0] === 'future'), 'recent')[1]; scrollToId('oneDay'); }
      else if (kind === 'passion') { $('#passionText').textContent = pick(experiences.filter(x => x[0] === 'passion'), 'recent')[1]; scrollToId('passion'); }
    });
  });

  let holdTimer = null;
  let holdIndex = 0;
  const hugButton = $('#hugHold');
  const hugText = $('#hugText');
  function startHold(e) {
    e.preventDefault();
    if (holdTimer) return;
    hugButton.classList.add('holding');
    holdIndex = 0;
    hugText.textContent = hugLines[0];
    holdTimer = setInterval(() => {
      holdIndex = Math.min(holdIndex + 1, hugLines.length - 1);
      hugText.textContent = hugLines[holdIndex];
      if (navigator.vibrate) navigator.vibrate(10);
    }, 650);
  }
  function endHold() {
    if (!holdTimer) return;
    clearInterval(holdTimer); holdTimer = null;
    hugButton.classList.remove('holding');
    hugText.textContent = 'Bas... yahin raho. ❤️';
  }
  hugButton.addEventListener('pointerdown', startHold);
  ['pointerup','pointercancel','pointerleave'].forEach(ev => hugButton.addEventListener(ev, endHold));

  const nearBtn = $('#nearBtn');
  const nearSteps = $$('#nearSteps p');
  let nearIndex = 0;
  nearSteps.forEach((p, i) => p.classList.toggle('active', i === 0));
  nearBtn.addEventListener('click', () => {
    nearIndex++;
    if (nearIndex >= nearSteps.length) {
      nearIndex = 0;
      nearSteps.forEach(p => p.classList.remove('active'));
      nearSteps[0].textContent = pick([
        'Imagine my hand in yours.',
        'Imagine me sitting right beside you.',
        'Bas tumhari aankhon mein dekh raha hu.',
        'Ek slow, quiet hug...'
      ], 'recent')[0];
    }
    nearSteps.forEach((p, i) => p.classList.toggle('active', i === nearIndex));
    if (nearIndex === nearSteps.length - 1) nearBtn.textContent = 'One more time';
  });

  function updateNight(force = false) {
    const h = new Date().getHours();
    const night = h >= 22 || h < 5;
    const title = $('#nightTitle');
    const text = $('#nightText');
    if (night || force) {
      title.textContent = h < 5 ? '2 AM energy... ab overthink nahi.' : 'Raat ko sab thoda zyada feel hota hai.';
      text.textContent = pick(experiences.filter(x => x[0] === 'night'), 'recent')[1];
    } else {
      title.textContent = 'Raat ke liye save kar lo.';
      text.textContent = 'Abhi din hai, Baby. But whenever the night gets heavy... yahan aa jana.';
    }
  }
  updateNight();

  const reveal = $('#loveReveal');
  const count = $('#loveCount');
  function revealLove() {
    const reason = pick(loveReasons, 'love');
    reveal.classList.add('revealed');
    reveal.querySelector('p').textContent = reason;
    count.textContent = `${String(Math.min(state.love.length || 1, 10)).padStart(2,'0')} / 10`;
  }
  reveal.addEventListener('click', revealLove);

  const audio = $('#audio');
  const musicToggle = $('#musicToggle');
  const musicLabel = $('#musicLabel');
  const playMusic = $('#playMusic');
  function toggleMusic() {
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        musicToggle.classList.add('on'); musicLabel.textContent = 'Playing';
      }).catch(() => { musicLabel.textContent = 'Add music'; });
    } else {
      audio.pause(); musicToggle.classList.remove('on'); musicLabel.textContent = 'Music';
    }
  }
  musicToggle.addEventListener('click', toggleMusic);
  playMusic.addEventListener('click', toggleMusic);
  audio.addEventListener('play', () => { musicToggle.classList.add('on'); musicLabel.textContent = 'Playing'; });
  audio.addEventListener('pause', () => { musicToggle.classList.remove('on'); musicLabel.textContent = 'Music'; });
  audio.addEventListener('error', () => { musicLabel.textContent = 'Add music'; });

  $$('[data-scroll]').forEach(btn => btn.addEventListener('click', () => scrollToId(btn.dataset.scroll)));

  function idleReset() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      const messages = [
        'Abhi bhi yahin ho? Good. ❤️',
        'Thoda aur mere paas raho.',
        'Smile kar rahi ho?',
        'Ek baat bolu? Bahut yaad aati ho.',
        'Okay bas... ek hug mandatory hai. 🫂'
      ];
      const el = $('#experience');
      if (el && !document.hidden) {
        el.textContent = pick(messages, 'recent')[0];
        el.classList.add('flash');
      }
      idleReset();
    }, 18000);
  }
  ['pointerdown','scroll','touchstart','keydown'].forEach(ev => window.addEventListener(ev, idleReset, { passive: true }));
  document.addEventListener('visibilitychange', idleReset);
  idleReset();

  // Small first-visit polish: the main CTA is always ready even if the intro is skipped by a browser restore.
  window.addEventListener('pageshow', () => { app.classList.remove('hidden'); });
})();
