// Fictional studio enquiries with synthetic regional voices; no real client calls.
import usAudio from '../assets/audio/voice-us-professional-v7.m4a'
import auAudio from '../assets/audio/voice-au-professional-v7.m4a'

export const voiceSamples = [
  {
    "id": "us",
    "src": usAudio,
    "title": "US English",
    "lang": "en-US",
    "region": "US",
    "description": "A first-time visitor asks about classes, finds an evening tour, and confirms the details.",
    "dialogue": [
      {
        "speaker": "Receptionist",
        "text": "Thanks for calling Harbor Studio. Emma speaking. How can I help you today?"
      },
      {
        "speaker": "Customer",
        "text": "Hi, I'm interested in joining, but I haven't been to a gym in a while. Could I look around first?"
      },
      {
        "speaker": "Receptionist",
        "text": "Of course. You're welcome to come in for a relaxed tour. Are you mainly interested in classes, or working out on your own?"
      },
      {
        "speaker": "Customer",
        "text": "Probably a bit of both. I'd like some guidance getting started."
      },
      {
        "speaker": "Receptionist",
        "text": "That makes sense. We can show you the equipment and talk through our beginner classes. There's no pressure to sign up on the day."
      },
      {
        "speaker": "Customer",
        "text": "That's good to hear. Do you have anything this week?"
      },
      {
        "speaker": "Receptionist",
        "text": "Let me check. I have Thursday at ten thirty in the morning, or Friday at four. Would either of those work?"
      },
      {
        "speaker": "Customer",
        "text": "I'm working until five. Is there anything a little later on Friday?"
      },
      {
        "speaker": "Receptionist",
        "text": "Yes, we can do five thirty. The tour takes about fifteen minutes. Can I take your name?"
      },
      {
        "speaker": "Customer",
        "text": "Sure, it's Jordan Taylor. Five thirty would be great."
      },
      {
        "speaker": "Receptionist",
        "text": "Thanks, Jordan. Is the number you're calling from the best one for a confirmation text with directions?"
      },
      {
        "speaker": "Customer",
        "text": "Yes, that's fine. Do I need to bring anything?"
      },
      {
        "speaker": "Receptionist",
        "text": "Just yourself and any questions. That's Friday at five thirty, for a fifteen-minute tour. Check in at reception when you arrive."
      },
      {
        "speaker": "Customer",
        "text": "Perfect. Thanks for making it easy."
      },
      {
        "speaker": "Receptionist",
        "text": "You're very welcome, Jordan. We look forward to meeting you. Have a great afternoon."
      },
      {
        "speaker": "Customer",
        "text": "You too. See you Friday."
      }
    ]
  },
  {
    "id": "au",
    "src": auAudio,
    "title": "Australian English",
    "lang": "en-AU",
    "region": "AU",
    "description": "A new member enquiry with beginner guidance, an after-work visit, and a clear booking recap.",
    "dialogue": [
      {
        "speaker": "Receptionist",
        "text": "Thanks for calling Harbour Studio. This is Ben. How can I help you today?"
      },
      {
        "speaker": "Customer",
        "text": "Hi Ben. I'm looking at joining, but it's been a while since I've been to a gym. Could I come in for a look?"
      },
      {
        "speaker": "Receptionist",
        "text": "Absolutely. We can organise a relaxed tour. Are you interested in group classes, or would you prefer to train on your own?"
      },
      {
        "speaker": "Customer",
        "text": "A bit of both, I think. I'd appreciate a hand getting started."
      },
      {
        "speaker": "Receptionist",
        "text": "No worries. We can show you around and explain the beginner classes. You can ask a few questions, with no pressure to join on the day."
      },
      {
        "speaker": "Customer",
        "text": "That sounds good. Have you got any times available this week?"
      },
      {
        "speaker": "Receptionist",
        "text": "Let's have a look. There's Thursday at half past ten in the morning, or Friday at four. Does either time suit?"
      },
      {
        "speaker": "Customer",
        "text": "I don't finish work until five. Could we do a little later on Friday?"
      },
      {
        "speaker": "Receptionist",
        "text": "Of course. Half past five is available. Allow about fifteen minutes for the tour. Can I grab your name?"
      },
      {
        "speaker": "Customer",
        "text": "It's Jordan Taylor. Half past five would be lovely."
      },
      {
        "speaker": "Receptionist",
        "text": "Thanks, Jordan. Is the number you're calling from the best one for a confirmation text with directions?"
      },
      {
        "speaker": "Customer",
        "text": "Yes, that's fine. Do I need to bring anything?"
      },
      {
        "speaker": "Receptionist",
        "text": "Just yourself and any questions. That's Friday at half past five, for a fifteen-minute tour. Just pop into reception when you arrive."
      },
      {
        "speaker": "Customer",
        "text": "Lovely. Thanks for your help, Ben."
      },
      {
        "speaker": "Receptionist",
        "text": "My pleasure, Jordan. We look forward to meeting you. Enjoy the rest of your afternoon."
      },
      {
        "speaker": "Customer",
        "text": "Thanks, you too. See you Friday."
      }
    ]
  }
]
