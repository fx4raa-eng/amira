# AmiRa V13 Product & UX Research Blueprint

## Product thesis
AmiRa should feel like Rahul's presence for Amita, not a romantic content catalogue. The interface should behave like a private place: it notices mood, offers the right kind of company, remembers lightweight preferences locally, and keeps discovery varied without pretending to know memories that were never lived.

## Research-backed principles
- Full-length music should use HTMLMediaElement/audio and explicit user controls; browsers can block script-initiated autoplay, so the UI must reflect the real play promise and handle rejection states.
- Accessibility is part of interaction quality: keyboard access, visible focus, clear labels, and focus not obscured by sticky UI should be treated as baseline requirements.
- Anthropomorphic companionship can increase engagement but can also create unhealthy dependency patterns; AmiRa should reinforce Rahul/Amita's real relationship rather than position itself as an autonomous replacement for Rahul.

## Content architecture
Home / Rahul; Mann; Pyaar; Masti; Close; Raat; Yaadein; Kal; Dhun; Mere liye.

## Human-touch loop
Every major interaction uses recognition → Rahul-like presence → next choice. Responses should rotate instead of repeating on consecutive visits. User notes remain local unless backend sync is deliberately added.

## Hinglish voice
Use normal Indian chat language: Hindi sentence structure with everyday English words such as mood, feel, call, message, comfort, cute, serious, chill, close, goodnight, miss, future and surprise. Avoid literary Hindi and avoid making every line poetic.

## Intimacy boundary
Mature romance can be warm, flirty, sensual and suggestive. It should not become graphic sexual instruction or explicit sexual content. The interaction should emphasize closeness, consent, pacing, privacy and emotional connection.

## Release quality gate
Validate JS syntax; verify every data-action, data-nav, data-audio and data-mood handler; verify modal close/Escape; verify visible focus; verify sticky navigation does not obscure focused controls; verify audio play rejection; verify narrow mobile layout; keep all frontend files and references synchronized.
