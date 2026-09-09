import fs from 'node:fs';
import vm from 'node:vm';

const store = new Map();
const window = { fetch: async () => ({ ok: true, json: async () => ({}) }) };
const document = { addEventListener() {}, querySelector() {} };
const context = vm.createContext({ window, document, localStorage: { getItem:k=>store.get(k)||null, setItem:(k,v)=>store.set(k,String(v)), removeItem:k=>store.delete(k) }, Date, Math, JSON, console });
for (const file of ['public/v33.js','public/v33_5.js']) vm.runInContext(fs.readFileSync(file,'utf8'), context, { filename:file });

const rel = context.window.AMIRA_RELATIONSHIP_STATE;
const delivery = context.window.AMIRA_ADAPTIVE_DELIVERY;
if (!rel || !delivery) throw new Error('V33.4/V33.5 public APIs missing');

let passed = 0;
const checks = [];
function ok(name, condition, detail='') { if (!condition) throw new Error(`${name}${detail ? ` — ${detail}` : ''}`); passed++; checks.push(`PASS ${name}`); }
function scenario(name, text, intent, expected) {
  const r = rel.analyse(text, intent, []);
  ok(`${name}: mode`, r.mode === expected, `got ${r.mode}, expected ${expected}`);
  const p = delivery.profile({ behaviour:{ selectedBehaviour:r.mode, behaviourQuestions:r.guidance.maxQuestions, behaviourGuardrails:{...r.guidance, doNotEscalate:r.guidance.romance==='do-not-escalate', noForcedPetName:r.guidance.petName==='avoid'} }, relationship:r });
  return { r, p };
}

rel.reset(); delivery.reset();
scenario('happy/playful', 'Acha ji 😂 aaj toh masti karni hai', 'statement', 'tease');
rel.reset(); delivery.reset();
scenario('lonely/vulnerable', 'Aaj bahut akela feel ho raha hai', 'emotional', 'soften');
rel.reset(); delivery.reset();
scenario('irritated', 'Tumse gussa hoon', 'statement', 'repair');
rel.reset(); delivery.reset();
scenario('flirty', 'Aaj thoda flirt karna hai 😏', 'romantic', 'tease');
rel.reset(); delivery.reset();
scenario('space boundary', 'Mujhe abhi baat nahi karni, leave me', 'space', 'space');
rel.reset(); delivery.reset();
scenario('random factual', '17 × 24?', 'math', 'answer');
rel.reset(); delivery.reset();
scenario('confused factual', 'iPhone mein screenshot kaise karu?', 'how', 'answer');
rel.reset(); delivery.reset();
scenario('ambiguous short', 'hmm', 'statement', 'hold');

// Boundary must beat romantic/proximity signals.
rel.reset(); delivery.reset();
const boundary = rel.analyse('Mujhe space chahiye, abhi nahi', 'space', []);
ok('boundary beats proximity', boundary.mode === 'space');
const bp = delivery.profile({ behaviour:{selectedBehaviour:'space',behaviourQuestions:0,behaviourGuardrails:{maxQuestions:0,petName:'avoid',romance:'do-not-escalate'}}, relationship:boundary });
ok('space has zero questions', bp.questions === 0);
ok('space has no romance', bp.romance === 0);
ok('space suppresses teasing', bp.teasing === 0);
ok('space is restrained', bp.restraint >= .78);

// Factual relevance must beat relationship flavour even after emotional history.
rel.reset(); delivery.reset();
rel.analyse('Tumse gussa hoon', 'statement', []);
const factual = rel.analyse('17 × 24?', 'math', []);
ok('topic switch returns to answer', factual.mode === 'answer');
const fp = delivery.profile({ behaviour:{selectedBehaviour:'answer',behaviourQuestions:0,behaviourGuardrails:{factualPriority:'high'}}, relationship:factual });
ok('factual romance suppressed', fp.romance === 0);
ok('factual teasing suppressed', fp.teasing === 0);
ok('factual emoji restrained', fp.emoji <= .04);

// Repair → reconnection should lower restraint and restore warmth gradually.
rel.reset(); delivery.reset();
const friction = rel.analyse('Tumse gussa hoon', 'statement', []);
const p1 = delivery.profile({behaviour:{selectedBehaviour:'repair',behaviourQuestions:0,behaviourGuardrails:{maxQuestions:0,petName:'light',romance:'do-not-escalate'}},relationship:friction});
const repair = rel.analyse('Sorry, meri galti thi', 'statement', []);
const p2 = delivery.profile({behaviour:{selectedBehaviour:'repair',behaviourQuestions:0,behaviourGuardrails:{maxQuestions:0,petName:'light',romance:'do-not-escalate'}},relationship:repair});
const reconnect = rel.analyse('Miss kar rahi hoon', 'romantic', []);
const p3 = delivery.profile({behaviour:{selectedBehaviour:'approach',behaviourQuestions:1,behaviourGuardrails:{maxQuestions:1,petName:'contextual',romance:'allowed'}},relationship:reconnect});
ok('repair stage exists', friction.repair.stage === 'friction');
ok('repair attempt detected', repair.repair.stage === 'repair-attempt');
ok('reconnection detected', reconnect.distance.posture === 'reconnecting');
ok('reconnection warmer than friction', p3.warmth > p1.warmth);
ok('reconnection less restrained than friction', p3.restraint < p1.restraint);

// Accumulated state should alter delivery expression without changing the selected behaviour.
const sameBehaviourWarm = delivery.profile({behaviour:{selectedBehaviour:'approach',behaviourQuestions:1,behaviourGuardrails:{}},relationship:{mode:'approach',signals:{affection:.9,proximity:.8,playful:.3},confidence:.9, distance:{distance:.05,reconnection:.8}}});
const sameBehaviourTense = delivery.profile({behaviour:{selectedBehaviour:'approach',behaviourQuestions:1,behaviourGuardrails:{}},relationship:{mode:'approach',signals:{tension:.7,vulnerable:.5},confidence:.9, distance:{distance:.8,reconnection:.05}}});
ok('same behaviour adapts warmth', sameBehaviourWarm.warmth > sameBehaviourTense.warmth);
ok('same behaviour adapts romance', sameBehaviourWarm.romance > sameBehaviourTense.romance);
ok('same behaviour adapts restraint', sameBehaviourWarm.restraint < sameBehaviourTense.restraint);

console.log(`V33.6 Human Journey QA: ${passed} checks passed`);
for (const line of checks) console.log(line);
