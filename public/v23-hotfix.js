(()=>{'use strict';
const KEY='amira_companion_v22';
const T=/^(sun|sun na|dekh|haan|ha|yes|yup|yep|nahi|nah|no|acha|accha|theek|theek hai|fine|okay|ok|hmm+|hm+|kuch nahi|nothing|pata nahi|idk|bas|chhodo|chodo|rehne do|jaane do|leave it|yaar|uff|arey|lol|haha|😂+|😭+|🙂+|\.\.\.)$/iu;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}};const write=s=>localStorage.setItem(KEY,JSON.stringify(s));
function add(s,role,text){s.messages=[...(s.messages||[]),{role,text,at:Date.now()}].slice(-100)}
function route(raw,s){let t=raw.trim().toLowerCase(),m=s.mood||'present',n=s.need||'conversation';
if(/^(sun|sun na|dekh)(\s+(baby|jaan))?$/.test(t))return['presence','attention'];
if(/^(haan|ha|yes|yup|yep)(\s+(baby|jaan))?$/.test(t))return[n,'yes'];
if(/^(nahi|nah|no)(\s+(baby|jaan))?$/.test(t))return[n,'no'];
if(/^(hmm+|hm+|\.\.\.)$/.test(t))return[n,['low','overwhelmed','conflict','insecure','quiet'].includes(m)?'soft':'thinking'];
if(/^(kuch nahi|nothing|pata nahi|idk)$/.test(t))return[n,['low','overwhelmed','conflict','insecure'].includes(m)||['comfort','listen','repair','reassurance','presence'].includes(n)?'guarded':'neutral'];
if(/^(chhodo|chodo|rehne do|jaane do|leave it)$/.test(t))return[['low','overwhelmed','conflict','insecure','irritated'].includes(m)?'space':n,['low','overwhelmed','conflict','insecure','irritated'].includes(m)?'deescalate':'drop'];
if(/^(acha|accha)$/.test(t))return[n,'acha'];
if(/^(theek|theek hai|fine|okay|ok)$/.test(t))return[n,'ok'];
if(/^bas$/.test(t))return[['low','overwhelmed','conflict','insecure','irritated'].includes(m)?'space':n,['low','overwhelmed','conflict','insecure','irritated'].includes(m)?'deescalate':'tiny'];
if(/^(yaar|uff|arey)$/.test(t))return[n,'vent'];
if(/^(lol|haha|😂+)$/.test(t))return[n,'laugh'];
if(/^😭+$/u.test(t))return[m==='happy'||m==='playful'?'play':'comfort',m==='happy'||m==='playful'?'laugh':'cry'];
if(/^🙂+$/u.test(t))return[m==='low'?'comfort':n,'smile'];
return[n,'tiny']}
const replies={attention:['Haan Baby, bol na. 👀','Haan jaan, full attention.'],yes:['Haan, samajh gaya. Aage bolo.','Okay Baby 😌 Continue.'],no:['Theek hai, nahi. Main assume nahi karunga.','Achha, got it.'],soft:['Hmm… theek. Main yahin hoon.','Hmm. Jaldi nahi hai.'],thinking:['Hmmm… soch rahi ho? Take your time.','Hmm… main guess nahi maarunga.'],guarded:['“Kuch nahi” noted. Abhi bolne ka mann nahi toh force nahi karunga.','Achha… theek. Jab bolna ho tab bata dena.'],neutral:['Achha 😌','Hmm, okay.'],deescalate:['Theek hai. Chhodte hain. Main push nahi karunga.','Okay Baby, rehne do.'],drop:['Haan, chhod diya. 😌','Theek, topic drop.'],acha:['Achhaaa 😏','Hmm, acha.'],ok:['Theek. Bas genuinely theek ho toh hi.','Okay. Main yahin hoon.'],vent:['Haan yaar, bol.','Uff… bol na, kya hua?'],laugh:['Haan bas 😂','Achhaaa, ye hui baat.'],cry:['Aao 🫂','Haan Baby… idhar.'],smile:['🙂 Hmm. Main over-read nahi karunga. Sab okay?'],tiny:['Haan.']};
function render(s){const root=document.querySelector('#thread');if(!root)return;root.innerHTML=(s.messages||[]).map(x=>`<div class="msg ${x.role==='user'?'user':'assistant'}"><span>${x.role==='user'?'AMITA':'AMIRA · RAHUL KA TAREEKA'}</span><p>${String(x.text).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</p></div>`).join('');root.scrollTop=root.scrollHeight}
function handle(text){let s=read();if(!s.messages)return false;let [need,k]=route(text,s);if(need!==s.need)s.need=need;add(s,'user',text);let a=replies[k]||replies.tiny,r=a[Math.floor(Math.random()*a.length)];add(s,'assistant',r);write(s);render(s);return true}
function install(){const f=document.querySelector('#composer');if(!f||f.dataset.v23)return;f.dataset.v23='1';f.addEventListener('submit',e=>{const i=document.querySelector('#input'),t=(i?.value||'').trim();if(!T.test(t))return;if(!handle(t))return;e.preventDefault();e.stopImmediatePropagation();if(i)i.value=''},true)}
install();new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
})();