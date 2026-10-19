Selected voice recordings live in src/assets/audio/ and are emitted with content hashes by Vite.

Portfolio voice samples — generated 2026-10-19

Current player: US English and Australian English. Each is a fictional 16-turn studio enquiry, with a beginner question, availability adjustment, name collection, consent for a confirmation text, practical visit question, and booking recap. No real appointment is made.

Generation service: Microsoft Edge neural text-to-speech.
Generation-only client: edge-tts 7.3.1 (Python 3.12).
https://github.com/rany2/edge-tts
Regional voice documentation: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts

Fixed provider voice per role throughout each recording, rather than generating a new voice from a description on every turn. Rate +0%, pitch +0Hz, volume +0%. No voice cloning or reference recordings. All scripts are original fictional dialogue in src/data/voiceSamples.js.

Processing: source mono 24 kHz. Only leading/trailing padding removed with 60 ms / 100 ms safety margins. RMS threshold max(0.0015, peak 10 ms RMS * 0.018). Native tempo and pitch retained. Speaker gain targets active-sample RMS 0.15, capped at 1.5x and peak 0.91; active samples above absolute 0.006. 4 ms fades at boundaries prevent clicks. Gaps after receptionist 280 ms / customer 340 ms. Exported mono AAC 44.1 kHz at 96 kbps. No artificial laughter, breathing, music, or telephone filtering.

voice-us-professional-v7.m4a
Receptionist: en-US-EmmaNeural
Customer: en-US-AndrewNeural
Duration before AAC encoding: 79.24 seconds.
Bytes: 914757
SHA-256: 5701b9bf2c1d32de1bdbac9fd063e0d7fe97e88f81729f2e9f67133b7116d42d

voice-au-professional-v7.m4a
Receptionist: en-AU-WilliamMultilingualNeural
Customer: en-AU-NatashaNeural
Duration before AAC encoding: 94.65 seconds.
Bytes: 1093520
SHA-256: 9bfd3030ff4faa0413357af86c84b102ca310ad2580ca4c28376cc8912c5f703

Transcripts contain exactly the synthesis scripts. These are synthetic voices, not human recordings, client calls, Alex recordings, or live availability. The spoken name and business are fictional. Visitors need no provider account or speech service; recordings are static site assets. Browser checks verify decoding, playback, seeking, switching, failure recovery, transcript language, and responsive layout. Such checks do not establish subjective human naturalness. Temporary generation environments, intermediate audio, and check outputs are removed after verification.

The following notes apply only to the original dungeon files:

Audio placeholders for the dungeon crawler.

These are intentionally empty 0-byte files so the build works out of the box.
Replace each with a real asset of the same name to enable sound:

Music (looping where noted):
- dungeon_ambient.mp3  (loops, default dungeon music)
- boss_battle.mp3      (loops, plays in Boss Room)
- victory.mp3          (win screen)

SFX:
- footstep.wav, sword_swing.wav, hit.wav, enemy_death.wav, chest_open.wav, door_enter.wav

AudioManager wraps every Howler call in try/catch, so missing or empty files
never crash the game — they simply produce no sound.
