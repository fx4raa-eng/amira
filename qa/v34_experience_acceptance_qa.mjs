import fs from 'node:fs';
import vm from 'node:vm';

// V34 is an experience gate, not a feature-count gate.
// It verifies the six release principles through the real V32 conversation path:
// naturalness, emotional timing, discovery-safe restraint, continuity, Rahul voice,
// and effortlessness. It deliberately avoids asserting that every response must be long
// or engaging: short, quiet and factual responses are valid outcomes.
const store = new Map();
const listeners = {};
const thread = { innerHTML:'', scrollTop:0, scrollHeight:0, appendChild(){ this.scrollHeight+=1; } };
const input = { value:'' };
const composer = { id:'composer', querySelector:s=>s==='#input'?input:null };
const document = {
  addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
  querySelector(s) { return s==='#thread'?thread:null; },
  createElement() { return { className:'', innerHTML:'', appendChild(){}, textContent:'' }; }
};
const window = { fetch: async()=>({ok:false,json:async()=>({})}), addEventListener(){} };
const context = vm.createContext({window,document,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},Date,Math,JSON,console,AbortSignal:{timeout:()=>undefined},location:{hostname:'github.io',protocol:'https:'},setTimeout});
vm.runInContext(fs.readFileSync('public/v32.js','utf8'),context,{filename:'public/v32.js'});

function ok(name, condition, detail='') { if(!condition) throw new Error(`${name}${detail?` — ${detail}`:''}`); console.log(`PASS ${name}`); }
function submit(text) {
  input.value=text;
  for(const fn of (listeners.submit||[])) fn({target:composer,preventDefault(){},stopImmediatePropagation(){}});
  return new Promise(r=>setTimeout(r,0));
}
function messages(){ return JSON.parse(store.get('amira_companion_v32')||'{}').messages||[]; }
function state(){ return JSON.parse(store.get('amira_companion_v32')||'{}'); }
function last(){ return messages().at(-1)?.text||''; }

// 1) Effortlessness + naturalness: a simple factual request must be answered, not routed
// into relationship language or a system-like mode choice.
await submit('17 × 24?');
ok('effortless factual answer', last()==='Answer: 408.');
ok('factual answer avoids system language', !/choose a mode|what do you want me to do|continue the thread/i.test(last()));
ok('factual answer avoids romantic decoration', !/[❤️💕😘😏]/u.test(last()));

// 2) Emotional timing: vulnerability gets grounded reassurance rather than a question.
await submit('I feel like I am disappointing everyone');
ok('vulnerability gets reassurance', /value|feeling|disappoint/i.test(last()));
ok('reassurance does not interrogate', !/[?]$/.test(last()));

// 3) Explicit boundary: space wins over engagement.
await submit('Mujhe abhi baat nahi karni, leave me');
ok('space is respected', /push nahi karunga|jab mann ho/i.test(last()));
ok('space has no forced pet name', !/\b(Baby|jaan)\b/i.test(last()));
ok('space has no romance or teasing', !/[❤️💕😘😏]/u.test(last()));

// 4) Personal Rahul feel without making Rahul voice the meaning: playful input gets a
// light Hinglish response, not a generic workflow acknowledgement.
await submit('Acha ji 😂 aaj toh masti karni hai');
ok('playful delivery feels contextual', /masti|Rahul|😂/i.test(last()));
ok('playful response avoids meta language', !/choose a mode|following the context|continue the thread/i.test(last()));

// 5) Correction/repair: the system accepts that its previous interpretation can be wrong.
await submit('Nahi, mera matlab woh nahi tha');
ok('correction is acknowledged without defensiveness', /samjha|actual matlab|interpretation/i.test(last()));
ok('correction avoids blame or meta workflow', !/your fault|choose a mode|system|AI detected/i.test(last()));

// 6) Topic continuity: changing subjects must not erase the prior conversation shape.
await submit('Waise dinner mein kya khaun?');
const s=state();
ok('topic switch remains effortless', messages().at(-2)?.intent==='question');
ok('conversation retains multiple thread signals', Array.isArray(s.threads) && s.threads.length>=2);

// 7) No repetitive relationship wrapper after ordinary statements.
await submit('Aaj office kaafi tiring tha');
ok('ordinary statement does not force romance', !/[❤️💕😘😏]/u.test(last()));
ok('ordinary response avoids system language', !/mode|context|thread|behaviour|AI detected/i.test(last()));

// 8) Fifth-use sanity: repeated factual requests remain factual instead of drifting into
// pet-name/romance patterns. This is the anti-repetition guard in user terms.
await submit('24 × 17?');
ok('repeated factual request remains factual', last()==='Answer: 408.');
ok('repeated factual request stays clean', !/[❤️💕😘😏]/u.test(last()) && !/\b(Baby|jaan)\b/i.test(last()));

console.log('V34 Experience Acceptance QA: all checks passed');
