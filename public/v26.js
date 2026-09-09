(()=>{'use strict';
/*
 AmiRa V26 — Deep Understanding Core
 ------------------------------------------------------------------
 Core law:
 1) Understand what Amita actually said/asked.
 2) Preserve context and unresolved threads.
 3) Answer the real request before adding personality.
 4) Rahul tone changes delivery, never correctness.
 5) Never use romance/comfort as a substitute for a relevant answer.
 6) Do not repeatedly ask meta-questions or force a journey/closure.
 7) Short replies inherit context; they do not reset the conversation.
 8) Unknown facts are never fabricated. Ask only for the missing detail.

 This is intentionally deterministic because the GitHub Pages build is static.
 The core is a semantic/pragmatic layer over the existing V25 experience.
*/
const KEY='amira_companion_v26';
const V25='amira_companion_v25';
const clean=x=>String(x??'').trim().replace(/\s+/g,' ');
const low=x=>clean(x).toLowerCase();
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const now=()=>new Date();
let C={version:26,messages:[],turns:0,activeTopic:'',lastIntent:'',lastNeed:'',questionFatigue:0,threads:[],signals:{},used:[],...(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}})()};
try{const old=JSON.parse(localStorage.getItem(V25)||'{}');if(!C.messages.length&&Array.isArray(old.messages))C.messages=old.messages.slice(-120);C.signals={...(old.signals||{}),...(C.signals||{})}}catch{}
const save=()=>localStorage.setItem(KEY,JSON.stringify(C));
const thread=()=>document.querySelector('#thread');
function paint(){const el=thread();if(!el)return;el.innerHTML='';if(!C.messages.length){el.innerHTML='<div class="welcome"><small>PRIVATE · SIRF TUMHARE LIYE</small><h2>Aa gayi Baby.</h2><p>Jo mann mein hai, seedha bolo…</p></div>';return}for(const m of C.messages){const b=document.createElement('div');b.className='msg '+(m.role==='user'?'user':'assistant');b.innerHTML='<span>'+(m.role==='user'?'AMITA':'AMIRA · RAHUL KA TAREEKA')+'</span><p>'+esc(m.text)+'</p>';el.appendChild(b)}el.scrollTop=el.scrollHeight}
function add(role,text,meta={}){C.messages=[...C.messages,{role,text,at:Date.now(),...meta}].slice(-120);C.turns=C.messages.filter(m=>m.role==='user').length;save();paint()}
const users=()=>C.messages.filter(m=>m.role==='user');
const last=role=>[...C.messages].reverse().find(m=>m.role===role)?.text||'';
const prev=()=>users().slice(-2,-1)[0]?.text||'';
const recent=()=>C.messages.slice(-8);
const hours=()=>now().getHours();
const daypart=()=>{const h=hours();return h<5?'late night':h<11?'morning':h<17?'day':h<22?'evening':'night'};

