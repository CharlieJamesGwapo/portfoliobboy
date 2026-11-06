# Multilingual conversations: recording plan and credit estimate

Status: **awaiting approval. No audio generated, no credits spent.**
The UI ships in a labelled preview state ("Recording soon" / "Planned") that
shows each script and plays nothing.

## Account (checked 2026-11-06 in the ElevenLabs dashboard)

- Plan: Starter, commercial license for speech included.
- Credits: **3,950 used of 40,000 (36,050 remaining)**; renews December 1.
- My Voices: only the 21 built-in voices; all 10 custom voice slots are free.

## Model

**Eleven v4**, multi-speaker dialogue in one generation, default settings
(stability 50, similarity 75), MP3 44.1 kHz 128 kbps. That matches the eight
accent recordings, so the studio sounds consistent.

Language support (ElevenLabs model docs, checked 2026-11-06):

- Eleven v4 supports 90+ languages, including **Spanish (`es`)** and
  **Filipino (`fil`)**, and "maintains consistent voice quality across
  language switches". There is no separate accent control: the accent comes
  from the voice, so the voices below are chosen for it.
- Limit: 10,000 characters per request (these scripts are under 500).

Billing: **1 credit per character**. The pricing page does not list a v4
rate, so this comes from our own measurement: the eight accent scripts were
2,842 characters and consumed exactly 2,842 credits (1,108 → 3,950).

## 1. Mexican Spanish (priority 1)

| Role | Voice (Voice Library) | Why |
| --- | --- | --- |
| AI receptionist ("Sofía") | **Emily – Soft, Welcoming and Upbeat** (Spanish · Mexican · Conversational, 9.5K uses) | Warm front-desk tone with a Mexican accent; also tagged for English, so she can open the call in English |
| Caller | **Ernesto – Mexican-American Accent** (English primary with natural Spanish pronunciation, 5.7K uses) | One believable bilingual speaker: American English that switches naturally into Spanish |

Alternates if a voice is unavailable: receptionist Ale Rodriguez – Natural
Mexican; caller Pablo – Energetic Mexican Spanish.

Script (exactly as submitted, 455 characters, about 29–31 s):

```
Sofía:  Northgate Family Clinic, this is Sofía. How can I help you?
Caller: Hi, I need to book a checkup for my mom. Actually, ¿le puedo hablar en español?
Sofía:  ¡Claro que sí! ¿Para qué día sería la cita?
Caller: ¿Tienen algo este jueves en la tarde?
Sofía:  Sí, el jueves a las cuatro y media con la doctora Ramírez. ¿Se la aparto?
Caller: Sí, porfa. Se llama Rosa Hernández.
Sofía:  Listo, quedó para el jueves a las cuatro y media. Le mando la confirmación por mensaje. ¡Que tenga buen día!
Caller: ¡Gracias, igualmente!
```

Mexican usage on purpose: "en la tarde", "porfa", "¿Se la aparto?",
"Listo, quedó para…", "Le mando la confirmación por mensaje".

**Estimate: 455 credits** for one generation. Requested cap: **910 credits**
(one retake if a line is mispronounced). Balance after the worst case: 35,140.

## 2. Filipino / Taglish (priority 2, not to be generated until approved)

| Role | Voice | Why |
| --- | --- | --- |
| AI receptionist ("Bea") | **Maria – Soothing, Gentle, and Clear** (Filipino, customer service / conversational AI, 19.2K uses) | Polite, clear front-desk delivery |
| Caller | **Rezz – Calm & Friendly** ("natural Taglish speaking style") | Switches between English and Tagalog naturally |

Alternates: receptionist Camille – Warm & Conversational; caller Arcel –
Casual Filipino Tech Vlogger (described as effortless Taglish).

Script (477 characters, about 30 s):

```
Bea:    Good afternoon, Lumina Dental Clinic, this is Bea. How can I help you?
Caller: Hi, I'd like to book a cleaning. Pero pwede mag-Tagalog na lang? Mas sanay kasi ako.
Bea:    Sige po, walang problema! Kailan n'yo po gustong magpa-schedule?
Caller: May available ba kayo this Saturday? Mas okay sana kung umaga.
Bea:    Meron po. Saturday, ten a.m., kay Dr. Santos. I-book ko na po ba?
Caller: Yes, please. Miguel Reyes po.
Bea:    Okay po, Miguel Reyes, Saturday ng ten a.m. Magte-text po kami ng confirmation. Salamat po!
Caller: Salamat din!
```

**Estimate: 477 credits**; cap 954 with one retake.

## After a recording is approved and generated

1. Save the MP3 as `src/assets/audio/conversations/<id>.mp3`
   (`es-mx.mp3`, `fil-taglish.mp3`).
2. In `src/data/voiceConversations.js`, import it, set `file`, `src`, and
   `status: 'ready'`.
3. Re-run `node scripts/build-voice-peaks.mjs` (it picks up every MP3 under
   `src/assets/audio`) so the waveform reflects the real audio.
4. Do a human listening pass: pronunciation, the language switch, and that
   the take matches the script word for word.

All business and person names in the scripts are fictional.
