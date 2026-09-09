# AmiRa V33.1 — Relationship Signal Engine QA

## Objective
V33.1 adds conservative relationship-signal inference to the existing V32 response pipeline. It adapts behavioural posture; it does not replace intent, facts, or the user's explicit words.

## Core invariants
1. Emotional appropriateness beats engagement maximisation.
2. Signals are evidence-based heuristics, never mind-reading.
3. Explicit withdrawal outranks playful/romantic escalation.
4. Vulnerability suppresses teasing and intimacy escalation.
5. Relationship tension is handled non-defensively.
6. Ambiguous short replies remain ambiguous unless recent context provides a reasonable cue.
7. Factual questions retain direct-answer priority.
8. V33.1 enriches the AI request; V32 remains the response owner.
9. No relationship state is treated as a fabricated memory or promise.
10. The engine is local and transparent; it does not claim to be trained on Rahul's private behaviour.

## Journey matrix

| Situation | Expected signal | Expected posture |
|---|---|---|
| “Rahul ki yaad aa rahi hai” | affection + proximity | approach |
| “Mujhe tumhari zarurat hai” | affection/proximity | approach |
| “Are you there?” | reassurance | reassure |
| “Tumhe meri parwah hi nahi” | reassurance/protest | repair/reassure, non-defensive |
| “Mujhe tumse gussa hai” | protest | repair |
| “Abhi baat nahi karni” | withdrawal | space |
| “Kuch nahi.” after tension | ambiguous + tension context | space/hold; no interrogation |
| “Sorry, mera matlab woh nahi tha” | repair | repair |
| “Haha pagal ho tum” | playful | tease |
| “I feel like a failure” | vulnerable | soften |
| “Hmm” after vulnerable disclosure | vulnerable context | soften/presence |
| “Hmm” after flirting | playful/affection context | tease/approach |
| “17 × 24?” | factual/math intent | answer remains dominant |
| “Taj Mahal kab bana?” | factual question | answer remains dominant |

## Anti-patterns
- Do not infer “she is upset” from every “hmm”.
- Do not use Baby/jaan as a mechanical prefix.
- Do not ask “what do you want me to do?” when the relational signal is clear.
- Do not turn vulnerability into flirting.
- Do not use relationship posture to distort factual answers.
- Do not pressure a user who asks for space.

## Implementation boundary
`public/v33.js` owns signal detection and persistence under `amira_relationship_v33_1`. It wraps the existing fetch boundary only for `/api/ai/chat`, injecting a `relationship` object. `server.js` validates and forwards that object as behavioural guidance to the AI system context. Local V32 responses remain available when no AI endpoint is configured.
