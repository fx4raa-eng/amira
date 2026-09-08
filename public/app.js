(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const storeKey = 'amira:v1';
  let state;
  try { state = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch { state = {}; }
  state.recent ||= []; state.love ||= []; state.visits = (state.visits || 0) + 1;
  const save = () => localStorage.setItem(storeKey, JSON.stringify(state));
  save();

  const experiences = [
    ['greeting','Baby... aa gayi? ❤️'],['greeting','Babyyy... idhar aao.'],['greeting','Acha ji... finally.'],['greeting','Mera bachaaa... come here.'],
    ['hug','Ek tight hug. Thoda aur tight. 🫂'],['hug','Kuch nahi bolna. Bas mere paas raho.'],['hug','Aaja mere paas... haan, bas.'],['hug','Imagine my arms around you. Ab relax.'],['hug','Screen hai... par hug dil se real hai.'],
    ['comfort','Jyada mat socho. Me hu na.'],['comfort','Chill... shant ho jao, Baby. Main hu sath.'],['comfort','Kya hua? Pehle ek hug. Baaki baad mein.'],['comfort','Sab theek karna zaroori nahi. Aaj bas breathe karo.'],['comfort','Meri Amita, duniya ko thodi der mute kar do.'],
    ['missing','Itna yaad kar rahi ho mujhe? Pagal. ❤️'],['missing','Distance annoying hai... tum nahi.'],['missing','Kaash abhi bas ek call nahi, ek hug hota.'],['missing','Tumhari kami quietly notice hoti rehti hai.'],
    ['romantic','Come a little closer... aur thoda.'],['romantic','Aaj bas tum aur main. No rush.'],['romantic','Idhar dekho... haan, meri taraf. ❤️'],['romantic','Bas paas rehna hai. Words optional hain.'],['romantic','Aaj tumhe thoda extra pyaar chahiye.'],
    ['passion','Aaj thoda aur paas... slowly.'],['passion','Kuch moments ko hurry nahi karte. Bas feel karte hain.'],['passion','Tum paas hoti toh shayad main kuch bolta hi nahi.'],['passion','That quiet moment before a kiss... wahi feeling.'],['passion','One day there will be no screen between us.'],
    ['playful','Achaaa ji... ab attitude aa raha hai? 😏'],['playful','Pagal ho tum. Aur haan, meri ho.'],['playful','Chalo maan liya tum sahi ho. Khush?'],['playful','Ab smile karo. Haan, woh wali.'],['playful','Itna bhi attitude nahi, Babyyy.'],
    ['future','One day: no buffering, no network problem. Bas tum. Main.'],['future','Ek din woh long hug screen se bahar hoga.'],['future','World tour pending hai. Tum aur main.'],['future','One day, "goodnight" bolke phone rakhna nahi padega.'],['future','Humari story distance se start hui. End? Together.'],
    ['night','Raat ko sab thoda zyada feel hota hai. Main hu na.'],['night','Neend nahi aa rahi? Come here. Bas mere saath raho.'],['night','2 AM wali softness: phone paas, aankhein half closed, no overthinking.'],['night','Goodnight se pehle ek tight hug mandatory hai. 🫂']
  ];
  const loveReasons = ['Tum meri favourite person ban gayi... bina force kiye.','Tumse baat karne ke baad ordinary day bhi thoda better lagta hai.','Tumhari presence distance ke bawajood feel hoti hai.','Tumhare saath silence bhi awkward nahi lagta.','Hum online mile, par jo feel hua woh bilkul real tha.','Long calls ne mujhe sikhaya ki time kaafi nahi hota jab person right ho.','Kabhi baat na hone ka gap bhi mujhe tumhari value samjha deta hai.','Tum mujhe woh softness deti ho jo duniya mein easily nahi milti.','Tum meri person ho. Simple. Bas itna hi kaafi hai.','Aur sabse dangerous reason... mujhe tumse pagal jaisa pyaar hai. ❤️'];
  const hugLines = ['Haan... pakad liya. 🫂','Thoda aur tight...','Bas. Ab kahin nahi jaana.','Mera bachaaa... breathe.','Shant. Me hu sath.','Okay... this one is staying a little longer. ❤️'];
  const intro = $('#intro'), app = $('#app'), introLine = $('#introLine'), introSub = $('#introSub'), enterBtn = $('#enterBtn');
  let idleTimer;

  function pick(list, key = 'recent') {
    if (!list.length) return null;
    const blocked = new Set(state[key] || []);
    const available = list.map((_, i) => i).filter(i => !blocked.has(i));
    const index = (available.length ? available : list.map((_, i) => i))[Math.floor(Math.random() * (available.length || list.length))];
    if (key === 'recent') { state.recent.push(index); if (state.recent.length > 14) state.recent.shift(); }
    else { state[key].push(index); if (state[key].length >= list.length) state[key] = []; }
    save();
    return list[index];
  }
  function showExperience(kind) {
    const item = pick(experiences.filter(x => x[0] === kind));
    if (!item) return;
    const el = $('#experience'); el.classList.remove('flash'); void el.offsetWidth; el.textContent = item[1]; el.classList.add('flash');
  }
  function showRandom() {
    const item = pick(experiences); if (!item) return;
    const el = $('#experience'); el.classList.remove('flash'); void el.offsetWidth; el.textContent = item[1]; el.classList.add('flash');
  }
  function scrollToId(id) { document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'center'}); }
  function enterExperience() { intro.classList.add('out'); app.classList.remove('hidden'); document.body.style.overflow=''; setTimeout(()=>{intro.style.display='none';},1050); setTimeout(showRandom,350); }
  async function introSequence() {
    const lines=[['Amita...','bas ek minute.'],['Baby...','haan, tumse hi.'],['Babu...','aaja mere paas.']];
    for(let i=0;i<lines.length;i++){ if(i){introLine.style.animation='none';introSub.style.animation='none';void introLine.offsetWidth;introLine.style.animation='rise .8s forwards';introSub.style.animation='rise .8s .15s forwards';} introLine.textContent=lines[i][0];introSub.textContent=lines[i][1];await new Promise(r=>setTimeout(r,i===2?1000:1450)); }
  }
  enterBtn.addEventListener('click',enterExperience); document.body.style.overflow='hidden'; introSequence();
  $('#needRahul').addEventListener('click',()=>{showRandom();if(navigator.vibrate)navigator.vibrate(18);});
  $$('[data-experience]').forEach(btn=>btn.addEventListener('click',()=>{
    const kind=btn.dataset.experience;
    if(kind==='hug'){showExperience('hug');scrollToId('hug');}
    else if(kind==='sad'){showExperience('comfort');scrollToId('sad');const x=pick(experiences.filter(e=>e[0]==='comfort'));if(x)$('#comfortText').textContent=x[1];}
    else if(kind==='night'){showExperience('night');scrollToId('night');updateNight(true);}
    else if(kind==='love')scrollToId('love');
    else if(kind==='future'){const x=pick(experiences.filter(e=>e[0]==='future'));if(x)$('#futureText').textContent=x[1];scrollToId('oneDay');}
    else if(kind==='passion'){const x=pick(experiences.filter(e=>e[0]==='passion'));if(x)$('#passionText').textContent=x[1];scrollToId('passion');}
  }));
  let holdTimer=null,holdIndex=0;const hugButton=$('#hugHold'),hugText=$('#hugText');
  function startHold(e){e.preventDefault();if(holdTimer)return;hugButton.classList.add('holding');holdIndex=0;hugText.textContent=hugLines[0];holdTimer=setInterval(()=>{holdIndex=Math.min(holdIndex+1,hugLines.length-1);hugText.textContent=hugLines[holdIndex];if(navigator.vibrate)navigator.vibrate(10);},650);}
  function endHold(){if(!holdTimer)return;clearInterval(holdTimer);holdTimer=null;hugButton.classList.remove('holding');hugText.textContent='Bas... yahin raho. ❤️';}
  hugButton.addEventListener('pointerdown',startHold);['pointerup','pointercancel','pointerleave'].forEach(e=>hugButton.addEventListener(e,endHold));
  const nearBtn=$('#nearBtn'),nearSteps=$$('#nearSteps p');let nearIndex=0;nearSteps.forEach((p,i)=>p.classList.toggle('active',i===0));
  nearBtn.addEventListener('click',()=>{nearIndex++;if(nearIndex>=nearSteps.length){nearIndex=0;nearSteps[0].textContent=pick(['Imagine my hand in yours.','Imagine me sitting right beside you.','Bas tumhari aankhon mein dekh raha hu.','Ek slow, quiet hug...'])||'Amita...';}nearSteps.forEach((p,i)=>p.classList.toggle('active',i===nearIndex));nearBtn.textContent=nearIndex===nearSteps.length-1?'One more time':'Come closer';});
  function updateNight(force=false){const h=new Date().getHours(),night=h>=22||h<5,title=$('#nightTitle'),text=$('#nightText');if(night||force){title.textContent=h<5?'2 AM energy... ab overthink nahi.':'Raat ko sab thoda zyada feel hota hai.';const x=pick(experiences.filter(e=>e[0]==='night'));if(x)text.textContent=x[1];}else{title.textContent='Raat ke liye save kar lo.';text.textContent='Abhi din hai, Baby. But whenever the night gets heavy... yahan aa jana.';}}
  updateNight();
  const reveal=$('#loveReveal'),count=$('#loveCount');
  reveal.addEventListener('click',()=>{const reason=pick(loveReasons,'love');if(!reason)return;reveal.classList.add('revealed');reveal.querySelector('p').textContent=reason;count.textContent=`${String(Math.min(state.love.length||1,10)).padStart(2,'0')} / 10`;});
  const audio=$('#audio'),musicToggle=$('#musicToggle'),musicLabel=$('#musicLabel'),playMusic=$('#playMusic');
  function toggleMusic(){if(audio.paused){audio.play().then(()=>{musicToggle.classList.add('on');musicLabel.textContent='Playing';}).catch(()=>{musicLabel.textContent='Add music';});}else{audio.pause();musicToggle.classList.remove('on');musicLabel.textContent='Music';}}
  musicToggle.addEventListener('click',toggleMusic);playMusic.addEventListener('click',toggleMusic);audio.addEventListener('play',()=>{musicToggle.classList.add('on');musicLabel.textContent='Playing';});audio.addEventListener('pause',()=>{musicToggle.classList.remove('on');musicLabel.textContent='Music';});audio.addEventListener('error',()=>musicLabel.textContent='Add music');
  $$('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>scrollToId(btn.dataset.scroll)));
  function idleReset(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{const messages=['Abhi bhi yahin ho? Good. ❤️','Thoda aur mere paas raho.','Smile kar rahi ho?','Ek baat bolu? Bahut yaad aati ho.','Okay bas... ek hug mandatory hai. 🫂'];const msg=pick(messages);const el=$('#experience');if(msg&&!document.hidden){el.textContent=msg;el.classList.add('flash');}idleReset();},18000);}
  ['pointerdown','scroll','touchstart','keydown'].forEach(ev=>window.addEventListener(ev,idleReset,{passive:true}));document.addEventListener('visibilitychange',idleReset);idleReset();
})();
