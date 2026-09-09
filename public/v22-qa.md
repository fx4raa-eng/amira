# AmiRa V22 QA Gate

## Tiny-message matrix

The same tiny inputs were exercised against six contexts: emotional, romantic, playful, conflict, practical and late-night.

| Input | Emotional | Romantic | Playful | Conflict | Practical | Late-night |
|---|---|---|---|---|---|---|
| hmm | soft pause | thinking pause | thinking pause | soft pause | thinking pause | thinking pause |
| haan | preserve current need | preserve current need | preserve current need | preserve current need | preserve current need | preserve current need |
| nahi | preserve current need | preserve current need | preserve current need | preserve current need | preserve current need | preserve current need |
| acha | acknowledge | acknowledge | acknowledge | acknowledge | acknowledge | acknowledge |
| kuch nahi | guarded, no pressure | neutral | neutral | guarded, no pressure | neutral | neutral |
| bas | de-escalate | preserve | preserve | de-escalate | preserve | preserve |
| chhodo | de-escalate | drop lightly | drop lightly | de-escalate | drop lightly | drop lightly |
| sun na | attention | attention | attention | attention | attention | attention |
| yaar / uff / arey | vent invitation | vent invitation | vent invitation | vent invitation | vent invitation | vent invitation |
| fine | cautious check | cautious check | cautious check | cautious check | cautious check | cautious check |
| lol / haha | laugh | laugh | laugh | laugh without forcing | laugh | laugh |
| 😭 | comfort | comfort | laugh/play when already playful | comfort | comfort | comfort |
| 🙂 | gentle check | gentle check | gentle check | gentle check | gentle check | gentle check |

### Explicit fixes

- Addressing phrases such as `sun na Baby`, `haan jaan`, and `nahi Baby` are handled as conversational signals before generic romantic-name matching.
- `kuch nahi` no longer resets the conversation after low/conflict/overwhelmed/insecure context.
- `bas`, `chhodo`, `rehne do`, and `jaane do` use the preceding emotional state instead of always meaning `space`.
- `hmm` and `...` preserve the current need and emotional trajectory.
- `haan` / `nahi` preserve the current need instead of starting a new generic conversation.
- `fine` remains a cautious acknowledgement rather than being treated as proof that everything is fine.
- `sun na` is always an attention signal, including late-night and romantic contexts.

## Natural experience journeys

Experiences are gated by current need/mood, conversation depth, prior use and (for Midnight Scene) time of day.

| Natural conversation signal | Experience that can emerge |
|---|---|
| low / lonely / comfort-seeking | Stay Awhile |
| asking for space / quiet | Quiet Corner |
| missing / affectionate / romantic | CLOSER |
| reassurance + closeness after conversation | Why I Love You |
| sustained romantic + vulnerable conversation | Love Letter |
| closeness after multiple turns | Kiss |
| bored / playful / masti | Rahul ka Dare |
| playful back-and-forth | This or That |
| playful conversation with enough turns | Guess Rahul |
| future / `kaash tum yahan hote` / imagine | If You Were Here |
| imagination + closeness | Little Escape |
| late-night imagination + enough turns | Midnight Scene |

## Journey rule

No experience should interrupt an unresolved emotional need. The experience is offered only after the conversation has established enough context, and it returns the user to the same conversation thread.

Actual memories are never generated. Future/meeting scenes are explicitly fictional.
