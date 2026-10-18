Selected voice recordings live in src/assets/audio/ and are emitted with content hashes by Vite.

Portfolio voice samples — generated 2026-10-19

Current player: US English and Australian English only. Both are complete six-turn illustrative studio visit booking conversations.

Model: Qwen3-TTS-12Hz-1.7B-VoiceDesign, local MLX 4-bit conversion (Apache 2.0).
https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign
https://huggingface.co/mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit
Pinned revision: 5c390979e4b93af5f2932f90742ca99c7dd04687
Runtime: MLX Audio 0.5.9, MLX 0.32.4, Python 3.12 on Apple Silicon.

model.safetensors SHA-256: d8627de7ef411f6775182925059e140a9e1edb1fde8feeb540b4fba0edee1e58
speech_tokenizer/model.safetensors SHA-256: 836b7b357f5ea43e889936a3709af68dfe3751881acefe4ecf0dbd30ba571258

Generation: voice design from text descriptions only, without reference audio or voice cloning. Temperature 0.75, top-p 0.95, top-k 50, repetition penalty 1.05, maximum 500 speech tokens per complete turn. Fixed seeds per role: US receptionist 310 / customer 311; AU receptionist 410 / customer 411. Each turn is generated separately with the same regional role direction and seed. This encourages similar voices but does not guarantee speaker identity across turns.

Native speech tempo retained. Only model padding trimmed, with 80 ms leading / 160 ms trailing margin. Inter-turn gaps 300 / 240 / 360 / 240 / 320 ms, ending silence 180 ms. Active-speech RMS gently balanced toward 0.16 with gain capped at 2 and sample peak capped at 0.92. Mono AAC, 44.1 kHz, 128 kbps. No forced laughter, added breath effects, music, or telephone filters.

US receptionist direction: A woman in her early thirties with a clear, authentic General American accent. Warm, approachable receptionist, medium pitch, lightly textured and relaxed. Speak to one caller in a friendly everyday conversation, with natural connected speech, gentle changes in intonation and unhurried but efficient pacing. Sound attentive and spontaneous, never like a commercial announcer or reading a script. Clean close-microphone speech, no music.
US customer direction: A man in his thirties with a clear, authentic General American accent, a warm low-mid pitch and easygoing conversational tone. He is a friendly customer asking a receptionist a simple question. Natural connected speech, comfortable everyday pace, subtle expressive intonation. Speak casually and sincerely, never like an announcer. Clean close-microphone speech, no music.

voice-us-natural-v6.m4a: SHA-256 16f466622f42845ee5632a1740c94b2449fd9dfc30bfdf7e1065721a475a90cf
Duration before AAC encoding: 24.83 seconds.

AU receptionist direction: A woman in her early thirties speaking with an authentic contemporary Australian English accent, from Melbourne. Warm and approachable receptionist, medium pitch with a lightly textured relaxed voice. Natural Australian vowels and intonation, subtle rather than exaggerated. Talk to one caller in an easy everyday conversation with connected speech and friendly, attentive inflection. Comfortable efficient pace, never an advertisement or theatrical performance. Clean close-microphone speech, no music.
AU customer direction: A man in his thirties speaking with an authentic contemporary Australian English accent, from Melbourne. Friendly low-mid pitched voice with a relaxed, easygoing conversational tone. Natural Australian vowels and intonation, subtle rather than exaggerated. He is a customer arranging a studio visit, speaking casually and sincerely to one receptionist. Connected speech, comfortable everyday pace, never an announcer. Clean close-microphone speech, no music.

voice-au-natural-v6.m4a: SHA-256 5c4fbf87ae8b2c0f7594644a410c70692d9a07c2dcc89dd685bf688547d8080f
Duration before AAC encoding: 28.91 seconds.

Transcripts in src/data/voiceSamples.js are the exact synthesis scripts. These are scripted synthetic voices, not human recordings, real calls, Alex recordings, or live availability. Visitors need no provider account or generation service. Browser checks verify playback, seeking, switching and recovery; speech recognition checks wording. Accent and naturalness still require human listening feedback. Temporary models, intermediate WAV files, generation environment, and check outputs are removed after verification.

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
