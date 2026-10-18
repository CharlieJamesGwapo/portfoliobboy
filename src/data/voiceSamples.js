// Scripted synthetic conversations; no real people, client calls or reference recordings.
import usAudio from '../assets/audio/voice-us-natural-v6.m4a'
import auAudio from '../assets/audio/voice-au-natural-v6.m4a'

export const voiceSamples = [
  {
    "id": "us",
    "title": "US English",
    "lang": "en-US",
    "region": "US",
    "description": "A US receptionist helps a caller book a studio visit.",
    "dialogue": [
      {
        "speaker": "Receptionist",
        "text": "Hi, thanks for calling. Emma speaking. How can I help?"
      },
      {
        "speaker": "Customer",
        "text": "Hi, I'm thinking about joining. Could I come in and have a look around?"
      },
      {
        "speaker": "Receptionist",
        "text": "Absolutely. I've got Thursday at ten thirty, or Friday afternoon. What works better for you?"
      },
      {
        "speaker": "Customer",
        "text": "Thursday at ten thirty sounds good."
      },
      {
        "speaker": "Receptionist",
        "text": "Thursday it is. I'll send you the details, and we'll see you then."
      },
      {
        "speaker": "Customer",
        "text": "Perfect, thanks so much."
      }
    ],
    "src": usAudio
  },
  {
    "id": "au",
    "title": "Australian English",
    "lang": "en-AU",
    "region": "AU",
    "description": "An Australian receptionist helps a caller book a studio visit.",
    "dialogue": [
      {
        "speaker": "Receptionist",
        "text": "Hi, you've reached the studio. Emma speaking. How can I help?"
      },
      {
        "speaker": "Customer",
        "text": "Hi, I was hoping to pop in for a look around before I sign up. Is that alright?"
      },
      {
        "speaker": "Receptionist",
        "text": "Yeah, of course. We've got Thursday at half past ten, or Friday arvo. Which suits you?"
      },
      {
        "speaker": "Customer",
        "text": "Thursday at half past ten would be great."
      },
      {
        "speaker": "Receptionist",
        "text": "Lovely, you're booked in for Thursday. I'll send you the details. See you then."
      },
      {
        "speaker": "Customer",
        "text": "Thanks for your help. See you Thursday."
      }
    ],
    "src": auAudio
  }
]