/* -------------------- SEMANTIC SIGNALS -------------------- */
const R={
 greeting:/^(hi|hello|hey|hii|hiii|good morning|good afternoon|good evening|good night|sun|sun na|oye)\b/i,
 attention:/^(sun|sun na|listen|ek baat|dekho|dekh|rahul)\s*(baby|jaan|rahul)?[.!?]*$/i,
 yes:/^(haan|ha|yes|yep|yup|okay|ok|theek|theek hai|sure|ji)$/i,
 no:/^(nahi|nah|no|nope|not now|abhi nahi)$/i,
 pause:/^(hmm+|hm+|umm+|\.\.\.)$/i,
 masked:/^(kuch nahi|nothing|pata nahi|idk|don't know|dont know)$/i,
 drop:/^(chhodo|chodo|rehne do|jaane do|jaane de|leave it|whatever)$/i,
 laugh:/^(lol|haha|hahaha|hehe|😂+)$/i,
 cry:/^(😭+|ro rahi)$/i,
 question:/[?]$|^(kya|kyun|kyu|kaise|kab|kahan|kidhar|kitna|kitni|kitne|what|why|how|when|where|which|who|whose|can|could|should|would|will|is|are|do|does|did|has|have|tumne|tum kya|kya tum)\b/i,
 math:/^(what is|calculate|calc|solve|kitna hota hai)?\s*[\d\s+\-*/().%^x×÷=]+\??$/i,
 time:/\b(what time|time kya|kitne baje|abhi kitne baje|current time)\b/i,
 date:/\b(today|aaj|tomorrow|kal|yesterday|date kya|tarikh|which day|kaunsa din)\b/i,
 how:/^(how|how do|how can|kaise|kya karu|kya karoon|kaise karu|kaise karoon)\b/i,
 choice:/\b(which|better|best|compare|comparison|choose|should i|recommend|suggest|konsa|kaunsa|behtar|sahi kya)\b/i,
 definition:/^(what is|what's|meaning of|matlab|define|explain|who is|who was|kya hota hai|iska matlab)\b/i,
 emotional:/\b(sad|dukhi|low|upset|hurt|heavy|alone|lonely|akeli|akela|cry|rona|ro rahi|miss|missing|yaad|overthink|stress|stressed|tension|anxious|anxiety|panic|gussa|angry|jealous|insecure|disappointed|frustrated|overwhelmed|dar lag|scared|nervous)\b/i,
 romantic:/\b(love you|i love you|pyaar|romantic|kiss|hug|cuddle|flirt|naughty|intimate|close to you|paas aao|miss you|miss rahul|want you|need you)\b/i,
 care:/\b(feel sick|sick|fever|bukhar|headache|migraine|pain|dard|tabiyat|unwell|medicine|period pain|tired|thak|exhausted|sleepy|neend)\b/i,
 daily:/\b(khaya|khana|food|dinner|lunch|breakfast|office|work|college|class|meeting|sleep|sona|so rahi|ja rahi|aa rahi|coming|nikal|ghar|busy|free)\b/i,
 playful:/\b(joke|funny|masti|tease|pagal|game|play|dare|challenge|hasao|hansao|bore|bored|boring|timepass)\b/i,
 future:/\b(future|someday|when we meet|jab milenge|milne|trip together|travel together|imagine|kaash tum|if you were here|agar tum yahan)\b/i,
 space:/\b(don't talk|dont talk|leave me|space|quiet|alone time|abhi nahi|baad mein|baad me|later|mujhe akela)\b/i,
 request:/\b(help|please|tell me|batao|explain|show me|write|make|find|give me|send|check|fix|solve|teach)\b/i
};
function detect(t){const x=clean(t);const l=low(x);const d={text:x,lower:l,signals:[],question:R.question.test(x)};
 for(const [k,r] of Object.entries(R)){if(!['question'].includes(k)&&r.test(x))d.signals.push(k)}
 if(R.math.test(x))d.primary='math';
 else if(R.time.test(x))d.primary='time';
 else if(R.date.test(x))d.primary='date';
 else if(R.how.test(x)||R.request.test(x)&&/\b(kaise|how|fix|solve|do)\b/i.test(x))d.primary='how';
 else if(R.definition.test(x))d.primary='definition';
 else if(d.question||R.choice.test(x))d.primary='question';
 else if(R.space.test(x))d.primary='space';
 else if(R.emotional.test(x))d.primary='emotional';
 else if(R.romantic.test(x))d.primary='romantic';
 else if(R.care.test(x))d.primary='care';
 else if(R.playful.test(x))d.primary='playful';
 else if(R.daily.test(x))d.primary='daily';
 else if(R.greeting.test(x))d.primary='greeting';
 else d.primary='statement';
 d.tiny=R.yes.test(x)?'yes':R.no.test(x)?'no':R.pause.test(x)?'pause':R.masked.test(x)?'masked':R.drop.test(x)?'drop':R.laugh.test(x)?'laugh':R.cry.test(x)?'cry':R.attention.test(x)?'attention':'';
 return d}

/* -------------------- THREAD / PRAGMATICS -------------------- */
function topics(t){const l=low(t);const a=[];const map={relationship:/\b(rahul|amita|relationship|love|pyaar|boyfriend|girlfriend|us|hum|ham)\b/i,work:/\b(office|work|job|boss|meeting|project|client)\b/i,study:/\b(college|school|exam|study|padh|class|assignment)\b/i,health:/\b(fever|bukhar|headache|pain|dard|medicine|tabiyat|sleep|neend|tired)\b/i,food:/\b(khana|food|dinner|lunch|breakfast|kha|khaya)\b/i,travel:/\b(travel|trip|flight|hotel|train|mumbai|delhi|goa|bali|kashmir)\b/i,finance:/\b(money|paise|salary|price|cost|budget|loan|investment)\b/i,tech:/\b(phone|iphone|android|laptop|app|website|code|computer|password|screenshot)\b/i,family:/\b(mom|mummy|dad|papa|family|ghar|sister|brother)\b/i,emotion:/\b(sad|low|hurt|alone|lonely|stress|anxiety|gussa|angry|jealous|insecure|overthink)\b/i};for(const [k,r] of Object.entries(map))if(r.test(l))a.push(k);return a}
function inferState(d){const ts=topics(d.text);let need='conversation',mood='present';
 if(d.primary==='math'||d.primary==='time'||d.primary==='date'||d.primary==='definition'||d.primary==='how'||d.primary==='question')need='answer';
 if(d.primary==='emotional'){need=d.signals.includes('space')?'space':d.signals.includes('request')?'help':'presence';mood=d.signals.includes('emotional')?'emotional':'present'}
 if(d.primary==='care')need='care';
 if(d.primary==='romantic')need='closeness';
 if(d.primary==='playful')need='play';
 if(d.primary==='space')need='space';
 if(d.tiny)need=C.lastNeed||need;
 return{need,mood,topics:ts,primary:d.primary}}
function rememberThreads(d,state){const key=state.topics[0]||state.primary;const existing=C.threads.find(x=>x.key===key);const entry={key,topic:state.topics,primary:state.primary,text:d.text,at:Date.now(),open:true};if(existing)Object.assign(existing,entry);else C.threads.unshift(entry);C.threads=C.threads.slice(0,12);C.activeTopic=key||C.activeTopic;C.lastIntent=state.primary;C.lastNeed=state.need}
function contextFor(d){const prior=prev();const active=C.activeTopic;const refs=/\b(this|that|it|they|he|she|him|her|us|ye|woh|wo|isme|usme|isse|uski|iska|same|phir|again|still|ab|then)\b/i.test(d.text)||d.text.length<20;return{prior,active,referential:refs}}

/* -------------------- RELEVANCE-FIRST ANSWERS -------------------- */
function calc(t){let x=t.replace(/^(what is|calculate|calc|solve|kitna hota hai)\s*/i,'').replace(/[?=]/g,'').replace(/×/g,'*').replace(/x/gi,'*').replace(/÷/g,'/').replace(/[^0-9+\-*/().%\s]/g,'').trim();if(!x||!/^[0-9+\-*/().%\s]+$/.test(x))return null;try{const r=Function('"use strict";return ('+x+')')();return Number.isFinite(r)?String(r):null}catch{return null}}
function direct(d){const l=d.lower;
 if(d.primary==='math'){const r=calc(d.text);if(r)return `Answer: ${r}. 😌 Itna toh Rahul calculator ke bina bhi kar dega.`;return null}
 if(d.primary==='time')return `Abhi ${now().toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} ho raha hai — tumhare device ke local time ke hisaab se. Ab batao, kya scene hai madam? 😏`;
 if(d.primary==='date'){const n=now();if(/\b(tomorrow|kal)\b/i.test(l)){n.setDate(n.getDate()+1);return `Kal ${n.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} hai. 😌`};if(/\b(yesterday|kal tha|kal thi)\b/i.test(l)){n.setDate(n.getDate()-1);return `Kal ${n.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} tha. 😌`};return `Aaj ${n.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})} hai Baby. ❤️`}
 if(d.primary==='definition'){
  if(/taj mahal/i.test(l))return 'Taj Mahal Agra mein Shah Jahan ne Mumtaz Mahal ki yaad mein banwaya tha. History ka quick answer mil gaya madam 😌';
  if(/photosynthesis/i.test(l))return 'Photosynthesis mein plants sunlight ki energy se carbon dioxide aur water ko use karke food banate hain aur oxygen release karte hain.';
  if(/gravity/i.test(l))return 'Gravity mass wali cheezon ke beech attraction force hai. Earth isi force se humein surface par rakhti hai.';
  if(/artificial intelligence|\bai\b/i.test(l))return 'AI aise computer systems ko kehte hain jo language, patterns, prediction, decisions ya problem-solving jaise tasks perform kar sakte hain jo normally human intelligence se jude hote hain.';
  if(/love|pyaar/i.test(l))return 'Pyaar ka simple definition dena mushkil hai; generally it is a strong feeling of affection, care, attachment and emotional connection. Baaki tum aur Rahul iska practical example ho 😌❤️';
 }
 if(d.primary==='how'){
  if(/screenshot.*iphone|iphone.*screenshot/i.test(l))return 'Face ID iPhone mein Side button + Volume Up ek saath press karo. Screenshot save ho jayega. Bas, kaam done Baby 😌';
  if(/screenshot.*android|android.*screenshot/i.test(l))return 'Most Android phones mein Power + Volume Down ek saath press karo. Model ke hisaab se gesture bhi ho sakta hai.';
  if(/strong password|password.*strong/i.test(l))return 'Long, unique password rakho — ideally 14+ characters — aur important accounts par 2FA on rakho. Same password sab jagah mat lagana, madam 😑';
  if(/decision|decide|choose/i.test(l))return 'Pehle options likho, phir benefit, cost, risk aur reversibility compare karo. Easily reversible decision mein overthink kam; irreversible decision mein extra checking.';
 }
 return null}

/* -------------------- REPLY POLICY -------------------- */
const META=/\b(continue|thread|mode|solution|listen|samajhna|sunna|choose|select)\b/i;
const META_Q=/\b(what do you want|what do you need|sunna.*samajhna.*solution|kya chahiye|which mode)\b/i;
function questionFatigue(){const qs=recent().filter(m=>m.role==='assistant'&&/[?]/.test(m.text)).length;return qs>=2}
function tone(content,state){if(!content)return content;let x=content;
 // Tone is a delivery layer. Do not append romance to factual answers automatically.
 if(state.need==='answer'||state.primary==='question'||['math','time','date','definition','how'].includes(state.primary))return x;
 if(state.need==='space')return x;
 if(state.primary==='emotional'&&!/[❤️🫂😌]/.test(x))x+=' ❤️';
 return x}
function relevantFallback(d,state,ctx){
 if(d.primary==='question'||d.primary==='how'||d.primary==='definition'){
   if(ctx.referential&&ctx.prior)return `Haan, isi baat ke context mein bol raha hoon Baby — “${ctx.prior.slice(0,90)}${ctx.prior.length>90?'…':''}” wali baat ka exact answer dene ke liye bas woh specific detail bata do jo missing hai. Main guess karke random answer nahi dunga.`;
   return 'Haan Baby, iska proper relevant answer dunga. Bas question ka exact context/subject clear kar do — main seedha point pe aaunga, unnecessary bakbak nahi. 😌';
 }
 if(d.primary==='space')return 'Theek hai Baby. Main push nahi karunga. Thoda space le lo. Jab mann ho, yahin aa jaana. ❤️';
 if(d.primary==='care')return 'Okay Baby, pehle apna khayal. Paani, rest aur jo genuinely zaroori ho woh karo. Agar symptom serious ya worsening hai toh proper medical help lena better hai.';
 if(d.primary==='emotional'){
   if(/miss|yaad/i.test(d.text))return 'Haan Baby… samajh raha hoon. Aaj Rahul ki yaad thodi zyada aa rahi hai na. Idhar hoon, bolti jao. ❤️';
   if(/gussa|angry|hurt|frustrated/i.test(d.text))return 'Haan. Pehle pura bol do. Main beech mein defend nahi karunga. Jo hua, exactly wahi batao.';
   if(/overthink|stress|anxious|tension|panic/i.test(d.text))return 'Okay jaan, slow. Sab kuch ek saath solve nahi karna. Jo sabse zyada dimaag kha raha hai, usi se start karte hain.';
   return 'Haan Baby, samajh raha hoon. Jo feel ho raha hai usko lightly nahi lenge. Bol, kya hua?';
 }
 if(d.primary==='romantic')return 'Hmm… aaj mood thoda Rahul-wala lag raha hai 😏❤️ Main yahin hoon. Bolo, kya chal raha hai?';
 if(d.primary==='playful')return 'Acha ji 😂 boredom/masti department mein Rahul present. Chalo, dekhte hain kya shaitani chal rahi hai.';
 if(d.primary==='care')return 'Haan Baby, pehle apna khayal. Baaki baad mein.';
 if(d.primary==='greeting')return /good night/i.test(d.text)?'Good night Baby. Ab genuinely rest karo. Phone ke saath late-night meeting band 😌❤️':'Haan Baby, bol. Main sun raha hoon.';
 if(d.tiny==='yes')return 'Haan, got it. Main context follow kar raha hoon.';
 if(d.tiny==='no')return 'Theek hai. Main assume nahi karunga.';
 if(d.tiny==='pause')return 'Hmm… theek. Jaldi nahi hai. Main yahin hoon.';
 if(d.tiny==='masked')return '“Kuch nahi” theek. Abhi bolne ka mann nahi hai toh force nahi karunga. ❤️';
 if(d.tiny==='drop')return 'Theek hai. Chhodte hain. Main push nahi karunga.';
 if(d.tiny==='attention')return 'Haan Baby, bol. 👀';
 if(d.tiny==='laugh')return 'Haan bas 😂 ab samjha mood.';
 if(d.tiny==='cry')return 'Aao Baby 🫂';
 if(d.primary==='daily'){
   if(/\b(khaya|khana|dinner|lunch|breakfast)\b/i.test(d.text))return 'Achha, khane ka kya scene hai? Pehle woh sorted karo Baby 😌';
   if(/\b(office|work|college|meeting)\b/i.test(d.text))return 'Hmm, work wala scene. Batao kya hua — main relevant point pe rahunga.';
   if(/\b(sleep|sona|neend|so rahi)\b/i.test(d.text))return 'Okay Baby, rest karo. Phone ko bhi thoda chhutti do 😌';
 }
 return 'Haan Baby, samajh gaya. Main isi baat ke context mein hoon — jo actual point hai, usi pe chalte hain.'
}
function build(d){const state=inferState(d);const ctx=contextFor(d);rememberThreads(d,state);
 C.questionFatigue=questionFatigue()?Math.min(5,C.questionFatigue+1):Math.max(0,C.questionFatigue-1);
 let answer=direct(d);
 // Never let old generic meta replies win over a relevant answer.
 if(answer&&META_Q.test(answer))answer=null;
 if(!answer)answer=relevantFallback(d,state,ctx);
 answer=tone(answer,state);
 // Repetition guard: if same answer appeared recently, use a concise natural variant.
 const prevA=[...C.messages].reverse().find(m=>m.role==='assistant')?.text||'';
 if(answer===prevA){const variants={
  'Haan Baby, bol. Main sun raha hoon.':['Haan jaan, bolo.','Haan Baby, poora bol.'],
  'Theek hai. Main push nahi karunga.':['Okay Baby. No pressure.','Theek hai jaan, jab mann ho tab.'],
  'Haan Baby, samajh gaya. Main isi baat ke context mein hoon — jo actual point hai, usi pe chalte hain.':['Haan, context pakda hua hai. Seedha isi baat pe rehte hain.','Got it Baby. Thread clear hai, aage isi se continue karte hain.']};answer=pick(variants[answer]||[answer+' 😌'])}
 return answer}
function handle(raw){const t=clean(raw);if(!t)return;const d=detect(t);add('user',t,{intent:d.primary,topics:topics(t)});const answer=build(d);setTimeout(()=>add('assistant',answer,{intent:d.primary,topic:C.activeTopic}),90)}

/* -------------------- EVENT BRIDGE -------------------- */
document.addEventListener('submit',e=>{if(e.target?.id!=='composer')return;e.preventDefault();e.stopImmediatePropagation();const input=e.target.querySelector('#input');handle(input?.value||'');if(input)input.value=''},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();handle(b.dataset.c||'')},true);
window.addEventListener('pageshow',paint);
setTimeout(()=>{paint();save()},0);
})();