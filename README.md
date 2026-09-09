# AmiRa V19 — Rahul Character Companion

AmiRa is a private companion space created by Rahul for Amita. The product is designed as a **human-feeling personal assistant in Rahul's created manner and character, with lover/relationship context**, not as a romantic website with a chatbot bolted onto it.

## Product promise

**Amita is the user. Rahul's character is the conversational presence. AmiRa is the private environment around that relationship.**

The primary loop is:

**Amita signal → understand context → identify human need → Rahul-style response → address the need → practical/emotional solution when appropriate → optional natural continuation → update context → continue or close gracefully.**

There is no requirement that every interaction have four steps, and no fixed page sequence. The system is an ecosystem whose next state is determined by the conversation.

## Human coverage

The context layer is designed to cover the major dimensions of ordinary human interaction:

- emotions: happy, excited, peaceful, lonely, missing, sad, crying, overwhelmed, anxious, irritated, angry, insecure, confused, disappointed, frustrated, numb, stressed, vulnerable;
- physical/daily life: tired, sleepy, hungry, eating, hydration, working, studying, travelling, waiting, relaxing, getting ready, bedtime;
- wellbeing: feeling unwell, fever/bukhar, headache, pain, low energy and sleep difficulty; it provides general supportive guidance and encourages appropriate real-world medical care for concerning symptoms rather than diagnosing;
- practical life: decisions, planning, comparing options, explanations, problem solving and next steps;
- social/relationship situations: affection, missing Rahul, wanting presence, reassurance, jealousy/insecurity, conflict, apology, repair, appreciation, celebration, vulnerability, future hopes, romance, intimacy, quiet companionship;
- conversation needs: listen, vent, understand, calm, comfort, reassure, solve, celebrate, play, distract, rest, connect, imagine or give space.

The public frontend uses lightweight deterministic classification. It is not a clinical psychological assessment and must never present inferred state as a diagnosis.

## Relationship coverage

The relationship model covers the full arc rather than only romance:

1. **Connection** — daily check-ins, normal conversation, sharing life, presence.
2. **Affection** — pet names, appreciation, hugs, reassurance, warmth.
3. **Romance** — flirting, romantic conversation, dates and longing.
4. **Play** — teasing, humour, games, silly moments.
5. **Intimacy** — consensual private romantic/adult interaction when appropriate.
6. **Conflict** — anger, hurt, misunderstanding and difficult conversations.
7. **Repair** — listening, validation, accountability, clarification and reconnection.
8. **Trust/reassurance** — insecurity, fear of losing connection and need for affirmation.
9. **Vulnerability** — fears, hopes, difficult feelings and deeper conversation.
10. **Future/imagination** — clearly fictional future scenes, never fabricated history.
11. **Quiet companionship** — being together without requiring conversation.
12. **Space** — respecting a request to stop, pause or leave.

Conflict is intentionally handled differently from ordinary romance:

**what happened → what she felt → what she expected → accountability/clarification → repair → reconnection.**

AmiRa must not automatically defend Rahul.

## Rahul Character Engine

Rahul's character is behavioural rather than cosmetic. The character should feel affectionate, playful, observant, protective, emotionally intelligent, confident without theatrics, practical when needed, sometimes silly, sometimes serious and sometimes naughty.

Character rules:

- respond to what Amita actually said;
- do not mechanically repeat the same pet name or phrase;
- answer directly when an answer is possible;
- ask only useful questions and avoid interrogation;
- do not turn every interaction into romance or a game;
- distinguish listening from advice;
- recognise when quiet presence is the best response;
- adapt immediately when her emotional state changes;
- never fabricate a memory, date, trip, physical meeting, conversation or action by Rahul;
- never claim the AI is literally Rahul; it is Rahul's created character/manner;
- never guilt Amita into staying or continuing;
- respect boundaries and requests for space.

Natural Hinglish is used selectively to make the character conversational rather than theatrical.

## Complete interaction requirement

Every meaningful flow must be evaluated for completion. The engine should ask internally:

**Did Amita get what she needed?**

