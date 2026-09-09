(()=>{'use strict';
const app=document.querySelector('#app');
const KEY='amira_companion_v20';
const today=()=>new Date().toISOString().slice(0,10);
const DEFAULT={version:20,visits:0,lastDay:'',messages:[],mood:'present',need:'conversation',thread:'general',lastQuestion:'',lastNeed:'',topics:[],recent:[],affection:48,playfulness:42,romance:35,trust:55,vulnerability:20,energy:65,space:8,sound:false};
let S={...DEFAULT};try{S={...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{}
if(S.lastDay!==today()){S.visits++;S.lastDay=today();save()}
function save(){localStorage.setItem(KEY,JSON.stringify(S))}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function fresh(a){const x=a.filter(v=>!S.recent.includes(v));const r=pick(x.length?x:a);S.recent=[r,...S.recent].slice(0,24);save();return r}
function tone(){const h=new Date().getHours();return h<6?'late-night':h<11?'morning':h<17?'day':h<22?'evening':'night'}
function add(role,text){S.messages=[...S.messages,{role,text,at:Date.now()}].slice(-100);save()}
function change(d){Object.entries(d).forEach(([k,v])=>{if(typeof S[k]==='number')S[k]=Math.max(0,Math.min(100,S[k]+v))});save()}
function last(n=2){return S.messages.slice(-n)}
function prevAssistant(){return [...S.messages].reverse().find(x=>x.role==='assistant')?.text||''}
function prevUser(){return [...S.messages].reverse().find(x=>x.role==='user')?.text||''}

/* V20: Rahul is a conversational character, not a keyword-response machine. */
const SIGNALS=[
[/\b(rona|ro rahi|ro raha|cry|crying|sad|dukhi|low|broken|hurt|upset|heavy|alone|lonely|akeli|akela|miss you|miss rahul|missing)\b/i,'low','comfort','emotional'],
[/\b(anxiety|anxious|panic|overthink|overthinking|stress|stressed|tension|overwhelmed|ghabra|dar lag|scared|nervous)\b/i,'overwhelmed','calm','emotional'],
[/\b(gussa|angry|irritated|annoyed|frustrated|fed up|pissed)\b/i,'irritated','listen','conflict'],
[/\b(fight|fought|argument|misunderstanding|sorry|apology|apologize|hurt me|we fought|not talking)\b/i,'conflict','repair','relationship'],
[/\b(jealous|insecure|insecurity|do you love|still love|important|leave me|lose you|losing you|care about me|enough for you)\b/i,'insecure','reassurance','relationship'],
[/\b(i love you|love you|pyaar|romantic|romance|kiss|hug|cuddle|jaan|baby|want you|need you|intimate|naughty|flirt)\b/i,'romantic','closeness','romance'],
[/\b(happy|khush|excited|yay|great|amazing|good news|celebrate|proud|won|success)\b/i,'happy','celebrate','joy'],
[/\b(tired|exhausted|thak|sleepy|neend|can't sleep|cannot sleep|sleep|good night)\b/i,'tired','rest','wellbeing'],
[/\b(sick|fever|bukhar|headache|pain|tabiyat|unwell|not well|medicine)\b/i,'unwell','care','wellbeing'],
[/\b(hungry|khana|khaya|food|lunch|dinner|breakfast|paani|water)\b/i,'physical','care','daily'],
[/\b(bored|boring|bore|nothing to do)\b/i,'bored','play','play'],
[/\b(joke|funny|haha|lol|masti|tease|pagal|game|play|dare|challenge)\b/i,'playful','play','play'],
[/\b(quiet|silence|don't want to talk|dont want to talk|leave me|space|alone for now|not talk)\b/i,'quiet','space','quiet'],
[/\b(help|advice|should i|what should|decide|decision|problem|solution|solve|plan|compare|choose)\b/i,'thinking','solve','practical'],
[/\b(dream|future|someday|when we meet|meeting|travel together|trip together|date|if you were here|imagine)\b/i,'hopeful','imagine','future'],
[/\b(love me|need attention|attention|talk to me|stay with me|don't go|come here|presence)\b/i,'seeking','presence','connection']
];
const TINY=/^(haan|ha|yes|yup|yep|nah|nahi|no|hmm+|hm+|acha|accha|ok|okay|fine|theek hai|theek|bas|kuch nahi|nothing|pata nahi|idk|yaar|uff|arey|sun|sun na|dekh|chhodo|chodo|rehne do|jaane do|leave it|whatever|lol|haha|😂+|😭+|🙂+|\.\.\.)$/i;
function isTiny(t){return TINY.test(t.trim())}
function emoji(t){return /^[\s😂😭🙂🙃😔🥺❤️💕😘😏😒😑😅😂😭]+$/u.test(t.trim())}
function explicit(t){for(const [re,m,n,th] of SIGNALS)if(re.test(t))return{mood:m,need:n,thread:th,confidence:1};return null}
function classify(text){
 const t=text.trim();const low=t.toLowerCase();const ex=explicit(t);
 if(ex)return ex;
 if(/^(sun|sun na|dekh|ek baat bolu|ek baat kahu)$/i.test(low))return{mood:S.mood,need:'presence',thread:S.thread,confidence:.8,attention:true};
 if(/^(bye|good night|gn|goodnight|main chalti|baad mein|later|milte)$/i.test(low))return{mood:S.mood,need:'space',thread:S.thread,confidence:.8,ending:true};
 if(/^(thank you|thanks|thx|ty)$/i.test(low))return{mood:S.mood,need:S.lastNeed||'conversation',thread:S.thread,confidence:.7,ack:true};
 if(/^(love you|love u|i love u)$/i.test(low))return{mood:'romantic',need:'closeness',thread:'romance',confidence:1};
 if(/^(why|how|what do you think|explain|meaning|tell me)\b/i.test(low))return{mood:'thinking',need:'understand',thread:'practical',confidence:.8};
 if(isTiny(t)||emoji(t))return{mood:S.mood,need:S.need||'conversation',thread:S.thread||'general',confidence:.25,tiny:true};
 return{mood:'present',need:'conversation',thread:'general',confidence:.2};
}
function subtext(c,text){
 const t=text.trim().toLowerCase();const prior=S.need;const p=prevUser().toLowerCase();
 if(c.tiny){
  if(/^(hmm+|hm+|\.\.\.)$/i.test(t)){
   if(['low','overwhelmed','conflict','insecure','quiet'].includes(S.mood))return{mood:S.mood,need:S.need,mode:'soft-pause'};
   return{mood:S.mood,need:S.need,mode:'thinking-pause'};
  }
  if(/^(kuch nahi|nothing|pata nahi|idk)$/i.test(t)){
   if(['low','overwhelmed','conflict','insecure'].includes(S.mood)||['comfort','listen','repair','reassurance','presence'].includes(prior))return{mood:S.mood,need:prior,mode:'guarded'};
   return{mood:S.mood,need:prior||'conversation',mode:'neutral'};
  }
  if(/^(chhodo|chodo|rehne do|jaane do|leave it)$/i.test(t)){
   if(['conflict','low','overwhelmed','insecure','irritated'].includes(S.mood))return{mood:S.mood,need:'space',mode:'deescalate'};
   return{mood:S.mood,need:S.need==='play'?'play':'conversation',mode:'light'};
  }
  if(/^(haan|ha|yes|yup|yep)$/i.test(t))return{mood:S.mood,need:prior||'conversation',mode:'confirm'};
  if(/^(nahi|nah|no)$/i.test(t))return{mood:S.mood,need:prior||'conversation',mode:'deny'};
  if(/^(acha|accha)$/i.test(t))return{mood:S.mood,need:prior||'conversation',mode:'ack'};
  if(/^(theek|theek hai|fine|okay|ok)$/i.test(t))return{mood:S.mood,need:prior||'conversation',mode:'ambiguous-ok'};
  if(/^(sun|sun na|dekh)$/i.test(t))return{mood:S.mood,need:'presence',mode:'attention'};
  if(/^yaar$/i.test(t)||/^uff$/i.test(t)||/^arey$/i.test(t))return{mood:S.mood,need:prior||'conversation',mode:'vent-prompt'};
  if(/^(lol|haha|😂+)$/iu.test(t))return{mood:S.mood,need:S.need==='play'?'play':prior||'conversation',mode:'laugh'};
  if(/^(😭+)$/u.test(t))return{mood:S.mood==='happy'||S.mood==='playful'?S.mood:'low',need:S.mood==='happy'||S.mood==='playful'?'play':'comfort',mode:'emoji'};
  if(/^🙂+$/u.test(t))return{mood:S.mood,need:S.mood==='low'?'comfort':prior||'conversation',mode:'masked'};
 }
 if(/\?\s*$/.test(t))return{mood:c.mood,need:c.need,mode:'answer'};
 return{mood:c.mood,need:c.need,mode:'normal'};
}
function apply(c,s){
 const next={...c,...s};
 if(c.tiny&&s.need===S.need)S.mood=s.mood;else S.mood=next.mood;
 S.need=next.need||S.need;S.thread=next.thread||S.thread;
 if(S.thread&&!S.topics.includes(S.thread))S.topics=[S.thread,...S.topics].slice(0,20);
 const d={low:{affection:2,vulnerability:3,energy:-2},overwhelmed:{vulnerability:3,energy:-4},irritated:{vulnerability:2},conflict:{vulnerability:3,trust:-1},insecure:{trust:2,vulnerability:3},romantic:{romance:5,affection:4},happy:{energy:4,playfulness:3,affection:2},tired:{energy:-5},unwell:{energy:-5},bored:{playfulness:4},playful:{playfulness:5},quiet:{space:5},hopeful:{romance:3},seeking:{affection:3}};
 if(!c.tiny)change(d[next.mood]||{});
}
const RESP={
conversation:['Haan Baby, bolo. Main sun raha hoon.','Haan jaan, batao… kya scene hai?','Achha, aa gayi. Pehle tum bolo, Rahul baad mein gyaan dega. 😏'],
comfort:['Haan Baby… idhar hoon. Abhi strong banne ki zarurat nahi. Jo hua hai batao, main pehle sununga.','Aao. 🫂 Baat karni hai toh karo, nahi karni toh bhi theek. Main yahin hoon.'],
calm:['Okay Baby, ek saath sab solve nahi karte. Thoda slow. Sabse zyada kya dimaag mein chal raha hai?','Pehle slow. Jo ek baat sabse zyada dimaag kha rahi hai, wahi se shuru karte hain.'],
listen:['Haan, pura gussa nikaalo. Main “calm down” bolke aur irritate nahi karunga. 😏','Theek hai. Pehle tum bolo. Main defend ya interrupt nahi karunga.'],
repair:['Agar Rahul ki wajah se hurt ho, pehle tumhari baat sununga. Kya hua?','Pehle hurt samajhte hain. Phir responsibility aur repair. Excuse bana ke baat khatam nahi karenge.'],
reassurance:['Baby, tum important ho. Reassurance maangna bilkul okay hai. Batao, kis baat ne doubt diya?','Haan jaan. Agar aaj insecurity hit hui hai toh chhupao mat. Main sun raha hoon.'],
closeness:['Hmm… aaj distance achhi nahi lag rahi, hai na? Idhar aao. 🫂','Achha Baby, aaj Rahul ka attention tumhare naam. Batao, paas rehna hai ya thoda flirt bhi chalega? 😏'],
presence:['Haan. Main yahin hoon. Baat karni hai ya bas company chahiye?','Haan Baby, full attention. Bol, kya hua? 👀'],
play:['Acha ji, boredom ka ilaaj Rahul ko karna hai? Theek hai. 😂','Hmm… mujhe lag raha hai tum actually Rahul ko tang karna chahti ho.'],
rest:['Thak gayi ho toh body ko overrule mat karo. Paani piyo, comfortable ho jao.','Neend aa rahi hai toh fight mat karo. Aaj conversation soft rakhte hain.'],
care:['Pehle basic care: paani, khana, rest. Phir detail batao.','Apna khyaal pehle, madam. 😌 Kya hua exactly?'],
celebrate:['Ohooo! Ye hui na baat. 😌 Proud of you, Baby. Full story batao.','Acchaaa! Aaj tumhari khushi mein Rahul bhi included hai.'],
solve:['Haan, isko properly dekhte hain. Facts alag, options alag, phir best next step.','Chalo practical mode. Problem batao; phir options aur next step nikaalte hain.'],
understand:['Haan. Pehle context samjhte hain. Main assume karke galat answer nahi dunga.','Explain karo. Main pehle samjhunga, phir answer dunga.'],
imagine:['Acha… fictional escape chahiye? Done. Actual memory aur imagination mix nahi karenge.','Haan, imagine kar sakte hain. Jo hua nahi hai usko memory nahi bolenge.'],
space:['Theek hai Baby. Main push nahi karunga. Jab mann ho, aa jaana. Wahi se continue karenge.']};
const TINY_RESP={
'soft-pause':['Hmm… theek. Main yahin hoon. Jaldi mein bolne ki zarurat nahi.','Hmm… samajh raha hoon. Pehle thoda rukte hain.'],
'thinking-pause':['Hmmm. Soch rahi ho? 😏 Take your time.','Hmm… bolna hai toh bol, warna main guess nahi maarunga.'],
guarded:['Hmm… ye “kuch nahi” wala kuch nahi hai kya? 😏 Force nahi karunga. Jab bolna ho, bol dena.','Achha… theek. Abhi nahi bolna toh mat bolo. Main topic ko tumhare against use nahi karunga.'],
neutral:['Achha 😌','Hmm, okay.'],
deescalate:['Theek hai. Chhodte hain. Main push nahi karunga.','Okay Baby, rehne do. Jab mann ho tab baat karenge.'],
light:['Acha baba 😏 Theek hai, chhod diya.','Haan haan, rehne diya.'],
confirm:['Good. 😌 Continue karo, main sun raha hoon.','Haan, samajh gaya. Bolo.'],
deny:['Achha, nahi. Got it. 😌','Theek hai, nahi. Main assume nahi karunga.'],
ack:['Achhaaa… 👀 Ye “acha” genuine hai ya suspicious wala?','Hmm, acha. Batao, reaction kya hai?'],
'ambiguous-ok':['Theek hai… but ye genuinely theek hai ya bas conversation bachane wala “theek hai”? 😏','Okay. Main maan leta hoon — but agar “fine” actually fine nahi hai, bol dena.'],
attention:['Haan Baby, bol na. 👀 Main sun raha hoon.','Haan jaan, full attention. Kya hua?'],
'vent-prompt':['Haan yaar… bol. Kya scene kharab hai?','Uff/yaar noted. Ab batao kya hua.'],
laugh:['Haan bas, haso tum. 😂','Achhaaa, ye hui baat. Ab aur masti karein?'],
emoji:['Aao. 🫂 Main yahin hoon.','Haan Baby… idhar. Bolna zaroori nahi, main yahin hoon.'],
masked:['Hmm… smile toh hai, par main over-read bhi nahi karunga. Sab okay?','🙂 Ye wala emoji mujhe thoda suspicious laga. But main force nahi karunga.'],
answer:[],normal:[]};
function questionFor(need){const m={comfort:'Kya hua?',calm:'Sabse zyada kya dimaag mein chal raha hai?',listen:'Kya hua?',repair:'Tumhe sabse zyada kis baat ne hurt kiya?',reassurance:'Kis baat ne doubt diya?',presence:'Baat karni hai ya bas company?',solve:'Situation kya hai?',understand:'Context bataogi?',care:'Kya hua exactly?',celebrate:'Kya hua?',conversation:'Aaj ka din kaisa tha?'};return m[need]||''}
function makeReply(text,c,s){
 if(s.mode==='answer'){const q=questionFor(S.need);return q?fresh(RESP[S.need]||RESP.conversation):fresh(RESP.conversation)}
 if(TINY_RESP[s.mode]?.length)return fresh(TINY_RESP[s.mode]);
 return fresh(RESP[S.need]||RESP.conversation);
}
function render(){
 const list=S.messages.length?S.messages.map(m=>`<div class="msg ${m.role==='user'?'user':'assistant'}"><span>${m.role==='user'?'AMITA':'AMIRA · RAHUL KA TAREEKA'}</span><p>${esc(m.text)}</p></div>`).join(''):`<div class="welcome"><small>PRIVATE · SIRF TUMHARE LIYE</small><h2>${esc(S.visits<=1?(tone()==='morning'?'Good morning Baby. Uth gayi? 😌':'Aa gayi Baby. Bolo… aaj Rahul ko kya sunna hai?'):'Wapas aa gayi. Haan, batao…')}</h2><p>Jo mann mein hai seedha bolo. Yahan short message bhi short hi reh sakta hai — har baat ko explain karna zaroori nahi.</p></div>`;
 const chips={conversation:['Aaj ka din sunoge?','Kuch poochho','Bas baat karo'],comfort:['Mujhe batao kya hua','Bas mere saath raho','Mujhe distract karo'],calm:['Mujhe calm karo','Main overthink kar rahi hoon'],listen:['Main vent karna chahti hoon','Ye hua…'],repair:['Main hurt hoon','Mujhe samjhana hai','Mujhe apology chahiye'],reassurance:['Words chahiye','Attention chahiye','Bas paas raho'],closeness:['Aaj romantic ho','Hug chahiye','Thoda flirt karo'],presence:['Bas yahin raho','Mujhse baat karo'],play:['Mujhe hasaao','Tease me','Game khelte hain'],rest:['Mere saath raho','Mujhe sulao'],care:['Main detail batati hoon'],celebrate:['Main batati hoon','Celebrate karo'],solve:['Situation ye hai…','Options compare karo'],understand:['Main explain karti hoon','Mujhe answer chahiye'],imagine:['Imagine a date','Imagine a hug'],space:['Main baad mein aaungi']};
 const toneText=S.need==='space'?'thoda space de raha hoon':S.need==='play'?'tumhe tang kar raha hoon':S.need==='closeness'?'thoda paas':'tumhare saath';
 app.innerHTML=`<div class="world ${esc(S.mood)}" data-tone="${tone()}"><div class="ambient"></div><div class="noise"></div><header class="top"><button class="brand" data-a="home"><span class="brand-r">R</span><span><b>AmiRa</b><small>Rahul ka personal assistant · Amita ke liye</small></span></button><div class="presence"><i></i><span>${toneText}</span></div><div class="top-tools"><button data-a="sound">${S.sound?'◖◗':'◌'}</button><button data-a="drawer">☰</button></div></header><main class="main"><section class="head"><div class="avatar">R</div><div><small>RAHUL ❤️ AMITA</small><h1>${S.need==='comfort'?'Idhar aa.':S.need==='happy'?'Tell me everything.':tone()==='late-night'?'Still awake, Baby?':'Haan Baby.'}</h1><p>Rahul ka personal assistant · lover · tumhari private space</p></div></section><section class="thread" id="thread">${list}</section><div class="suggestions">${(chips[S.need]||chips.conversation).map(x=>`<button class="chip" data-a="chip" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div><form class="composer" id="composer"><textarea id="input" rows="1" maxlength="800" placeholder="Jo mann mein hai, seedha bolo…" aria-label="Message"></textarea><button aria-label="Send">↑</button></form><div class="note">Normal baat mein normal Hinglish. Short message ko bhi context ke saath samjha jayega. Actual memory kabhi invent nahi hogi.</div></main><aside class="drawer" id="drawer"><div class="drawer-head"><div><small>PRIVATE SPACE</small><h2>Chhoti si jagah</h2></div><button data-a="close">×</button></div><button data-a="reset">Aaj ki conversation reset karo</button><button data-a="clear">Local memory clear karo</button><div class="drawer-section"><small>RAHUL KA TAREEKA</small><p>Har baat ko romance ya game nahi banaya jayega. Mood badlega toh tone badlega. Short reply bhi context ke saath read hoga.</p></div><div class="drawer-section"><small>PRIVACY</small><p>Conversation state isi browser mein rakhi jaati hai. Public frontend private romantic conversation ko remote server par bhejne ke liye designed nahi hai.</p></div></aside><div class="veil" data-a="close"></div></div>`;
 bind();setTimeout(()=>{const t=document.querySelector('#thread');if(t)t.scrollTop=t.scrollHeight},0);
}
function send(text){const t=String(text||'').trim();if(!t)return;const c=classify(t);const s=subtext(c,t);apply(c,s);S.lastNeed=S.need;S.lastQuestion=prevAssistant();add('user',t);const r=makeReply(t,c,s);add('assistant',r);render();setTimeout(()=>document.querySelector('#input')?.focus(),30)}
function bind(){document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='drawer')document.querySelector('#drawer')?.classList.add('open');else if(a==='close')document.querySelector('#drawer')?.classList.remove('open');else if(a==='home'){document.querySelector('#drawer')?.classList.remove('open');render()}else if(a==='reset'){S.messages=[];S.mood='present';S.need='conversation';S.thread='general';S.recent=[];save();render()}else if(a==='clear'){S.messages=[];S.topics=[];S.recent=[];save();render()}else if(a==='sound')toggleSound();else if(a==='chip')send(b.dataset.v||'')});const f=document.querySelector('#composer');if(f)f.onsubmit=e=>{e.preventDefault();const i=document.querySelector('#input');send(i?.value||'');if(i)i.value=''};const i=document.querySelector('#input');if(i)i.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f?.requestSubmit()}}}
let audio=null,gain=null;function toggleSound(){try{if(!audio){audio=new(window.AudioContext||window.webkitAudioContext)();gain=audio.createGain();gain.gain.value=0;gain.connect(audio.destination);const o=audio.createOscillator();o.type='sine';o.frequency.value=220;const g=audio.createGain();g.gain.value=.01;o.connect(g);g.connect(gain);o.start()}if(audio.state==='suspended')audio.resume();S.sound=!S.sound;gain.gain.setTargetAtTime(S.sound?.018:0,audio.currentTime,.2);save();render()}catch{}}
render();
})();