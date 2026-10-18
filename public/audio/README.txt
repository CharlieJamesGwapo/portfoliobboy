Portfolio voice samples

Current player: US English and Australian English only.

- voice-us-chatterbox-v5.m4a — freshly generated with Chatterbox Turbo, conditioned on synthetic US receptionist/customer references from the prior Kokoro conversation (Heart/Bella and Michael/Fenrir voice blends).
- voice-au-chatterbox-v5.m4a — freshly generated with Chatterbox Turbo, conditioned on synthetic Australian receptionist/customer references from the prior Qwen3-TTS conversation. These are new model generations, not the earlier Qwen recording with speed changes.

Provider/model: Resemble AI, Chatterbox Turbo (MIT licence).
https://huggingface.co/ResembleAI/chatterbox-turbo
https://github.com/resemble-ai/chatterbox
Local conversion: mlx-community/chatterbox-turbo-4bit (Apache 2.0 model-card licence), run using MLX Audio 0.5.9 on Apple Silicon.
https://huggingface.co/mlx-community/chatterbox-turbo-4bit

Model SHA-256: 59603c7f62272b72d4b1d7870e0bf546b5f88561a367daf6fd6282da997a54a4
S3TokenizerV2 SHA-256: 928726bc1f206a613d36b8f49e297eae9c5593a21bf9b92ddfe2c23f85eb92cc
Both checkpoint checksums were verified against the publishers' Hugging Face LFS records before generation.

Generation: temperature 0.8, top-p 0.95, repetition penalty 1.2, top-k 1000, max 500 speech tokens, full turns generated without sentence splitting. MLX seeds 101 / 102 for US receptionist/customer and 201 / 202 for AU receptionist/customer. Short customer references repeated only within the conditioning file to meet Chatterbox's minimum reference length; no real people's voices were copied. Native speech tempo retained. Model padding trimmed with 80 ms leading / 160 ms trailing margin, turn gaps 340 / 400 ms, ending silence 180 ms. Peak normalized to 0.9. Mono AAC, 44.1 kHz, 128 kbps. No forced laugh tags, added breaths, music, or phone effects.

Transcripts in src/data/voiceSamples.js match the synthesis scripts. These are scripted synthetic voices, not human recordings, real calls, Alex recordings, or live availability. Visitors load only local audio files. No speech provider account, paid API, generation model, or generation service is needed for visitor playback. Older English recordings remain unused by the player; Filipino samples were removed. Listening review is required for subjective accent and naturalness assessment.

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
