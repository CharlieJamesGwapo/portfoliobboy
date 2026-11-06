// Multilingual receptionist conversations for the Voice Studio.
//
// Each conversation starts in American English and switches language mid-call,
// the way a real bilingual caller does. Every line is split into `parts` tagged
// with the language actually spoken, so the transcript can mark each phrase
// with the right `lang` (screen readers then pronounce it correctly).
//
// Status:
// - 'preview': script approved for recording, audio not generated yet.
// - 'planned': script drafted, waiting for approval before any recording.
// - 'ready':   audio recorded; `src` and waveform `peaks` are set.
//
// Recording plan, voices, and credit estimate: docs/multilingual-voice-plan.md.
// When a recording is approved and generated, import the mp3, set `src`,
// switch `status` to 'ready', and re-run scripts/build-voice-peaks.mjs.
import mexicanSpanish from '../assets/audio/conversations/es-mx.mp3'
import voicePeaks from './voicePeaks.json'

const peaksFor = (file) => (file ? voicePeaks[`conversations/${file}`] : null) ?? { duration: null, peaks: [] }
const en = (text) => ['en-US', text]
const es = (text) => ['es-MX', text]
const fil = (text) => ['fil', text]
const caller = (...parts) => ({ role: 'visitor', parts })
const ai = (...parts) => ({ role: 'assistant', parts })

const conversations = [
  {
    id: 'es-mx',
    name: 'Mexican Spanish',
    languages: [
      { code: 'EN', label: 'English' },
      { code: 'ES', label: 'Español (México)' },
    ],
    title: 'Booking a clinic appointment',
    description:
      'A caller starts in English, switches to Spanish to book a checkup for his mother, and the receptionist follows without missing a beat.',
    // Generated 2026-11-06: Eleven v4 dialogue, Emily (receptionist) with
    // Ernesto (caller), default settings, 455 credits. Transcript below is the
    // exact submitted text.
    status: 'ready',
    file: 'es-mx.mp3',
    src: mexicanSpanish,
    turns: [
      ai(en('Northgate Family Clinic, this is Sofía. How can I help you?')),
      caller(en('Hi, I need to book a checkup for my mom. Actually,'), es('¿le puedo hablar en español?')),
      ai(es('¡Claro que sí! ¿Para qué día sería la cita?')),
      caller(es('¿Tienen algo este jueves en la tarde?')),
      ai(es('Sí, el jueves a las cuatro y media con la doctora Ramírez. ¿Se la aparto?')),
      caller(es('Sí, porfa. Se llama Rosa Hernández.')),
      ai(es('Listo, quedó para el jueves a las cuatro y media. Le mando la confirmación por mensaje. ¡Que tenga buen día!')),
      caller(es('¡Gracias, igualmente!')),
    ],
  },
  {
    id: 'fil-taglish',
    name: 'Filipino / Taglish',
    languages: [
      { code: 'EN', label: 'English' },
      { code: 'FIL', label: 'Filipino' },
    ],
    title: 'Scheduling a dental cleaning',
    description:
      'A caller opens in English, then asks to continue in Tagalog. The receptionist answers in the relaxed Taglish most Filipino front desks actually use.',
    status: 'planned',
    file: null,
    src: null,
    turns: [
      ai(en('Good afternoon, Lumina Dental Clinic, this is Bea. How can I help you?')),
      caller(en("Hi, I'd like to book a cleaning."), fil('Pero pwede mag-Tagalog na lang? Mas sanay kasi ako.')),
      ai(fil("Sige po, walang problema! Kailan n'yo po gustong magpa-schedule?")),
      caller(fil('May available ba kayo this Saturday? Mas okay sana kung umaga.')),
      ai(fil('Meron po. Saturday, ten a.m., kay Dr. Santos. I-book ko na po ba?')),
      caller(fil('Yes, please. Miguel Reyes po.')),
      ai(fil('Okay po, Miguel Reyes, Saturday ng ten a.m. Magte-text po kami ng confirmation. Salamat po!')),
      caller(fil('Salamat din!')),
    ],
  },
]

// Exact text submitted for generation: the parts of every line, joined with a
// space. Used for the credit estimate (1 credit per character on this model).
export const scriptText = (conversation) =>
  conversation.turns.map((turn) => turn.parts.map(([, text]) => text).join(' ')).join('\n')

export const voiceConversations = conversations.map((conversation) => ({
  ...conversation,
  ...peaksFor(conversation.file),
}))
