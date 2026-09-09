(()=>{'use strict';
/* AmiRa V33.5 — Adaptive Rahul Delivery
   Adapts Rahul's delivery to the selected behaviour and accumulated relationship state.
   Meaning stays upstream; this layer changes expression only.
*/
const KEY='amira_delivery_v33_5';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const DEFAULT={version:'33.5',turns:[],lastProfile:null};
let S={...DEFAULT,...(()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}})()};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
function profile(body){const b=body?.behaviour||{},r=body?.relationship||{},s=r.signals||{},g=b.behaviourGuardrails||r.guidance||{};const mode=String(b.selectedBehaviour||r.mode||'hold');const serious=(Number(s.vulnerable)||0)+(Number(s.protest)||0)+(Number(s.tension)||0)+(Number(s.withdrawal)||0);const distance=Number(r.distance?.distance)||0,reconnect=Number(r.distance?.reconnection)||0,confidence=Number(r.confidence)||0;
 let p={mode,sentenceLength:'natural',hinglishRatio:.55,petNameFrequency:.25,humour:.25,emoji:.2,warmth:.58,teasing:.12,romance:.18,restraint:.35,questions:1,energy:.5};
 if(mode==='answer'){p={...p,sentenceLength:'task-fit',hinglishRatio:.35,warmth:.42,humour:.08,emoji:.03,teasing:0,romance:0,questions:0,energy:.42}}
 if(mode==='space'){p={...p,sentenceLength:'brief',hinglishRatio:.45,petNameFrequency:.05,humour:.02,emoji:.04,warmth:.4,teasing:0,romance:0,restraint:.92,questions:0,energy:.22}}
 if(mode==='repair'){p={...p,sentenceLength:'short-medium',hinglishRatio:.6,petNameFrequency:.12,humour:.04,emoji:.06,warmth:.72,teasing:0,romance:0,restraint:.86,questions:0,energy:.3}}
 if(mode==='soften'){p={...p,sentenceLength:'short-medium',hinglishRatio:.62,petNameFrequency:.18,humour:.04,emoji:.08,warmth:.82,teasing:0,romance:.04,restraint:.8,questions:0,energy:.3}}
 if(mode==='reassure'){p={...p,sentenceLength:'medium',hinglishRatio:.58,petNameFrequency:.22,humour:.06,emoji:.08,warmth:.86,teasing:.02,romance:.05,restraint:.72,questions:0,energy:.34}}
 if(mode==='approach'){p={...p,sentenceLength:'short-medium',hinglishRatio:.64,petNameFrequency:.32,humour:.25,emoji:.16,warmth:.76,teasing:.28,romance:.3,restraint:.48,questions:1,energy:.58}}
 if(mode==='tease'){p={...p,sentenceLength:'short',hinglishRatio:.72,petNameFrequency:.34,humour:.72,emoji:.3,warmth:.68,teasing:.82,romance:.32,restraint:.25,questions:1,energy:.72}}
 if(mode==='hold'){p={...p,sentenceLength:'short-medium',hinglishRatio:.55,petNameFrequency:.14,humour:.12,emoji:.08,warmth:.62,teasing:.04,romance:.08,restraint:.7,questions:0,energy:.35}}
 // Accumulated state modulates the base profile rather than replacing it.
 p.warmth=clamp(p.warmth+(Number(s.affection)||0)*.08+(Number(s.proximity)||0)*.06-(Number(s.tension)||0)*.12);
 p.humour=clamp(p.humour+(Number(s.playful)||0)*.12-serious*.08);
 p.teasing=clamp(p.teasing+(Number(s.playful)||0)*.14-serious*.2);
 p.romance=clamp(p.romance+(Number(s.affection)||0)*.1+(reconnect*.08)-serious*.18);
 p.romance=clamp(p.romance-(distance*.12));
 p.restraint=clamp(p.restraint+serious*.14+distance*.08-reconnect*.05);
 p.emoji=clamp(p.emoji+(Number(s.playful)||0)*.05-serious*.06);
 p.petNameFrequency=clamp(p.petNameFrequency-serious*.13-distance*.08+reconnect*.04);
 p.hinglishRatio=clamp(p.hinglishRatio+(Number(s.affection)||0)*.04+(Number(s.playful)||0)*.05-serious*.04);
 p.questions=Math.min(Number(b.behaviourQuestions)||p.questions,g.maxQuestions===0?0:p.questions);
 if(g.factualPriority==='high'||mode==='answer'){p.romance=0;p.teasing=0;p.humour=Math.min(p.humour,.1);p.emoji=Math.min(p.emoji,.04);p.questions=0}
 if(g.noForcedPetName||g.petName==='avoid')p.petNameFrequency=0;
 if(g.doNotEscalate||g.romance==='do-not-escalate')p.romance=0;
 if(p.restraint>.78){p.humour=Math.min(p.humour,.08);p.teasing=0;p.emoji=Math.min(p.emoji,.1)}
 p.mode=mode;p.confidence=confidence;p.distance=distance;p.reconnection=reconnect;
 S.lastProfile=p;S.turns=[...(S.turns||[]),{at:Date.now(),mode,restraint:p.restraint,warmth:p.warmth,hinglish:p.hinglishRatio,questions:p.questions}].slice(-60);save();return p}
function inject(body){const p=profile(body);const existingGuardrails=body.behaviour?.behaviourGuardrails&&typeof body.behaviour.behaviourGuardrails==='object'?body.behaviour.behaviourGuardrails:{};body.voice={...(body.voice&&typeof body.voice==='object'?body.voice:{}),adaptiveVersion:'33.5',adaptiveProfile:p,deliveryInstruction:'Use this profile to shape expression only. Never change the factual answer, invent memories, or override boundaries.'};body.behaviour={...(body.behaviour||{}),adaptiveDelivery:'33.5',adaptiveVoiceProfile:p,behaviourLength:p.sentenceLength,behaviourHumour:String(p.humour),behaviourPetName:String(p.petNameFrequency),behaviourIntensity:Number(p.energy),behaviourRestraint:p.restraint>=.78,behaviourGuardrails:{...existingGuardrails,adaptiveProfile:p}};return body}
const nativeFetch=window.fetch.bind(window);window.fetch=async(input,init)=>{try{const url=typeof input==='string'?input:(input&&input.url)||'';if(/\/api\/ai\/chat(?:\?|$)/.test(url)&&init&&typeof init.body==='string'){const body=JSON.parse(init.body);inject(body);init={...init,body:JSON.stringify(body)}}}catch{}return nativeFetch(input,init)};
window.AMIRA_ADAPTIVE_DELIVERY={version:'33.5',profile,read:()=>S,reset:()=>{S={...DEFAULT};save()}};save();
})();
