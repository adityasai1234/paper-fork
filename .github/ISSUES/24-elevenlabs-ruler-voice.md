# ElevenLabs — Ruler speaks final verdict

Only the Ruler agent speaks to the user. ElevenLabs TTS narrates the Ruler brief after all workers report.

## Acceptance criteria

- [x] `generateVoiceBrief.ts` uses `rulerBriefScript()` from agent-hierarchy
- [x] Logs `ruler_brief` session event with script text
- [x] VoicePlayer labeled "Ruler verdict (ElevenLabs)"
- [ ] Telegram receives Ruler voice reply on audit complete
- [ ] Live demo: mentor hears Ruler brief on stage

## Env

```
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
```

## Labels

`buildathon`, `layer-hierarchy`, `partner-elevenlabs`
