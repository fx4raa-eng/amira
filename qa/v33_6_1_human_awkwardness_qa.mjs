import fs from 'node:fs';
import vm from 'node:vm';

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

await submit('Mujhe abhi baat nahi karni, leave me');
let last=messages().at(-1)?.text||'';
ok('space response is non-demanding', !/[?]$/.test(last));
ok('space response avoids forced pet name', !/\b(Baby|jaan)\b/i.test(last));
ok('space response avoids heart emoji', !/[❤️💕😘😏]/u.test(last));

await submit('I feel like I am disappointing everyone');
last=messages().at(-1)?.text||'';
ok('reassurance is recognised instead of generic acknowledgement', /value|feeling|disappoint/i.test(last));
ok('reassurance does not ask for a mode', !/choose a mode|what do you want me to do/i.test(last));

await submit('17 × 24?');
last=messages().at(-1)?.text||'';
ok('factual answer is concise', last === 'Answer: 408.', `actual=${JSON.stringify(last)} tail=${JSON.stringify(messages().slice(-3))}`);
ok('factual answer has no romantic leakage', !/[❤️💕😘😏]/u.test(last));

await submit('Acha ji 😂 aaj toh masti karni hai');
last=messages().at(-1)?.text||'';
ok('playful response is playful', /😂|masti|Rahul/i.test(last), `actual=${JSON.stringify(last)} tail=${JSON.stringify(messages().slice(-3))}`);

await submit('Tumse gussa hoon');
last=messages().at(-1)?.text||'';
ok('irritation does not trigger flirtation', !/[😏😘💕]/u.test(last));
ok('irritation does not ask unnecessary question', !/[?]$/.test(last));

console.log('V33.6.1 Human Awkwardness QA: all checks passed');
