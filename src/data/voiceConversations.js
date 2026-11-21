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
// A recording is picked up automatically: save it as
// src/assets/audio/conversations/<id>.mp3 and re-run
// scripts/build-voice-peaks.mjs. The card then becomes 'ready' with a player.
import voicePeaks from './voicePeaks.json'

const recordings = import.meta.glob('../assets/audio/conversations/*.mp3', { eager: true, import: 'default' })
const recordingFor = (id) => recordings[`../assets/audio/conversations/${id}.mp3`] ?? null
const peaksFor = (file) => (file ? voicePeaks[`conversations/${file}`] : null) ?? { duration: null, peaks: [] }
const en = (text) => ['en-US', text]
const es = (text) => ['es-MX', text]
const fil = (text) => ['fil', text]
const ja = (text) => ['ja-JP', text]
const fr = (text) => ['fr-FR', text]
const pt = (text) => ['pt-BR', text]
const hi = (text) => ['hi-IN', text]
const ar = (text) => ['ar', text]
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
    src: null,
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
    status: 'preview',
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
  // Scripts below (2026-11-21) are written for spoken realism: fillers,
  // read-backs, a "let me check" pause and short turns, the way front desks
  // actually talk. Each is set in a business Charlie has built systems for.
  {
    id: 'ja-jp',
    name: 'Japanese',
    languages: [
      { code: 'EN', label: 'English' },
      { code: 'JA', label: '日本語' },
    ],
    title: 'Extending a hotel stay',
    description:
      'A guest opens in English, switches to Japanese to add a night, and the front desk checks availability and confirms in polite keigo.',
    status: 'preview',
    file: null,
    src: null,
    turns: [
      ai(en('Thank you for calling Hotel Sakura Shinjuku, this is Yui. How may I help you?')),
      caller(en("Hi, um, I'd like to change a reservation. Actually,"), ja('日本語でも大丈夫ですか？')),
      ai(ja('はい、もちろんです。ご予約のお名前をお願いできますか？')),
      caller(ja('田中です。えっと、来週の金曜日から二泊なんですけど、もう一泊延ばせますか？')),
      ai(ja('田中様ですね。少々お待ちください。はい、日曜日の夜も空いております。同じお部屋でご用意できます。')),
      caller(ja('よかった。じゃあ、それでお願いします。')),
      ai(ja('かしこまりました。金曜日から三泊に変更いたしました。確認のメールをお送りしますね。')),
      caller(ja('ありがとうございます。助かります。')),
    ],
  },
  {
    id: 'fr-fr',
    name: 'French',
    languages: [
      { code: 'EN', label: 'English' },
      { code: 'FR', label: 'Français' },
    ],
    title: 'Reserving a table for six',
    description:
      'A diner starts in English, asks to continue in French, and the host offers a later terrace table when the first time is full.',
    status: 'preview',
    file: null,
    src: null,
    turns: [
      ai(en('Good evening, Le Petit Jardin, this is Camille. How can I help?')),
      caller(en("Hi! I'm calling about a table for Saturday. Oh, sorry,"), fr('je peux parler français ?')),
      ai(fr('Bien sûr ! Pour combien de personnes, samedi ?')),
      caller(fr('On sera six. Euh, vers vingt heures, si possible ?')),
      ai(fr("Alors, vingt heures, c'est complet. Mais j'ai une table à vingt heures trente, en terrasse. Ça vous irait ?")),
      caller(fr("Oui, parfait. C'est au nom de Laurent.")),
      ai(fr("C'est noté, monsieur Laurent : samedi, vingt heures trente, six personnes. Je vous envoie un SMS de confirmation.")),
      caller(fr('Super, merci beaucoup !')),
    ],
  },
  {
    id: 'pt-br',
    name: 'Brazilian Portuguese',
    languages: [
      { code: 'EN', label: 'English' },
      { code: 'PT', label: 'Português (Brasil)' },
    ],
    title: 'Booking a free gym trial',
    description:
      'A new member asks about early classes in English, switches to Portuguese, and leaves with a trial session booked for the next morning.',
    status: 'preview',
    file: null,
    src: null,
    turns: [
      ai(en('Hi, thanks for calling Pulse Fitness, this is Bruna. How can I help you today?')),
      caller(en('Hey, I wanted to ask about memberships. Uh,'), pt('posso falar em português?')),
      ai(pt('Claro, pode sim! Você quer saber sobre os planos?')),
      caller(pt('Isso. Eu treino mais cedo, tipo seis da manhã. Vocês abrem cedo?')),
      ai(pt('Abrimos às cinco e meia, todo dia. E a primeira aula experimental é grátis.')),
      caller(pt('Ah, que legal! Dá pra marcar pra amanhã?')),
      ai(pt('Dá sim. Amanhã, às seis, com o professor Rafael. Qual é o seu nome?')),
      caller(pt('Lucas Almeida.')),
      ai(pt('Prontinho, Lucas! Te mando a confirmação no WhatsApp. Até amanhã!')),
    ],
  },
  {
    id: 'hi-in',
    name: 'Hindi',
    languages: [
      { code: 'EN', label: 'English' },
      { code: 'HI', label: 'हिन्दी' },
    ],
    title: 'Reporting an internet outage',
    description:
      'A broadband customer reports an outage in English, continues in Hindi, and support finds the cause and gives a restore time.',
    status: 'preview',
    file: null,
    src: null,
    turns: [
      ai(en('Hello, thank you for calling SkyLink Broadband, this is Priya. How can I help you?')),
      caller(en("Hi, my internet's been down since the morning."), hi('क्या मैं हिंदी में बात कर सकता हूँ?')),
      ai(hi('जी, बिल्कुल! आपका नाम और area बता दीजिए।')),
      caller(hi('मेरा नाम राहुल शर्मा है, सेक्टर बारह से।')),
      ai(hi('धन्यवाद, राहुल जी। एक मिनट, मैं check कर रही हूँ। हाँ, आपके area में fiber का काम चल रहा है।')),
      caller(hi('अच्छा? तो कब तक ठीक होगा?')),
      ai(hi('शाम पाँच बजे तक service वापस आ जानी चाहिए। मैं आपको SMS से update भेज दूँगी।')),
      caller(hi('ठीक है, बहुत शुक्रिया!')),
    ],
  },
  {
    id: 'ar-gulf',
    name: 'Gulf Arabic',
    languages: [
      { code: 'EN', label: 'English' },
      { code: 'AR', label: 'العربية' },
    ],
    title: 'Booking an apartment viewing',
    description:
      'A buyer asks about a listing in English, switches to Gulf Arabic, and the agent books a viewing and sends the location.',
    status: 'preview',
    file: null,
    src: null,
    turns: [
      ai(en('Good morning, Palm Vista Properties, this is Layla. How can I help you?')),
      caller(en('Hi, I saw a two-bedroom apartment on your website.'), ar('ممكن نكمل بالعربي؟')),
      ai(ar('أكيد، تفضل! أي شقة شفتها بالضبط؟')),
      caller(ar('الشقة اللي في دبي مارينا، الطابق العاشر.')),
      ai(ar('إيه نعم، لسه متوفرة. تحب تحجز موعد للمعاينة؟')),
      caller(ar('إيه، يوم الأربعاء العصر إذا ممكن.')),
      ai(ar('تمام، الأربعاء الساعة أربعة العصر. ممكن اسمك الكريم؟')),
      caller(ar('خالد المنصوري.')),
      ai(ar('حياك الله يا خالد. راح أرسل لك التأكيد والموقع على الواتساب.')),
    ],
  },
]

// Exact text submitted for generation: the parts of every line, joined with a
// space. Used for the credit estimate (1 credit per character on this model).
export const scriptText = (conversation) =>
  conversation.turns.map((turn) => turn.parts.map(([, text]) => text).join(' ')).join('\n')

export const voiceConversations = conversations.map((conversation) => {
  const src = recordingFor(conversation.id)
  if (!src) return { ...conversation, status: conversation.status === 'ready' ? 'preview' : conversation.status, src: null, ...peaksFor(null) }
  const file = `${conversation.id}.mp3`
  return { ...conversation, status: 'ready', file, src, ...peaksFor(file) }
})