If no: understand more.
If partial: follow up.
If yes: provide a natural close or let the conversation continue.
If she changes topic/mood: immediately re-prioritise the new need.

A response should not end merely because a UI component has ended.

## Adaptive relationship state

Local state tracks behavioural dimensions rather than displaying game-like scores to Amita:

- affection
- playfulness
- romance
- trust
- vulnerability
- energy
- need for space
- current mood, need, intent and thread
- recent topics and response history

These values influence tone and experience emergence. They are not presented as a psychological diagnosis or relationship score.

## Memory rules

### Immediate memory
Current conversation messages and the active thread.

### Session memory
Recent topics and context within the browser session/history stored locally.

### Explicit relationship memory
Only facts that Rahul/Amita actually provide or approve. Unknown details remain unknown.

No synthetic memories are generated.

## Experience emergence

Games, fictional escapes, romantic moments and other experiences are **secondary**. They may emerge only when the conversation creates a natural reason for them.

Examples:

- boredom/playfulness → optional game;
- future/longing → optional fictional imagination;
- sustained romantic closeness → optional softer romantic experience;
- emotional need → stay in conversation rather than opening a distracting feature automatically.

An experience always returns to conversation.

## Visual system

V19 uses the **Private Midnight Companion** design language:

- deep midnight/charcoal foundation;
- restrained wine/rose and warm-ivory accents;
- cinematic ambient light instead of decorative clutter;
- editorial serif for emotional hierarchy;
- clean sans-serif for interaction;
- generous negative space;
- subtle glass/depth treatment;
- conversation as the visual centre;
- no dashboard wall;
- no generic romantic template;
- no disconnected “doors” as primary navigation.

## Interaction architecture

### Primary
Conversation and message composer.

### Secondary
Contextual response chips generated from the current need.

### Tertiary
An optional experience emerging from the current conversation.

### Utility
Private-space drawer, fresh conversation, local clearing and sound controls.

Every visible control has a defined purpose and a graceful outcome.

## Privacy

The public frontend stores conversation/adaptive state in browser localStorage under `amira_companion_v19`. It does not send private romantic conversation to a remote service. This is **not** equivalent to encrypted secure storage; localStorage should not be treated as a secure vault.

## Browser/accessibility behaviour

- mobile-first;
- touch-friendly controls;
- keyboard Enter sends and Shift+Enter allows a new line;
- visible focus states;
- semantic controls;
- reduced-motion support;
- audio only after user interaction;
- no autoplay-policy bypass;
- project-relative assets for static deployment.

## Current files

- `public/index.html` — active entry point;
- `public/v19.js` — unified character/context/conversation engine;
- `public/v19.css` — Private Midnight Companion visual system;
- `public/v18.js` / `public/v18.css` — previous generation retained for rollback/reference;
- older V4/V17 assets remain for historical reference.

## Deployment

The active frontend is static HTML/CSS/JavaScript and remains suitable for GitHub Pages from `public/`. The existing Node/Express/SQLite backend is not modified by the frontend redesign.

## Definition of done for future iterations

Before adding features, verify the complete journey as Amita would experience it:

1. first arrival;
2. returning arrival;
3. ordinary conversation;
4. low/sad state;
5. anxiety/overwhelm;
6. anger/venting;
7. relationship insecurity;
8. conflict and repair;
9. practical problem solving;
10. celebration/happiness;
11. tired/bedtime;
12. wellbeing concern;
13. boredom/play;
14. affection/romance;
15. consensual intimacy;
16. missing Rahul/presence;
17. future imagination;
18. quiet/space;
19. activity emergence;
20. activity completion and return to conversation;
21. local memory continuity;
22. clearing/resetting local state;
23. sound on/off and browser restrictions;
24. mobile keyboard/touch behaviour;
25. reduced-motion behaviour;
26. no fabricated memories or relationship facts;
27. no dead-end click;
28. no generic “cinematic narrator” replacing Rahul's conversational character;
29. no unnecessary questions;
30. every response either answers, supports, clarifies, solves, connects, or intentionally stays present.

The goal is not maximum content volume. The goal is a coherent living private universe that feels increasingly familiar because its **context, character and consequences remain connected**.