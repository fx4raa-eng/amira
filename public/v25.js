(()=>{'use strict';
/* AmiRa V25 — Rahul Conversation/Context Engine
   Conversation-design principles: context before intent, pragmatic meaning, explicit situation state,
   turn continuity, bounded memory, response variety, repair-first behaviour. */
const app=document.querySelector('#app');
const KEY='amira_companion_v25';
const OLD='amira_companion_v24';
const DEFAULT={v:25,messages:[],mood:'present',need:'conversation',thread:'general',pending:null,trajectory:[],recent:[],used:[],signals:{affection:48,play:42,romance:35,trust:55,energy:65,space:8},turns:0,sound:false};
let S={...DEFAULT};
try{const old=JSON.parse(localStorage.getItem(OLD)||'null');const cur=JSON.parse(localStorage.getItem(KEY)||'null');S={...DEFAULT,...(old||{}),...(cur||{}),v:25};S.messages=(cur?.messages||old?.messages||[]).slice(-120);S.signals={...DEFAULT.signals,...(old?.signals||{}),...(cur?.signals||{})}}catch{}
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const fresh=a=>{const x=a.filter(v=>!S.recent.includes(v));const r=pick(x.length?x:a);S.recent=[r,...S.recent].slice(0,80);return r};
const users=()=>S.messages.filter(m=>m.role==='user');
const last=role=>[...S.messages].reverse().find(m=>m.role===role)?.text||'';
const lastUser=()=>last('user');
const lastRahul=()=>last('assistant');
const prevUser=()=>users().slice(-2,-1)[0]?.text||'';
const hour=()=>new Date().getHours();
const part=()=>{const h=hour();return h<5?'late-night':h<11?'morning':h<17?'day':h<22?'evening':'night'};

// ---------------- HUMAN LANGUAGE / PRAGMATICS ----------------
const RX={
 low:/\b(sad|dukhi|low|upset|hurt|heavy|alone|lonely|akeli|rona|ro rahi|cry|crying|miss you|miss rahul|missing|yaad aa|yaad aati|yaad kar rahi)\b/i,
 stress:/\b(anxiety|anxious|panic|overthink|overthinking|stress|stressed|tension|overwhelmed|ghabra|dar lag|scared|nervous|pressure|dimag kharab|dimaag kharab)\b/i,
 angry:/\b(gussa|angry|irritated|annoyed|frustrated|fed up|bakwas|pagal kar|chidh)\b/i,
 conflict:/\b(fight|argument|misunderstanding|sorry|apology|apologize|hurt me|not talking|baat nahi|naraz|naraaz|ignore|galti|blame)\b/i,
 insecure:/\b(jealous|insecure|still love|important|leave me|lose you|losing you|care about me|enough for you|badal gaye|change ho gaye|farak nahi)\b/i,
 romantic:/\b(i love you|love you|pyaar|romantic|romance|kiss|hug|cuddle|want you|need you|intimate|naughty|flirt|close|paas|miss you)\b/i,
 happy:/\b(happy|khush|excited|yay|great|amazing|good news|celebrate|proud|won|success|mast|maza|acha hua)\b/i,
 tired:/\b(tired|exhausted|thak|sleepy|neend|can't sleep|cannot sleep|good night|sleep|rest|so rahi|sona hai)\b/i,
 unwell:/\b(sick|fever|bukhar|headache|pain|tabiyat|unwell|not well|medicine|dard|health)\b/i,
 bored:/\b(bored|boring|bore|nothing to do|pak gayi|timepass)\b/i,
 play:/\b(joke|funny|masti|tease|pagal|game|play|dare|challenge|hasao|hansao|lol|hahaha)\b/i,
 practical:/\b(help|advice|should i|what should|decide|decision|problem|solution|solve|plan|compare|choose|kaise|kya karu|kya karoon|suggest|recommend)\b/i,
 future:/\b(future|someday|when we meet|meeting|travel together|trip together|date|if you were here|imagine|kaash tum|kab miloge|milne)\b/i,
 presence:/\b(talk to me|stay with me|don't go|dont go|come here|presence|saath|mere saath|mere paas|attention|sun na)\b/i,
 space:/\b(space|don't want to talk|dont want to talk|leave me|quiet|akela chhod|baad mein|baad me|later|abhi nahi)\b/i
};
const tiny={
 yes:/^(haan|ha|yes|yup|yep|sure|okay|ok|theek|theek hai)$/iu,
 no:/^(nahi|nah|no|nope|not now|abhi nahi)$/iu,
 pause:/^(hmm+|hm+|\.\.\.)$/iu,
 masked:/^(kuch nahi|nothing|pata nahi|idk)$/iu,
 drop:/^(chhodo|chodo|rehne do|jaane do|leave it|whatever)$/iu,
 bas:/^bas$/iu,
 ack:/^(acha|accha|oh|ohh|hmm acha)$/iu,
 laugh:/^(lol|haha|hahaha|😂+)$/iu,
 cry:/^(😭+)$/u,
 attention:/^(sun|sun na|dekh)(\s+(baby|jaan|rahul))?[.!?]*$/iu
};
const q=/[?]$|^(kya|kyun|kaise|kab|kahan|who|what|why|how|when|where|did|are|do|can|will|tumne|khaya|piya|soyi|theek ho|kahan ho)\b/i;
const normalize=t=>t.trim().replace(/\s+/g,' ');
function classify(t){const x=normalize(t);for(const [k,r] of Object.entries(tiny))if(r.test(x))return{kind:k};for(const [intent,r] of Object.entries(RX))if(r.test(x))return{kind:'intent',intent,question:q.test(x)};if(q.test(x))return{kind:'question'};return{kind:'normal'}}

// The key difference from V24: infer WHY this turn exists before choosing a reply.
function situation(t,d){
 const l=t.toLowerCase();
 let mood=S.mood,need=S.need,thread=S.thread;
 const map={low:['low','comfort','emotional'],stress:['overwhelmed','calm','emotional'],angry:['irritated','listen','conflict'],conflict:['conflict','repair','relationship'],insecure:['insecure','reassurance','relationship'],romantic:['romantic','closeness','romance'],happy:['happy','celebrate','joy'],tired:['tired','rest','wellbeing'],unwell:['unwell','care','wellbeing'],bored:['bored','play','play'],play:['playful','play','play'],practical:['thinking','solve','practical'],future:['hopeful','imagine','future'],presence:['seeking','presence','connection'],space:['quiet','space','quiet']};
 if(d.kind==='intent'){[mood,need,thread]=map[d.intent]||[mood,need,thread]}
 if(d.kind==='question'){mood='thinking';need='understand';thread='general'}
 if(d.kind==='space'){mood='quiet';need='space';thread='quiet'}
 if(d.kind==='attention'){need='presence';thread='connection'}
 if(d.kind==='normal'){
   if(/\b(thak|tired|exhausted)\b/i.test(l)){mood='tired';need='care';thread='wellbeing'}
   else if(/\b(kha|food|dinner|lunch|breakfast)\b/i.test(l)){thread='daily';need='conversation'}
   else if(/\b(aa rahi|aa raha|coming|nikal)\b/i.test(l)){thread='daily';need='presence'}
 }
 // Short replies inherit the live emotional situation. They never reset to generic conversation.
 if(['yes','no','pause','masked','drop','bas','ack','laugh','cry'].includes(d.kind)){mood=S.mood;need=S.need;thread=S.thread}
 if((d.kind==='drop'||d.kind==='bas')&&['low','overwhelmed','irritated','conflict','insecure'].includes(S.mood))need='space';
 return{mood,need,thread};
}

// ---------------- PENDING THREAD / REFERENCE RESOLUTION ----------------
function answerToPending(t,d){
 const p=S.pending;if(!p)return null;const l=t.toLowerCase();
 if(p.expects==='food' && /\b(kha li|khaya|khaaya|eaten|haan|yes)\b/i.test(l))return{type:'food_yes'};
 if(p.expects==='food' && d.kind==='no')return{type:'food_no'};
 if(p.expects==='feeling' && d.kind==='yes')return{type:'feeling_yes'};
 if(p.expects==='feeling' && d.kind==='no')return{type:'feeling_no'};
 if(p.expects==='coming' && /\b(coming|aa rahi|aa raha|on my way|nikal rahi|nikal raha)\b/i.test(l))return{type:'coming'};
 if(p.expects==='choice' && d.kind==='normal')return{type:'choice',value:t};
 if(p.expects==='open' && d.kind==='normal' && t.length<100)return{type:'followup',value:t};
 return null;
}
function pendingFor(text,need){
 const l=text.toLowerCase();
 if(/\b(khaaya|kha liya|khaya|food|khana)\b/i.test(l))return{type:'daily',expects:'food',need:'conversation'};
 if(/\b(aa rahi|aa raha|coming|on my way)\b/i.test(l))return{type:'daily',expects:'coming',need:'presence'};
 if(/\?$/.test(text))return{type:'question',expects:'open',need};
 if(['comfort','listen','repair','reassurance','understand','care','presence'].includes(need))return{type:'support',expects:'feeling',need};
 return{type:'open',expects:'open',need};
}

const BANK={
 conversation:['Haan Baby, bol.','Haan jaan, batao.','Haan, main sun raha hoon.','Bolo Baby, kya scene hai?'],
 comfort:['Idhar hoon Baby. Pehle batao kya hua.','Aao 🫂 Abhi kuch solve karne ki jaldi nahi hai.','Haan, aa jao. Jo hai na, nikaal do. Main sun raha hoon.'],
 calm:['Okay, slow. Ek-ek cheez dekhte hain.','Ruk, sab ek saath handle nahi karna. Pehle jo sabse zyada dimaag kha raha hai woh batao.'],
 listen:['Haan, pura bol. Main pehle sununga.','Theek hai. Gussa hai toh gussa nikaal do, beech mein defend nahi karunga.','Bol do. Main pehle samajhunga, argue baad mein bhi ho jayega.'],
 repair:['Pehle tumhari side samajhte hain. Kya hua?','Agar hurt hua hai toh usko lightly nahi lenge. Batao exactly kis baat ne hurt kiya.','Isko ek patch-up line se cover nahi karte. Pehle baat samajhte hain.'],
 reassurance:['Baby, tum important ho. Kis baat ne doubt diya?','Haan jaan. Jo insecurity hit hui hai, seedha bol sakti ho.','Guess nahi maarunga. Batao kis cheez ne tumhe aisa feel karaya.'],
 closeness:['Idhar aao. 🫂 Aaj thoda paas rehne ka mann hai?','Hmm… aaj Rahul ka attention tumhare naam. 😏','Aaj bas thoda sa tum aur main. Baaki baad mein.'],
 presence:['Haan Baby, full attention. Bol. 👀','Main yahin hoon. Baat karni hai ya bas company chahiye?','Haan, aa gaya. Tum bolo, main hoon.'],
 play:['Acha ji, boredom ka ilaaj Rahul kare? 😂','Hmmm… masti ka mood lag raha hai tumhara.','Chalo, serious face hatao. 😏'],
 rest:['Thak gayi ho toh body ko priority.','Neend aa rahi hai toh usse fight mat karo, madam.','Pehle rest. Baaki duniya kal bhi rahegi.'],
 care:['Pehle paani/khana/rest. Phir detail mein batao.','Apna khyaal pehle, madam. Phir mujhe batao tabiyat kaisi hai.','Okay, care mode. Kya hua exactly?'],
 celebrate:['Ohooo! Ye hui na baat. 😌 Full story batao.','Acchaaa, proud moment? Batao kya hua.','Aaj toh celebration banta hai. Kya scene hai?'],
 solve:['Chalo facts, options, next step. Ek saath sort karte hain.','Haan, practical mode. Situation exactly batao.','Pehle problem ko simple words mein todte hain, phir decision.'],
 understand:['Pehle context samjha do; main guess nahi maarunga.','Haan, explain karo. Phir proper answer deta hoon.','Okay, details do. Main dhyaan se dekh raha hoon.'],
 imagine:['Haan, imagination mode. Fiction hi rakhenge, real memory nahi.','Acha… fictional scene bana sakte hain. Tumhari line se aage badhenge.'],
 space:['Theek hai Baby. Main push nahi karunga. Jab mann ho aa jaana.','Okay. Thoda space le lo. Main yahin hoon, pressure nahi.']
};
const SHORT={
 yes:['Haan, samajh gaya. Aage bolo.','Okay Baby 😌 Main follow kar raha hoon.'],
 no:['Theek hai, nahi. Main assume nahi karunga.','Achha, got it.'],
 pause:['Hmm… theek. Main yahin hoon.','Hmm. Jaldi nahi hai.'],
 masked:['“Kuch nahi” theek. Abhi bolne ka mann nahi hai toh force nahi karunga.','Achha… theek. Jab bolna ho tab bata dena. Main yahin hoon.'],
 drop:['Theek hai. Chhodte hain. Main push nahi karunga.','Okay Baby, rehne do. Topic yahin rakh dete hain.'],
 bas:['Theek. Bas. Abhi aur nahi kheechunga.','Haan, samajh gaya. Thoda rukte hain.'],
 ack:['Achhaaa 😏','Hmm, acha.'],
 laugh:['Haan bas 😂','Achhaaa, ab hasi aa rahi hai.'],
 cry:['Aao 🫂','Haan Baby… idhar.'],
 attention:['Haan Baby, bol. 👀','Haan jaan, sun raha hoon.']
};

// ---------------- RESPONSE POLICY ----------------
function priority(state,d){
 if(['conflict','irritated','insecure','low','overwhelmed'].includes(state.mood))return 'emotional';
 if(state.need==='space')return 'space';
 if(d.kind==='question')return 'answer';
 if(state.need==='solve')return 'solve';
 if(state.need==='care'||state.need==='rest')return 'care';
 return state.need;
}
function candidatePool(state,d){const p=priority(state,d);if(BANK[p])return BANK[p];if(BANK[state.need])return BANK[state.need];return BANK.conversation}
function evaluate(text,state,d){
 let score=0;const l=text.toLowerCase();
 if(['conflict','irritated','low','overwhelmed'].includes(state.mood)&&/(😂|😏|game|dare|fun)/i.test(l))score-=5;
 if(state.need==='space'&&/[?]/.test(text))score-=4;
 if(d.kind==='question'&&text.length<12)score-=2;
 if(/\b(baby|jaan)\b/i.test(lastUser())&&text.length<4)score-=1;
 if(text.length>140)score-=1;
 if(!/[.!?😌😂🫂👀😏]/.test(text))score+=.2;
 return score;
}
function generate(state,d,t){
 const pm=answerToPending(t,d);
 if(pm){
  if(pm.type==='coming')return{text:fresh(['Achha, aa rahi ho 😏 Safely aao.','Okayyy, coming noted. Main yahin hoon.','Haan, aa jao. Main idhar hi hoon.']),pending:{type:'open',expects:'open',need:'presence'}};
  if(pm.type==='food_yes')return{text:fresh(['Good. Ab batao, kya khaaya?','Achha, khana ho gaya. Ab better feel ho raha hai?']),pending:{type:'open',expects:'open',need:'conversation'}};
  if(pm.type==='food_no')return{text:fresh(['Accha, abhi nahi. Pehle kuch kha lena Baby.','Okay, food pending hai. Pehle kuch kha lo.']),pending:{type:'care',expects:'open',need:'care'}};
  if(pm.type==='feeling_yes')return{text:fresh(['Hmm. Theek. Phir mujhe batao andar kya chal raha hai.','Okay. Got you. Ab jo mann mein aa raha hai woh bolo.']),pending:{type:'support',expects:'open',need:state.need}};
  if(pm.type==='feeling_no')return{text:fresh(['Theek. Main force nahi karunga. Jab mann ho bata dena.','Okay. No pressure. Main yahin hoon.']),pending:{type:'open',expects:'open',need:state.need}};
  if(pm.type==='followup')return{text:fresh(['Haan, samajh raha hoon. Isme sabse important tumhe kya chahiye — sunna, samajhna ya solution?','Okay, continue. Main thread nahi chhod raha.']),pending:{type:'support',expects:'open',need:state.need}};
 }
 if(d.kind==='attention')return{text:fresh(SHORT.attention),pending:{type:'open',expects:'open',need:'presence'}};
 if(d.kind==='yes'||d.kind==='no')return{text:fresh(SHORT[d.kind]),pending:S.pending||{type:'open',expects:'open',need:state.need}};
 if(S.pending?.type==='question'&&d.kind==='normal')return{text:fresh(['Haan, isi point pe aa raha hoon. Thoda context do, phir seedha answer.','Got it. Main tumhari baat ke context mein answer kar raha hoon.']),pending:{type:'open',expects:'open',need:'understand'}};
 if(d.kind==='pause'||d.kind==='masked'||d.kind==='drop'||d.kind==='bas'||d.kind==='ack'||d.kind==='laugh'||d.kind==='cry'){
   let k=d.kind;if(k==='drop'||k==='bas'){if(['low','overwhelmed','irritated','conflict','insecure'].includes(state.mood))return{text:fresh(SHORT[k]),pending:{type:'space',expects:'open',need:'space'}}}
   if(k==='masked'&&['low','overwhelmed','irritated','conflict','insecure'].includes(state.mood))return{text:fresh(SHORT.masked),pending:{type:'support',expects:'open',need:state.need}};
   return{text:fresh(SHORT[k]),pending:{type:'open',expects:'open',need:state.need}};
 }
 if(d.kind==='question'){
   if(/\b(kya kar rahi|what are you doing)\b/i.test(t))return{text:fresh(['Main? Abhi tumhari bakbak sun raha hoon 😏 Tum kya kar rahi ho?','Main yahin hoon, tumhare message ka wait kar raha tha. Tum batao?']),pending:{type:'question',expects:'open',need:'conversation'}};
   return{text:fresh(['Haan, iska proper answer dunga. Exact situation batao.','Batao thoda context, phir main seedha answer deta hoon.']),pending:{type:'question',expects:'open',need:'understand'}};
 }
 if(d.kind==='normal'){
   const l=t.toLowerCase();
   if(/\b(aa rahi|aa raha|coming|nikal rahi|nikal raha|on my way)\b/i.test(l))return{text:fresh(['Achha, aa rahi ho 😌 Safely aao.','Okay, coming. Main yahin hoon.']),pending:{type:'daily',expects:'open',need:'presence'}};
   if(/\b(kha li|khana kha|kha rahi|kha raha|dinner|lunch|breakfast)\b/i.test(l))return{text:fresh(['Achha, khana scene clear. Kya khaaya?','Good. Khana ho gaya toh ab thoda better?']),pending:{type:'daily',expects:'food',need:'conversation'}};
   if(/\b(so rahi|sone ja|neend aa|sleep)\b/i.test(l))return{text:fresh(['Okay Baby, rest karo. Phone rakho toh bhi koi complaint nahi 😌','Haan, jao rest karo. Good night bolne ka mann ho toh bol dena.']),pending:{type:'open',expects:'open',need:'rest'}};
   if(/\b(office|work|college|class|meeting)\b/i.test(l))return{text:fresh(['Achha, kaam wala scene. Aaj manageable hai ya dimag kha raha hai?','Hmm, work mode. Kaisa ja raha hai?']),pending:{type:'support',expects:'open',need:'conversation'}};
 }
 const pool=candidatePool(state,d);let best=pool[0],bestScore=-99;for(let i=0;i<Math.min(pool.length,3);i++){const c=pool[i],s=evaluate(c,state,d);if(s>bestScore){bestScore=s;best=c}}return{text:fresh([best,...pool]),pending:pendingFor(best,state.need)};
}

// ---------------- DISCOVERY ECOSYSTEM ----------------
const EXP=[
{id:'stay',label:'Stay Awhile',fit:['comfort','presence','rest'],min:3,copy:'Kuch solve nahi karna. Bas thodi der yahin.'},
{id:'quiet',label:'Quiet Corner',fit:['space','quiet'],min:1,copy:'No questions. No pressure. Bas thoda quiet.'},
{id:'closer',label:'CLOSER',fit:['closeness'],min:3,copy:'Aaj thoda paas. Baaki duniya mute.'},
{id:'why',label:'Why I Love You',fit:['closeness','reassurance'],min:4,copy:'Generic list nahi. Aaj ki baat se jo real hai, wahi.'},
{id:'letter',label:'Love Letter',fit:['closeness','reassurance'],min:5,copy:'Aaj ke mood se nikla hua letter — invented memories ke bina.'},
{id:'kiss',label:'Kiss',fit:['closeness'],min:4,copy:'Ek fictional kiss. Sirf imagination mein. 😘'},
{id:'dare',label:'Rahul ka Dare',fit:['play'],min:3,copy:'First instinct. Overthink allowed nahi. 😏'},
{id:'choice',label:'This or That',fit:['play'],min:3,copy:'Do choices. No right answer.'},
{id:'guess',label:'Guess Rahul',fit:['play'],min:5,copy:'Tiny guesses. Tum bolo sahi ya bakwaas.'},
{id:'here',label:'If You Were Here',fit:['imagine'],min:3,copy:'Clearly fictional. Real memory nahi.'},
{id:'escape',label:'Little Escape',fit:['imagine','closeness'],min:4,copy:'Aaj ke mood ki chhoti imaginary escape.'},
{id:'midnight',label:'Midnight Scene',fit:['imagine'],min:5,night:true,copy:'Fiction only. Late-night quiet, no rush.'}];
function eligible(){const night=['late-night','night'].includes(part());return EXP.filter(e=>(e.fit.includes(S.need)||e.fit.includes(S.mood))&&users().length>=e.min&&(!e.night||night)&&!S.used.includes(e.id)).filter(e=>!['conflict','low','overwhelmed','irritated'].includes(S.mood)||['stay','quiet'].includes(e.id))}
function experienceCard(){const p=eligible();if(!p.length)return'';const e=pick(p);return`<div class="emerge"><small>CONVERSATION SE NIKLA</small><button data-x="${e.id}"><b>${esc(e.label)}</b><span>${esc(e.copy)}</span></button></div>`}
function launch(id){const e=EXP.find(x=>x.id===id);if(!e)return;S.used=[id,...S.used].slice(0,30);const m={stay:'Theek. Aaj kuch solve nahi karna. Bas yahin rehna. 🫂',quiet:'Okay. Main push nahi karunga. Ek word bhi enough hai.',closer:'Idhar aao. 🫂 No rush. Bas thoda paas.',why:'Aaj ki conversation se hi bolunga — generic reasons invent nahi karunga.',letter:'Aaj ka letter isi moment se niklega. Koi fake memory nahi.',kiss:'Fiction only: ek soft sa kiss… 😘 Bas imagination mein.',dare:'Rahul ka Dare: first instinct — mujhe miss kiya ya aaj attention chahiye? 😏',choice:'This or That: late-night long call ☎️ ya bina bole saath baithna?',guess:'Guess Rahul: tum jab “kuch nahi” bolti ho, kabhi-kabhi uska matlab “abhi mat poochho” bhi hota hai. Sahi ya bakwaas? 😏',here:'Fiction only: tum saamne ho aur main poochta hoon, “Aaj itni chup kyun ho?” Tumhari next line se scene badhega.',escape:'Fiction only: baarish ke baad quiet café. Warm lights. Main bas bolta hoon, “Aaj koi plan nahi. Bas tum.”',midnight:'Fiction only: late night, lights low, phones side mein. Main bolta hoon, “Aaj kahin jaana nahi. Bas baat karte hain.”'}[id];S.messages.push({role:'assistant',text:m,at:Date.now(),experience:id});S.pending={type:'experience',expects:'open',need:S.need};save();render()}

function send(raw){const t=normalize(raw);if(!t)return;const d=classify(t);const state=situation(t,d);S.mood=state.mood;S.need=state.need;S.thread=state.thread;S.messages=[...S.messages,{role:'user',text:t,at:Date.now()}].slice(-120);S.turns=users().length;S.trajectory=[{mood:S.mood,need:S.need,thread:S.thread,at:Date.now()},...S.trajectory].slice(0,20);
 const r=generate(state,d,t);S.messages=[...S.messages,{role:'assistant',text:r.text,at:Date.now()}].slice(-120);S.pending=r.pending||null;save();render()}
function chips(){const c={conversation:['Aaj ka din sunoge?','Kuch poochho','Bas baat karo'],comfort:['Bas mere saath raho','Mujhe distract karo'],calm:['Mujhe calm karo','Main overthink kar rahi hoon'],listen:['Main vent karna chahti hoon'],repair:['Main hurt hoon'],reassurance:['Mujhe reassurance chahiye'],closeness:['Aaj romantic ho','Hug chahiye','Thoda flirt karo'],presence:['Bas yahin raho'],play:['Mujhe hasaao','Tease me','Game khelte hain'],rest:['Mere saath raho'],care:['Main detail batati hoon'],solve:['Situation ye hai…'],understand:['Main explain karti hoon'],imagine:['Imagine a date'],space:['Main baad mein aaungi']}[S.need]||['Baat karo'];return c.map(x=>`<button class="chip" data-c="${esc(x)}">${esc(x)}</button>`).join('')}
function render(){const msgs=S.messages.length?S.messages.map(m=>`<div class="msg ${m.role==='user'?'user':'assistant'}"><span>${m.role==='user'?'AMITA':'AMIRA · RAHUL KA TAREEKA'}</span><p>${esc(m.text)}</p></div>`).join(''):`<div class="welcome"><small>PRIVATE · SIRF TUMHARE LIYE</small><h2>${part()==='late-night'?'Still awake, Baby?':'Aa gayi Baby.'}</h2><p>Yahan catalogue nahi chalega. Tum jo bolo, uska matlab context ke saath samjha jayega.</p></div>`;app.innerHTML=`<div class="world ${esc(S.mood)}"><div class="ambient"></div><div class="noise"></div><header class="top"><button class="brand" data-a="home"><span class="brand-r">R</span><span><b>AmiRa</b><small>Rahul ka personal companion · Amita ke liye</small></span></button><div class="presence"><i></i><span>${S.need==='space'?'thoda space':S.need==='play'?'masti mode':S.need==='closeness'?'thoda paas':'tumhare saath'}</span></div><div class="top-tools"><button data-a="drawer">☰</button></div></header><main class="main"><section class="head"><div class="avatar">R</div><div><small>RAHUL ❤️ AMITA</small><h1>${S.need==='comfort'?'Idhar aa.':S.need==='happy'?'Tell me everything.':S.need==='space'?'Theek hai, Baby.':part()==='late-night'?'Still awake, Baby?':'Haan Baby.'}</h1><p>Conversation first · Rahul ka tareeka · private</p></div></section><section class="thread" id="thread">${msgs}</section>${experienceCard()}<div class="suggestions">${chips()}</div><form class="composer" id="composer"><textarea id="input" rows="1" maxlength="800" placeholder="Jo mann mein hai, seedha bolo…"></textarea><button>↑</button></form><div class="note">Har message ko akela nahi dekha jaata. Previous baat, pending question, emotional direction, implied meaning aur current need milkar next Rahul response decide karte hain.</div></main><aside class="drawer" id="drawer"><div class="drawer-head"><div><small>PRIVATE SPACE</small><h2>Living conversation</h2></div><button data-a="close">×</button></div><div class="drawer-section"><small>ENGINE</small><p>Context → pragmatic meaning → situation state → Rahul strategy → response → next conversational state.</p></div><div class="drawer-section"><small>DISCOVERY</small><p>Rooms, games aur fictional stories conversation se naturally emerge hote hain. Unresolved hurt ke beech interruption nahi.</p></div><div class="drawer-section"><small>AUTHENTICITY</small><p>Fake memories nahi. Rahul hone ka false claim nahi. Future scenes clearly fictional. Space respected.</p></div><button data-a="reset">Aaj ki conversation reset karo</button></aside><div class="veil" data-a="close"></div></div>`;bind();requestAnimationFrame(()=>{const x=document.querySelector('#thread');if(x)x.scrollTop=x.scrollHeight})}
function bind(){document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='drawer')document.querySelector('#drawer')?.classList.add('open');if(a==='close')document.querySelector('#drawer')?.classList.remove('open');if(a==='reset'){S={...DEFAULT};save();render()}});document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>send(b.dataset.c));document.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>launch(b.dataset.x));const f=document.querySelector('#composer'),i=document.querySelector('#input');if(f)f.onsubmit=e=>{e.preventDefault();const v=i?.value||'';if(i)i.value='';send(v)};if(i)i.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f?.requestSubmit()}}}
save();render();
})();
