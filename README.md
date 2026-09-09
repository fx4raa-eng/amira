# AmiRa V18 — Rahul Character Companion

AmiRa is a private, mobile-first companion space created by Rahul for Amita. V18 changes the product model from a collection of romantic screens into a conversation-first ecosystem: Amita talks, AmiRa understands context and need, Rahul's character responds, the response addresses the need, and only then may an optional experience emerge.

## Product identity

**AmiRa = Rahul's personal assistant manner + Rahul's character + lover + private space.**

The application should feel human and coherent without pretending that the AI is literally Rahul. It speaks in the Rahul character established by Rahul's content and preferences.

## V18 principles

1. **Conversation is the primary interface.** There is no mandatory Home → Game → Story → Result sequence.
2. **Human need before feature.** Detect what Amita may need: listening, comfort, reassurance, practical help, distraction, play, closeness, romance, rest, celebration, repair, space, or imagination.
3. **Complete interaction arc.** Signal → understand → Rahul response → address need → solution/next step → natural continuation or closure.
4. **Context persists.** Current conversation, recent topics, emotional state, relationship state and local progress influence the next response.
5. **No fake memories.** The system never invents real relationship events, conversations, meetings, travel, dates or physical memories.
6. **Imagination is explicitly imagination.** Fictional/future scenes can be created only as imagination, never as history.
7. **Rahul is not always romantic.** He can be funny, practical, caring, quiet, serious, teasing, protective, affectionate, romantic or simply present depending on context.
8. **Do not over-question.** Sometimes Rahul answers directly; sometimes he asks one useful follow-up; sometimes he simply stays.
9. **Activities emerge from conversation.** Games, fictional escapes and romantic experiences are consequences of context rather than disconnected destinations.
10. **No engagement traps.** Amita can leave at any time. The system does not use guilt, pressure or dependency mechanics.

## Human context model

V18 recognises broad conversational signals including:

- emotional: happy, excited, peaceful, lonely, missing, sad, crying, overwhelmed, anxious, irritated, angry, insecure, confused, disappointed, frustrated, numb, stressed, vulnerable;
- daily life: sleepy, tired, hungry, working, studying, travelling, waiting, bored, relaxing, getting ready, going to sleep;
- wellbeing: feeling unwell, fever/bukhar, headache, pain, low energy; the assistant provides supportive general guidance and encourages appropriate real-world medical care for concerning symptoms rather than diagnosing;
- relationship: missing Rahul, wanting presence, reassurance, affection, jealousy/insecurity, conflict, apology, repair, future hopes, closeness and intimacy;
- practical: decisions, planning, comparison, explanations, solving a problem;
- interaction: venting, normal conversation, jokes, teasing, play, quiet companionship, imagination.

Classification is deliberately local and lightweight in the public frontend. It is a deterministic context layer, not a claim of clinical or psychological diagnosis.

## Rahul character engine

The character layer controls conversational behaviour rather than simply selecting canned romantic messages. Important dimensions include affection, playfulness, romance, trust, vulnerability, energy and need for space. Responses are selected by context and recent-response avoidance.

The intended character traits are affectionate, playful, observant, slightly teasing, protective, emotionally intelligent, confident without being theatrical, sometimes naughty, sometimes serious and occasionally deliberately silly. Natural Hinglish is allowed where it fits the relationship voice.

The engine also follows behavioural rules:

- acknowledge what Amita actually said;
- do not repeat the same pet name or phrase mechanically;
- do not turn every message into a question;
- do not turn every message into a game;
- do not force romance when she needs practical help or emotional support;
- do not defend Rahul automatically during conflict;
- distinguish listening from advice;
- recognise when quiet companionship is the better answer;
- carry the current thread forward instead of resetting after every click.

## Relationship systems

The architecture is designed to cover connection, affection, romance, play, intimacy, conflict, repair, reassurance, vulnerability, daily companionship, future hopes and quiet presence.

A relationship interaction can move through:

**Need → understanding → response → validation/solution → reconnection.**

Conflict follows a different pattern when appropriate:

**What happened → what she felt → what she expected → accountability/clarification → repair → reconnection.**

## Local state

The public experience stores its conversation and adaptive state in browser localStorage under `amira_companion_v18`. The state contains recent conversation, current thread, inferred context, relationship dimensions, recent-response history, exploration and explicitly approved local memory placeholders. The public frontend does not send private romantic conversation to a remote service.

This is a browser-local experience, not a secure vault. Users should not treat localStorage as a substitute for encryption or server-side access control.

## Privacy and authenticity

The application must not fabricate Rahul's real-world actions or memories. If a factual relationship detail is not supplied or approved, it remains unknown. Future meetings, first hugs, travel and similar events remain fictional/imaginative until they actually happen.

## Visual system

V18 uses a **Private Midnight Companion** theme:

- deep charcoal/midnight base;
- restrained wine/rose and warm-ivory accents;
- cinematic ambient light and depth;
- editorial serif for emotional emphasis;
- clean sans-serif for conversation controls;
- restrained glass/blur surfaces;
- generous negative space;
- no dashboard-like card wall;
- no cliché heart/rose decoration as the primary visual language;
- conversation remains the visual centre.

## Interaction hierarchy

Primary: conversation.

Secondary: contextual suggestion chips.

Tertiary: subtle emerging experiences.

Utility: the private-space drawer and local-state controls.

The UI is intentionally not a collection of unrelated rooms. An experience may emerge, but conversation remains the place to which the user returns.

## Accessibility and browser behaviour

- mobile-first and touch-friendly;
- keyboard Enter sends a message, Shift+Enter creates a new line;
- visible focus states;
- reduced-motion support;
- semantic buttons and textarea;
- no forced audio autoplay;
- no attempt to bypass browser media policies.

## Existing application compatibility

Older V4/V17 assets remain in the repository for reference/rollback. `public/index.html` now loads `v18.css` and `v18.js` as the active public experience. The existing Node/Express/SQLite backend is not modified by this frontend redesign.

## Deployment

The frontend remains suitable for GitHub Pages because it is a static HTML/CSS/JavaScript experience and uses project-relative asset paths.
