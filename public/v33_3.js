(()=>{'use strict';
/* AmiRa V33.3 — Behaviour Selection Engine
   Converts persistent relational state into a concrete response behaviour plan.
   It selects what to do, how much to do, and when deliberately to do less.
   Principle: emotional appropriateness > engagement.
*/
const KEY='amira_behaviour_v33_3';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ANSWER=['math','time','date','how','question'];
const MODES=['answer','approach','hold','soften','reassure','tease','space','repair'];
const DEFAULT={version:'33.3',turns:[],lastPlan:null,success:{},restraint:0};
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
let S={...DEFAULT,...read()};
function persist(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}}
function weighted(name,rel,intent){
 const s=rel?.signals||{},g=rel?.guidance||{};
 const serious=(s.vulnerable||0)+(s.protest||0)+(s.tension||0)+(s.withdrawal||0);
 const factual=ANSWER.includes(intent);
 let score={answer:factual?.98:.05,approach:0,hold:.18,soften:0,reassure:0,tease:0,space:0,repair:0}[name]||0;
 if(name==='space')score+=(s.withdrawal||0)*.95;
 if(name==='repair')score+=(s.protest||0)*.9+(s.repair||0)*.8;
 if(name==='soften')score+=(s.vulnerable||0)*.9+(s.tension||0)*.25;
 if(name==='reassure')score+=(s.reassurance||0)*.9+(s.vulnerable||0)*.3;
 if(name==='approach')score+=(s.affection||0)*.7+(s.proximity||0)*.75;
 if(name==='tease')score+=(s.playful||0)*.9*(1-clamp(serious));
 if(name==='hold')score+=(s.ambiguous||0)*.65+(s.tension||0)*.2;
 if(name==='answer'&&serious&&!factual)score-=.1;
 if(name!=='answer'&&factual)score-=.8;
 if(g.maxQuestions===0&&name==='approach')score-=.05;
 return clamp(score);
}
function select(rel,intent,history){
 const scores={};MODES.forEach(m=>scores[m]=weighted(m,rel,intent));
 // Hard relevance/boundary gates.
 if(ANSWER.includes(intent))return{primary:'answer',secondary:null,scores};
 if(rel?.signals?.withdrawal>=.7)return{primary:'space',secondary:'hold',scores};
 if(rel?.signals?.protest>=.7)return{primary:'repair',secondary:'soften',scores};
 const ordered=[...MODES].sort((a,b)=>scores[b]-scores[a]);
 let primary=ordered[0]||'hold',secondary=ordered[1]||null;
 const previous=S.lastPlan?.primary;
 // Avoid behavioural whiplash: weak changes inherit the previous behaviour.
 if(previous&&previous!==primary&&scores[primary]<scores[previous]+.15&&scores[previous]>.3)primary=previous;
 if(primary==='tease'&&(rel?.signals?.vulnerable||rel?.signals?.tension||rel?.signals?.protest))primary='soften';
 if(primary==='approach'&&rel?.mode==='space')primary='space';
 return{primary,secondary:primary===secondary?null:secondary,scores};
}
function plan(rel,intent,history){
 const chosen=select(rel,intent,history),s=rel?.signals||{},g=rel?.guidance||{};
 const serious=!!(s.vulnerable||s.protest||s.tension||s.withdrawal);
 const p=chosen.primary;
 const answerFirst=p==='answer';
 const actions={answer:['answer the actual request','keep relational flavour secondary'],approach:['move a little closer emotionally','show presence without over-performing'],hold:['stay present','avoid forcing the conversation forward'],soften:['reduce intensity','acknowledge the feeling before solving'],reassure:['give grounded reassurance','avoid making promises that are not known'],tease:['use light situational teasing','stop if the signal turns serious'],space:['respect the boundary','keep the reply brief and non-demanding'],repair:['lower defensiveness','address the friction before romance']}[p]||['respond naturally'];
 const questions=g.maxQuestions===0?0:(p==='answer'?1:(serious?0:1));
 const romance=g.romance||'earned';
 const intensity=clamp((chosen.scores[p]||0)*.7+(serious?-.2:.15));
 const deliberateRestraint=(p==='space'||p==='hold'||serious)&&!answerFirst;
 return{version:'33.3',primary:p,secondary:chosen.secondary,scores:chosen.scores,actions,questions,romance,humour:g.humour||'light',petName:g.petName||'contextual',length:g.length||'natural',intensity,deliberateRestraint,reason:`${p} selected from persistent relationship state`,guardrails:{factualPriority:answerFirst?'high':'normal',doNotEscalate:(romance==='do-not-escalate'),noForcedQuestion:questions===0,noForcedPetName:g.petName==='avoid'}};
}
function analyse(message,intent,rel,history){const r=rel||{};const result=plan(r,intent,history);S.lastPlan=result;S.turns=[...S.turns,{at:Date.now(),intent,primary:result.primary,secondary:result.secondary,restraint:result.deliberateRestraint}].slice(-60);persist();return result}
function outcome(plan,success=true){if(!plan||!success)return;const key=plan.primary;S.success[key]=(S.success[key]||0)+1;S.restraint=clamp((S.restraint||0)*.8+(plan.deliberateRestraint?.15:0));persist()}
window.AMIRA_BEHAVIOUR_SELECTION={version:'33.3',analyse,outcome,read:()=>S,reset:()=>{S={...DEFAULT};persist()}};
/* Inject the selected behaviour into the existing AI contract without taking over V32's
   actual answer generation. Local/factual handling remains untouched. */
const nativeFetch=window.fetch.bind(window);window.fetch=async(input,init)=>{try{const url=typeof input==='string'?input:(input&&input.url)||'';if(/\/api\/ai\/chat(?:\?|$)/.test(url)&&init&&typeof init.body==='string'){const body=JSON.parse(init.body);const rel=body.relationship||{};const behaviour=analyse(body.message||'',body.intent||'statement',rel,Array.isArray(body.history)?body.history:[]);body.behaviour={...(body.behaviour&&typeof body.behaviour==='object'?body.behaviour:{}),selectionState:'33.3',selectedBehaviour:behaviour.primary,secondaryBehaviour:behaviour.secondary,behaviourScores:behaviour.scores,behaviourActions:behaviour.actions,behaviourQuestions:behaviour.questions,behaviourRomance:behaviour.romance,behaviourHumour:behaviour.humour,behaviourPetName:behaviour.petName,behaviourLength:behaviour.length,behaviourIntensity:behaviour.intensity,behaviourRestraint:behaviour.deliberateRestraint,behaviourGuardrails:behaviour.guardrails};init={...init,body:JSON.stringify(body)}}}catch{}return nativeFetch(input,init)};
persist();
})();
