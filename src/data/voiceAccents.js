// Accent gallery for the voice demo.
//
// Every recording is a fictional conversation generated with ElevenLabs
// (Eleven v4, multi-speaker Text to Speech, Starter plan commercial license)
// on 2026-11-06. Voices and scripts are documented in
// docs/voice-gallery-plan.md. Transcripts below are the exact text that was
// submitted for generation.
//
// `peaks` come from scripts/build-voice-peaks.mjs, which measures the actual
// audio, so the waveform is not decorative. Re-run it when a file changes.
import american from '../assets/audio/accents/american-english.mp3'
import british from '../assets/audio/accents/british-english.mp3'
import australian from '../assets/audio/accents/australian-english.mp3'
import filipino from '../assets/audio/accents/filipino-english.mp3'
import canadian from '../assets/audio/accents/canadian-english.mp3'
import irish from '../assets/audio/accents/irish-english.mp3'
import indian from '../assets/audio/accents/indian-english.mp3'
import southAfrican from '../assets/audio/accents/south-african-english.mp3'
import voicePeaks from './voicePeaks.json'

const peaksFor = (file) => voicePeaks[`accents/${file}`] ?? { duration: null, peaks: [] }
const v = (text) => ({ role: 'visitor', text })
const a = (text) => ({ role: 'assistant', text })

const accents = [
  {
    id: 'us',
    name: 'American English',
    code: 'US',
    description: 'A business owner asks about automating customer inquiries.',
    voice: 'Sarah (assistant) with Chris',
    file: 'american-english.mp3',
    src: american,
    lang: 'en-US',
    turns: [
      v('Hey, quick question. Do you help businesses automate their customer inquiries?'),
      a('Yeah, absolutely. Are you thinking website messages, phone calls, or both?'),
      v('Probably both. We get a lot of the same questions every day.'),
      a("Got it. We'd set up an assistant that answers the common ones, takes down the customer's details, and sends everything straight to your CRM. Anything tricky goes to your team."),
      v('Okay, that sounds like exactly what we need.'),
    ],
  },
  {
    id: 'gb',
    name: 'British English',
    code: 'UK',
    description: 'A visitor schedules a consultation about a booking app.',
    voice: 'Alice (assistant) with Will',
    file: 'british-english.mp3',
    src: british,
    lang: 'en-GB',
    turns: [
      v("Hi, I'd like to book a call to talk about a new booking app."),
      a('Lovely, happy to help. Would mornings or afternoons suit you better?'),
      v('Afternoons, ideally. Is Thursday any good?'),
      a("Thursday at two works. It's a thirty-minute video call, and I'll send the link to your email now. Anything you'd like us to look at beforehand?"),
      v('Just a rough idea of cost, really.'),
      a("Perfect, I'll make a note of that."),
    ],
  },
  {
    id: 'au',
    name: 'Australian English',
    code: 'AU',
    description: 'A clinic asks what a voice assistant costs.',
    voice: 'Charlie (assistant) with Jessica',
    file: 'australian-english.mp3',
    src: australian,
    lang: 'en-AU',
    turns: [
      v("G'day. Roughly how much does a voice assistant for a small clinic cost?"),
      a("Good question. It depends on call volume and what it needs to connect to. For most small clinics it's a one-off setup fee, then a monthly amount for the calls it handles."),
      v('Is there a minimum contract?'),
      a("No lock-in. If it isn't saving you time after the first month, you can stop."),
    ],
  },
  {
    id: 'ph',
    name: 'Filipino English',
    code: 'PH',
    description: 'A customer follows up on an unanswered order message.',
    voice: 'Joel (assistant) with Roger',
    file: 'filipino-english.mp3',
    src: filipino,
    lang: 'en-PH',
    turns: [
      v('Hello, I sent a message last night about my order but nobody replied.'),
      a('Sorry about that, and thanks for following up. Can I get your order number so I can check it for you?'),
      v("It's four-five-two-one."),
      a("Thank you. I can see it's packed and will be picked up by the courier this afternoon. I'll text you the tracking link as soon as it's out."),
      v('Great, salamat.'),
    ],
  },
  {
    id: 'ca',
    name: 'Canadian English',
    code: 'CA',
    description: 'A website visitor asks whether mobile apps are offered.',
    voice: 'Sarah – Canadian (assistant) with River',
    file: 'canadian-english.mp3',
    src: canadian,
    lang: 'en-CA',
    turns: [
      v("Hi, I'm on your site but I can't find whether you build mobile apps."),
      a('We do, yes. Mostly cross-platform apps for iPhone and Android, built alongside a web dashboard.'),
      v('Could you show me an example?'),
      a("Sure. There's a project section just below. I can also send a couple of case studies to your inbox if that's easier."),
      v('Email would be great, thanks.'),
    ],
  },
  {
    id: 'ie',
    name: 'Irish English',
    code: 'IE',
    description: 'A gym owner asks what an automation would actually do.',
    voice: 'Sineád (assistant) with Eric',
    file: 'irish-english.mp3',
    src: irish,
    lang: 'en-IE',
    turns: [
      v('So what would an automation actually do for a small gym like ours?'),
      a('Good question. Say someone fills in your website form at eleven at night. Straight away they get a friendly text, a link to book a free session, and a reminder the day before.'),
      v("And if they don't show up?"),
      a("Then it sends a gentle follow-up to rebook, and lets your staff know. Nobody has to chase it by hand."),
    ],
  },
  {
    id: 'in',
    name: 'Indian English',
    code: 'IN',
    description: 'The assistant follows up on a demo request and books it.',
    voice: 'Navya Kannan (assistant) with Laura',
    file: 'indian-english.mp3',
    src: indian,
    lang: 'en-IN',
    turns: [
      a('Hi, this is a quick follow-up on the demo you requested yesterday. Is now a good time?'),
      v('Yes, go ahead.'),
      a('Thanks. We have Tuesday at eleven or Wednesday at four available. Which would you prefer?'),
      v('Wednesday at four works.'),
      a("Done. You're booked for Wednesday at four, and a calendar invite is on its way. Looking forward to it."),
    ],
  },
  {
    id: 'za',
    name: 'South African English',
    code: 'ZA',
    description: 'A team asks whether the system connects to their CRM.',
    voice: 'Travis (assistant) with Matilda',
    file: 'south-african-english.mp3',
    src: southAfrican,
    lang: 'en-ZA',
    turns: [
      v('Can your system connect to the CRM we already use?'),
      a('Most likely, yes. If your CRM has an API or supports webhooks, we can connect to it directly. Which one do you use?'),
      v('HubSpot.'),
      a("Then that's straightforward. New contacts and call notes sync automatically, and we'd test it with a few sample records before anything goes live."),
    ],
  },
]

export const voiceAccents = accents
  .map((accent) => ({ ...accent, ...peaksFor(accent.file) }))
  .filter((accent) => accent.src && accent.turns.length > 0)

// Accents still being prepared. Empty now that all eight have recordings.
export const upcomingAccents = []
