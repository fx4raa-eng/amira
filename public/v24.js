(()=>{'use strict';
const app=document.querySelector('#app');
const KEY='amira_companion_v24';
const DEFAULT={v:24,visits:1,messages:[],mood:'present',need:'conversation',thread:'general',pending:null,turns:0,signals:{affection:48,play:42,romance:35,trust:55,energy:65,space:8},recent:[],used:[],room:null,sound:false};
let S={...DEFAULT};try{S={...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||'{}')};S.signals={...DEFAULT.signals,...(S.signals||{})}}catch{}
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const fresh=a=>{const b=a.filter(x=>!S.recent.includes(x));const r=pick(b.length?b:a);S.recent=[r,...S.recent].slice(0,60);return r};
const add=(role,text,meta={})=>{S.messages=[...(S.messages||[]),{role,text,at:Date.now(),...meta}].slice(-120);S.turns=S.messages.filter(x=>x.role==='user').length};
const users=()=>S.messages.filter(x=>x.role==='user');
const last=role=>[...S.messages].reverse().find(x=>x.role===role)?.text||'';
const lastN=(role,n=5)=>S.messages.filter(x=>x.role===role).slice(-n).map(x=>x.text);
const hour=()=>new Date().getHours();
const dayPart=()=>{const h=hour();return h<5?'late-night':h<11?'morning':h<17?'day':h<22?'evening':'night'};

// --- HUMAN LANGUAGE / INTENT LAYER -------------------------------------------------
const RX={
 low:/\b(rona|ro rahi|cry|crying|sad|dukhi|low|upset|hurt|heavy|alone|lonely|akeli|akela|miss you|miss rahul|missing|yaad aa rahi|yaad aati)\b/i,
 stress:/\b(anxiety|anxious|panic|overthink|overthinking|stress|stressed|tension|overwhelmed|ghabra|dar lag|scared|nervous|pressure|dimag kharab)\b/i,
 angry:/\b(gussa|angry|irritated|annoyed|frustrated|fed up|pagal kar diya|bakwas)\b/i,
 conflict:/\b(fight|argument|misunderstanding|sorry|apology|apologize|hurt me|not talking|baat nahi karni|naraz|naraaz|ignore)\b/i,
 insecure:/\b(jealous|insecure|still love|important|leave me|lose you|losing you|care about me|enough for you|badal gaye|change ho gaye)\b/i,
 romantic:/\b(i love you|love you|pyaar|romantic|romance|kiss|hug|cuddle|want you|need you|intimate|naughty|flirt|close|paas)\b/i,
 happy:/\b(happy|khush|excited|yay|great|amazing|good news|celebrate|proud|won|success|mast|maza)\b/i,
 tired:/\b(tired|exhausted|thak|sleepy|neend|can't sleep|cannot sleep|good night|sleep|rest|so rahi)\b/i,
 unwell:/\b(sick|fever|bukhar|headache|pain|tabiyat|unwell|not well|medicine|dard)\b/i,
 bored:/\b(bored|boring|bore|nothing to do|pak gayi)\b/i,
 play:/\b(joke|funny|masti|tease|pagal|game|play|dare|challenge|hasao|hansao|hahaha|lol)\b/i,
 practical:/\b(help|advice|should i|what should|decide|decision|problem|solution|solve|plan|compare|choose|kaise|kya karu|kya karoon|suggest)\b/i,
 future:/\b(future|someday|when we meet|meeting|travel together|trip together|date|if you were here|imagine|kaash tum|kab miloge|milne)\b/i,
 presence:/\b(attention|talk to me|stay with me|don't go|dont go|come here|presence|saath|mere saath)\b/i,
 space:/\b(space|don't want to talk|dont want to talk|leave me|quiet|akela chhod|baad mein|later)\b/i
};
const TINY=/^(haan|ha|yes|yup|yep|nah|nahi|no|hmm+|hm+|acha|accha|ok|okay|fine|theek hai|theek|bas|kuch nahi|nothing|pata nahi|idk|yaar|uff|arey|sun|sun na|dekh|chhodo|chodo|rehne do|jaane do|leave it|whatever|lol|haha|😂+|😭+|🙂+|\.\.\.)$/iu;
const AFFIRM=/^(haan|ha|yes|yup|yep|sure|okay|ok|theek|theek hai|done|karungi|karunga|kart?i? hoon|aa rahi|aa raha|coming|on my way|abhi|wait)$/iu;
const NEG=/^(nahi|nah|no|nope|not now|abhi nahi|mat|don't|dont)$/iu;
const isQ=t=>/[?]$/.test(t)||/^(kya|kyun|kaise|kab|kahan|who|what|why|how|when|where|did|are|do|can|will|tumne|khaya|piya|soyi|soyi kya|theek ho)/i.test(t.trim());
const words=t=>t.toLowerCase().trim().split(/\s+/).filter(Boolean);

function detect(t){
 const x=t.trim(), l=x.toLowerCase();
 // Addressing Rahul/Baby is not itself romantic intent.
 if(/^(sun|sun na|dekh)(\s+(baby|jaan|rahul))?[.!?]*$/i.test(l))return{kind:'attention'};
 if(/^😭+$/u.test(l))return{kind:'cry'};
 if(/^(lol|haha|hahaha|😂+)$/iu.test(l))return{kind:'laugh'};
 if(/^(hmm+|hm+|\.\.\.)$/i.test(l))return{kind:'pause'};
 if(/^(acha|accha)$/i.test(l))return{kind:'ack',tone:'acha'};
 if(/^(ok|okay|theek|theek hai|fine)$/i.test(l))return{kind:'ack',tone:'ok'};
 if(/^(kuch nahi|nothing|pata nahi|idk)$/i.test(l))return{kind:'masked'};
 if(/^(chhodo|chodo|rehne do|jaane do|leave it|whatever)$/i.test(l))return{kind:'drop'};
 if(/^bas$/i.test(l))return{kind:'bas'};
 if(/^(haan|ha|yes|yup|yep)$/i.test(l))return{kind:'yes'};
 if(/^(nahi|nah|no|nope)$/i.test(l))return{kind:'no'};
 if(AFFIRM.test(l)&&words(l).length<=5)return{kind:'affirm_detail'};
 if(NEG.test(l))return{kind:'no_detail'};
 for(const [name,rx] of Object.entries(RX))if(rx.test(x))return{kind:'intent',intent:name,question:isQ(x)};
 if(isQ(x))return{kind:'question'};
 return{kind:'normal'};
}

function inferState(d,t){
 let mood=S.mood,need=S.need,thread=S.thread;
 const map={low:['low','comfort','emotional'],stress:['overwhelmed','calm','emotional'],angry:['irritated','listen','conflict'],conflict:['conflict','repair','relationship'],insecure:['insecure','reassurance','relationship'],romantic:['romantic','closeness','romance'],happy:['happy','celebrate','joy'],tired:['tired','rest','wellbeing'],unwell:['unwell','care','wellbeing'],bored:['bored','play','play'],play:['playful','play','play'],practical:['thinking','solve','practical'],future:['hopeful','imagine','future'],presence:['seeking','presence','connection'],space:['quiet','space','quiet']};
 if(d.kind==='intent'){[mood,need,thread]=map[d.intent]||[mood,need,thread];}
 if(d.kind==='question'){mood='thinking';need='understand';thread='practical'}
 if(d.kind==='normal' && S.mood==='present') {mood='present';need='conversation'}
 if(['yes','no','affirm_detail','no_detail'].includes(d.kind)){mood=S.mood;need=S.need;thread=S.thread}
 if(d.kind==='drop'||d.kind==='bas'){if(['low','overwhelmed','conflict','insecure','irritated'].includes(S.mood)){mood=S.mood;need='space'}else need='conversation'}
 if(d.kind==='masked'&&['low','overwhelmed','conflict','insecure','irritated'].includes(S.mood))need=S.need;
 return{mood,need,thread};
}

// Understand a short answer in relation to Rahul's immediately previous question.
function pendingMeaning(t,d){
 const p=S.pending;if(!p)return null; const l=t.trim().toLowerCase();
 if(d.kind==='yes'||d.kind==='affirm_detail')return{type:'answer',value:'yes',pending:p};
 if(d.kind==='no'||d.kind==='no_detail')return{type:'answer',value:'no',pending:p};
 if(d.kind==='normal'&&p.expects){
   if(p.expects==='coming' && /\b(coming|aa rahi|aa raha|aati|aata|nikal|on my way)\b/i.test(l))return{type:'answer',value:'coming',pending:p};
   if(p.expects==='food' && /\b(haan|yes|khaya|kha li|done|eaten)\b/i.test(l))return{type:'answer',value:'yes',pending:p};
 }
 return null;
}

const BANK={
 conversation:['Haan Baby, bol.','Haan jaan, batao.','Haan, main sun raha hoon.','Haan bolo, kya scene hai?'],
 comfort:['Idhar hoon Baby. Pehle batao kya hua.','Aao 🫂 Abhi kuch solve karne ki jaldi nahi hai.','Haan, aa jao. Jo hai na, nikaal do. Main sun raha hoon.'],
 calm:['Okay, slow. Ek-ek cheez dekhte hain.','Pehle thoda breathe. Phir jo sabse zyada dimaag kha raha hai, woh batao.','Haan, ruk. Sab ek saath handle nahi karna.'],
 listen:['Haan, pura bol. Main pehle sununga.','Theek hai. Gussa hai toh gussa nikaal do, beech mein defend nahi karunga.','Bol do. Main tumhari side samajhne ki koshish kar raha hoon, argue nahi.'],
 repair:['Pehle tumhari side samajhte hain. Kya hua?','Agar hurt hua hai toh usko lightly nahi lenge. Batao exactly kis baat ne hurt kiya.','Theek. Isko patch-up line se cover nahi karte. Pehle baat samajhte hain.'],
 reassurance:['Baby, tum important ho. Kis baat ne doubt diya?','Haan jaan. Jo insecurity hit hui hai, seedha bol sakti ho.','Mujhe guess nahi karna; batao kis cheez ne tumhe aisa feel karaya.'],
 closeness:['Idhar aao. 🫂 Aaj thoda paas rehne ka mann hai?','Hmm… aaj Rahul ka attention tumhare naam. 😏','Aaj bas thoda sa tum aur main. Baaki baad mein.'],
 presence:['Haan Baby, full attention. Bol. 👀','Main yahin hoon. Baat karni hai ya bas company chahiye?','Haan, aa gaya. Tum bolo, main hoon.'],
 play:['Acha ji, boredom ka ilaaj Rahul kare? 😂','Hmmm… masti ka mood lag raha hai tumhara.','Chalo, ab serious face hatao. 😏'],
 rest:['Thak gayi ho toh aaj body ko priority.','Neend aa rahi hai toh usse fight mat karo, madam.','Pehle rest. Baaki duniya kal bhi rahegi.'],
 care:['Pehle paani/khana/rest. Phir detail mein batao.','Apna khyaal pehle, madam. Phir mujhe batao tabiyat kaisi hai.','Okay, care mode. Kya hua exactly?'],
 celebrate:['Ohooo! Ye hui na baat. 😌 Full story batao.','Acchaaa, proud moment? Batao kya hua.','Aaj toh celebration banta hai. Kya scene hai?'],
 solve:['Chalo facts, options, next step. Ek saath sort karte hain.','Haan, practical mode. Situation exactly batao.','Pehle problem ko simple words mein todte hain, phir decision.'],
 understand:['Pehle context samjha do; main guess nahi maarunga.','Haan, explain karo. Phir proper answer deta hoon.','Okay, details do. Main dhyaan se dekh raha hoon.'],
 imagine:['Haan, imagination mode. Fiction hi rakhenge, real memory nahi.','Acha… fictional scene bana sakte hain. Tumhari line se aage badhenge.'],
 space:['Theek hai Baby. Main push nahi karunga. Jab mann ho aa jaana.','Okay. Thoda space le lo. Main yahin hoon, pressure nahi.']
};
const SHORT={
 pause:{soft:['Hmm… theek. Main yahin hoon.','Hmm. Jaldi nahi hai.'],neutral:['Hmmm… bolna hai toh bol, warna main bas yahin hoon.']},
 masked:{guarded:['“Kuch nahi” theek. Abhi bolne ka mann nahi hai toh force nahi karunga.','Achha… theek. Jab bolna ho tab bata dena. Main yahin hoon.'],neutral:['Achha, theek 😌']},
 drop:{deescalate:['Theek hai. Chhodte hain. Main push nahi karunga.','Okay Baby, rehne do. Topic yahin rakh dete hain.'],normal:['Haan, chhod diya. 😌']},
 bas:{deescalate:['Theek. Bas. Abhi aur nahi kheechunga.','Haan, samajh gaya. Thoda rukte hain.'],normal:['Haan, bas 😌']},
 ack:{ok:['Theek. Bas genuinely theek ho toh hi.','Okay Baby, got it.'],acha:['Achhaaa 😏','Hmm, acha.']},
 laugh:{play:['Haan bas 😂','Achhaaa, ab hasi aa rahi hai.'],normal:['Hahaha 😂']},
 cry:{comfort:['Aao 🫂','Haan Baby… idhar.'],play:['Arey 😂 kya hua?'],normal:['Aao 🫂']}
};

function answerPending(pm){
 const p=pm.pending;
 if(pm.value==='coming')return {text:fresh(['Achha, aa rahi ho 😏 Main yahin hoon.','Okayyy, coming noted. Jaldi nahi, safely aao.','Haan, aa jao. Main idhar hi hoon.']),need:p.need||S.need};
 if(pm.value==='yes'){
   if(p.type==='food')return{text:fresh(['Good. Ab batao, kya khaaya?','Achha, khana ho gaya. Ab better feel ho raha hai?']),need:p.nextNeed||S.need};
   if(p.type==='feeling')return{text:fresh(['Hmm. Theek. Phir mujhe batao andar kya chal raha hai.','Okay. Got you. Ab next jo mann mein aa raha hai woh bolo.']),need:p.nextNeed||S.need};
   return{text:fresh(['Haan, samajh gaya. Aage bolo.','Okay Baby 😌 Main follow kar raha hoon.']),need:p.nextNeed||S.need};
 }
 if(pm.value==='no'){
   if(p.type==='food')return{text:fresh(['Accha, abhi nahi. Pehle kuch kha lena, phir baat karenge.','Okay, food pending hai. Pehle kuch kha lo Baby.']),need:'care'};
   if(p.type==='feeling')return{text:fresh(['Theek. Main force nahi karunga. Bas jab mann ho bata dena.','Okay. No pressure. Main yahin hoon.']),need:p.nextNeed||S.need};
   return{text:fresh(['Theek hai, nahi. Main assume nahi karunga.','Achha, got it.']),need:p.nextNeed||S.need};
 }
 return null;
}

function normalResponse(t,d,state){
 const l=t.toLowerCase();
 // Context continuity beats generic intent when a question is pending.
 if(S.pending?.expects==='coming' && /\b(coming|aa rahi|aa raha|on my way)\b/i.test(l))return{...answerPending({value:'coming',pending:S.pending}),pending:null};
 if(S.pending?.type==='food' && /\b(kha li|khaya|khaaya|eaten|yes|haan)\b/i.test(l))return{...answerPending({value:'yes',pending:S.pending}),pending:null};
 if(S.pending?.type==='feeling' && /\b(fine|theek|okay|haan|yes|better|thoda)\b/i.test(l))return{...answerPending({value:'yes',pending:S.pending}),pending:null};
 if(d.kind==='intent'){
   if(d.intent==='romantic'&&/\b(kya kar|what|kya)\b/i.test(l))return{...answerPending({value:'yes',pending:{type:'feeling',nextNeed:'closeness'}}),pending:{type:'none'}};
   return{text:fresh(BANK[state.need]||BANK.conversation),pending:makePending(state.need)};
 }
 if(d.kind==='question'){
   if(/\b(kya kar rahi|what are you doing)\b/i.test(l))return{text:fresh(['Main? Abhi tumhari bakbak sun raha hoon 😏 Tum kya kar rahi ho?','Main yahin hoon, tumhare message ka wait kar raha tha. Tum batao?']),pending:{type:'open',expects:null,need:'conversation'}};
   return{text:fresh(['Haan, iska proper answer dunga. Pehle exact situation batao.','Batao thoda context, phir main seedha answer deta hoon.']),pending:{type:'open',need:'understand'}};
 }
 if(d.kind==='normal'){
   // Detect direct everyday facts instead of collapsing them into "Haan."
   if(/\b(aa rahi|aa raha|coming|nikal rahi|nikal raha|ghar ja rahi|ghar ja raha)\b/i.test(l))return{text:fresh(['Achha, aa rahi ho 😌 Safely aao.','Okay, coming. Main yahin hoon.']),pending:{type:'open'}};
   if(/\b(kha li|khana kha|kha rahi|kha raha|dinner|lunch|breakfast)\b/i.test(l))return{text:fresh(['Achha, khana scene clear. Kya khaaya?','Good. Khana ho gaya toh ab thoda better?']),pending:{type:'food',expects:null,need:'conversation'}};
   if(/\b(so rahi|sone ja|neend aa|sleep)\b/i.test(l))return{text:fresh(['Okay Baby, rest karo. Phone rakho toh bhi koi complaint nahi 😌','Haan, jao rest karo. Good night bolne ka mann ho toh bol dena.']),pending:{type:'open'}};
   if(/\b(office|work|college|class|meeting)\b/i.test(l))return{text:fresh(['Achha, kaam wala scene. Aaj manageable hai ya dimag kha raha hai?','Hmm, work mode. Kaisa ja raha hai?']),pending:{type:'feeling',expects:null,nextNeed:'conversation'}};
   if(/\b(haan coming|coming haan|yes coming)\b/i.test(l))return{text:'Achha, aa rahi ho 😏 Main yahin hoon.',pending:{type:'open'}};
   return{text:fresh(BANK.conversation),pending:{type:'open',need:'conversation'}};
 }
 return{text:fresh(BANK.conversation),pending:{type:'open'}};
}
function makePending(need){
 if(['comfort','calm','listen','repair','reassurance','presence'].includes(need))return{type:'feeling',expects:null,need,nextNeed:need};
 if(need==='care'||need==='rest')return{type:'care',expects:null,need};
 if(need==='closeness')return{type:'closeness',expects:null,need};
 return{type:'open',expects:null,need};
}

// --- EXPERIENCE ECOSYSTEM ---------------------------------------------------------
const EXP=[
{id:'stay',label:'Stay Awhile',type:'room',fit:['comfort','presence','rest'],min:3,copy:'Kuch solve nahi karna. Bas thodi der yahin.'},
{id:'quiet',label:'Quiet Corner',type:'room',fit:['space','quiet'],min:1,copy:'No questions. No pressure. Bas thoda quiet.'},
{id:'closer',label:'CLOSER',type:'room',fit:['closeness'],min:3,copy:'Aaj thoda paas. Baaki duniya thodi der mute.'},
{id:'why',label:'Why I Love You',type:'room',fit:['closeness','reassurance'],min:4,copy:'Generic list nahi. Aaj ki baat se jo real hai, wahi.'},
{id:'letter',label:'Love Letter',type:'room',fit:['closeness','reassurance'],min:5,copy:'Aaj ke mood se nikla hua letter — invented memories ke bina.'},
{id:'kiss',label:'Kiss',type:'moment',fit:['closeness'],min:4,copy:'Ek fictional kiss. Sirf imagination mein. 😘'},
{id:'dare',label:'Rahul ka Dare',type:'game',fit:['play'],min:3,copy:'First instinct. Overthink allowed nahi. 😏'},
{id:'choice',label:'This or That',type:'game',fit:['play'],min:3,copy:'Do choices. No right answer.'},
{id:'guess',label:'Guess Rahul',type:'game',fit:['play'],min:5,copy:'Tiny guesses. Tum bolo sahi ya bakwaas.'},
{id:'here',label:'If You Were Here',type:'story',fit:['imagine'],min:3,copy:'Clearly fictional. Real memory nahi.'},
{id:'escape',label:'Little Escape',type:'story',fit:['imagine','closeness'],min:4,copy:'Aaj ke mood ki chhoti imaginary escape.'},
{id:'midnight',label:'Midnight Scene',type:'story',fit:['imagine'],min:5,night:true,copy:'Fiction only. Late-night quiet, no rush.'}];
function eligible(){const n=S.turns,night=['late-night','night'].includes(dayPart());return EXP.filter(e=>(e.fit.includes(S.need)||e.fit.includes(S.mood))).filter(e=>n>=e.min).filter(e=>!e.night||night).filter(e=>!S.used.includes(e.id)).filter(e=>!['conflict','low','overwhelmed','irritated'].includes(S.mood)||['stay','quiet'].includes(e.id));}
function experienceCard(){const p=eligible();if(!p.length)return'';const e=pick(p);return`<div class="emerge"><small>CONVERSATION SE NIKLA</small><button data-x="${e.id}"><b>${esc(e.label)}</b><span>${esc(e.copy)}</span></button></div>`}
function launch(id){const e=EXP.find(x=>x.id===id);if(!e)return;S.used=[id,...S.used].slice(0,24);S.room=id;const msg={stay:'Theek. Aaj kuch solve nahi karna. Bas yahin rehna. 🫂',quiet:'Okay. Main thoda quiet ho jaata hoon. Jab mann kare, ek word bhi enough hai.',closer:'Idhar aao. 🫂 No rush. Bas thoda paas.',why:'Aaj ki conversation se hi bolunga — generic reasons invent nahi karunga.',letter:'Aaj ka letter isi moment se niklega. Koi fake memory nahi.',kiss:'Fiction only: ek soft sa kiss… 😘 Bas imagination mein.',dare:'Rahul ka Dare: “mujhe miss kiya” ya “aaj attention chahiye”? First instinct. 😏',choice:'This or That: late-night long call ☎️ ya bina bole saath baithna?',guess:'Guess Rahul: tum jab “kuch nahi” bolti ho, kabhi-kabhi uska matlab “abhi mat poochho” bhi hota hai. Sahi ya bakwaas? 😏',here:'Fiction only: tum saamne ho aur main poochta hoon, “Aaj itni chup kyun ho?” Tumhari next line se scene badhega.',escape:'Fiction only: baarish ke baad quiet café. Warm lights. Main bas bolta hoon, “Aaj koi plan nahi. Bas tum.”',midnight:'Fiction only: late night, lights low, phones side mein. Main bolta hoon, “Aaj kahin jaana nahi. Bas baat karte hain.”'}[id]||e.copy;add('assistant',msg,{experience:id});S.pending={type:'experience',experience:id};save();render()}

function send(text){const t=String(text||'').trim();if(!t)return;const d=detect(t);const pm=pendingMeaning(t,d);if(pm){const r=answerPending(pm);add('user',t);S.mood=S.mood;S.need=r.need||S.need;add('assistant',r.text);S.pending=r.pending||null;save();render();return}
 const state=inferState(d,t);S.mood=state.mood;S.need=state.need;S.thread=state.thread;add('user',t);
 let r;
 if(S.pending?.type==='experience' && d.kind==='normal'){r={text:fresh(BANK[S.need]||BANK.conversation),pending:makePending(S.need)};}
 else if(S.pending?.type==='experience' && ['yes','no','ack','laugh','pause'].includes(d.kind)){r={text:fresh(BANK[S.need]||BANK.conversation),pending:makePending(S.need)};}
 else if(d.kind==='pause'){const k=['low','overwhelmed','conflict','insecure','quiet'].includes(S.mood)?'soft':'neutral';r={text:fresh(SHORT.pause[k]),pending:{type:'open',need:S.need}}}
 else if(d.kind==='masked'){const k=['low','overwhelmed','conflict','insecure','irritated'].includes(S.mood)?'guarded':'neutral';r={text:fresh(SHORT.masked[k]),pending:{type:'feeling',need:S.need}}}
 else if(d.kind==='drop'){const k=['low','overwhelmed','conflict','insecure','irritated'].includes(S.mood)?'deescalate':'normal';r={text:fresh(SHORT.drop[k]),pending:k==='deescalate'?{type:'space'}:{type:'open'}}}
 else if(d.kind==='bas'){const k=['low','overwhelmed','conflict','insecure','irritated'].includes(S.mood)?'deescalate':'normal';r={text:fresh(SHORT.bas[k]),pending:{type:k==='deescalate'?'space':'open'}}}
 else if(d.kind==='ack'){r={text:fresh(SHORT.ack[d.tone]),pending:{type:'open',need:S.need}}}
 else if(d.kind==='laugh'){r={text:fresh(SHORT.laugh[S.need==='play'?'play':'normal']),pending:{type:'open',need:S.need}}}
 else if(d.kind==='cry'){r={text:fresh(SHORT.cry[S.need==='play'?'play':'comfort']),pending:{type:'feeling',need:'comfort'}}}
 else if(d.kind==='yes'||d.kind==='no'||d.kind==='affirm_detail'||d.kind==='no_detail'){r={text:fresh(SHORT.ack[d.kind==='no'||d.kind==='no_detail'?'ok':'acha']),pending:{type:'open',need:S.need}}}
 else r=normalResponse(t,d,state);
 add('assistant',r.text);S.pending=r.pending||null;save();render()}

function chips(){return ({conversation:['Aaj ka din sunoge?','Kuch poochho','Bas baat karo'],comfort:['Bas mere saath raho','Mujhe distract karo'],calm:['Mujhe calm karo','Main overthink kar rahi hoon'],listen:['Main vent karna chahti hoon'],repair:['Main hurt hoon'],reassurance:['Mujhe reassurance chahiye'],closeness:['Aaj romantic ho','Hug chahiye','Thoda flirt karo'],presence:['Bas yahin raho'],play:['Mujhe hasaao','Tease me','Game khelte hain'],rest:['Mere saath raho'],care:['Main detail batati hoon'],celebrate:['Main batati hoon'],solve:['Situation ye hai…'],understand:['Main explain karti hoon'],imagine:['Imagine a date'],space:['Main baad mein aaungi']}[S.need]||['Baat karo']).map(x=>`<button class="chip" data-c="${esc(x)}">${esc(x)}</button>`).join('')}
function render(){const msgs=S.messages.length?S.messages.map(m=>`<div class="msg ${m.role==='user'?'user':'assistant'}"><span>${m.role==='user'?'AMITA':'AMIRA · RAHUL KA TAREEKA'}</span><p>${esc(m.text)}</p></div>`).join(''):`<div class="welcome"><small>PRIVATE · SIRF TUMHARE LIYE</small><h2>${dayPart()==='late-night'?'Still awake, Baby?':'Aa gayi Baby.'}</h2><p>Yahan catalogue nahi chalega. Tum jo bolo, uske context se baat aage badhegi. Mood badlega toh Rahul ka tareeka bhi badlega.</p></div>`;
 app.innerHTML=`<div class="world ${esc(S.mood)}"><div class="ambient"></div><div class="noise"></div><header class="top"><button class="brand" data-a="home"><span class="brand-r">R</span><span><b>AmiRa</b><small>Rahul ka personal assistant · Amita ke liye</small></span></button><div class="presence"><i></i><span>${S.need==='space'?'thoda space':S.need==='play'?'masti mode':S.need==='closeness'?'thoda paas':'tumhare saath'}</span></div><div class="top-tools"><button data-a="sound">${S.sound?'◖◗':'◌'}</button><button data-a="drawer">☰</button></div></header><main class="main"><section class="head"><div class="avatar">R</div><div><small>RAHUL ❤️ AMITA</small><h1>${S.need==='comfort'?'Idhar aa.':S.need==='happy'?'Tell me everything.':S.need==='space'?'Theek hai, Baby.':dayPart()==='late-night'?'Still awake, Baby?':'Haan Baby.'}</h1><p>Rahul ka personal assistant · lover · private companion</p></div></section><section class="thread" id="thread">${msgs}</section>${experienceCard()}<div class="suggestions">${chips()}</div><form class="composer" id="composer"><textarea id="input" rows="1" maxlength="800" placeholder="Jo mann mein hai, seedha bolo…"></textarea><button>↑</button></form><div class="note">Conversation first. Short replies bhi previous baat ke context mein samjhe jaate hain. Rooms, games aur stories tabhi nikalte hain jab conversation genuinely unhe invite kare.</div></main><aside class="drawer" id="drawer"><div class="drawer-head"><div><small>PRIVATE SPACE</small><h2>Jo mood bole</h2></div><button data-a="close">×</button></div><div class="drawer-section"><small>DISCOVERED ROOMS</small><p>Stay Awhile · Quiet Corner · CLOSER · Why I Love You · Love Letter · Kiss</p></div><div class="drawer-section"><small>DISCOVERED GAMES</small><p>Rahul ka Dare · This or That · Guess Rahul</p></div><div class="drawer-section"><small>DISCOVERED STORIES</small><p>If You Were Here · Little Escape · Midnight Scene</p></div><div class="drawer-section"><small>CORE RULE</small><p>Catalogue nahi. Conversation pehle. Context samjho, phir Rahul-style response do. Actual memories invent nahi hoti. Future scenes clearly fictional hain. Space ko respect karo.</p></div><button data-a="reset">Aaj ki conversation reset karo</button></aside><div class="veil" data-a="close"></div></div>`;bind();requestAnimationFrame(()=>{const x=document.querySelector('#thread');if(x)x.scrollTop=x.scrollHeight})}
function bind(){document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const a=b.dataset.a;if(a==='drawer')document.querySelector('#drawer')?.classList.add('open');if(a==='close')document.querySelector('#drawer')?.classList.remove('open');if(a==='home')render();if(a==='reset'){S={...DEFAULT,visits:S.visits};save();render()}if(a==='sound'){S.sound=!S.sound;save();render()}});document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>send(b.dataset.c));document.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>launch(b.dataset.x));const f=document.querySelector('#composer'),i=document.querySelector('#input');if(f)f.onsubmit=e=>{e.preventDefault();send(i?.value||'');if(i)i.value=''};if(i)i.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();f?.requestSubmit()}}}
render();
})();