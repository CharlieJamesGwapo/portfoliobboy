// Match a short closing utterance, not a question or a mention of "goodbye".
// Only final visitor transcripts should be passed here by the voice session.
export function isVoiceFarewell(message) {
  if (typeof message !== 'string') return false
  const text = message.normalize('NFKC').toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
  return /^(?:(?:ok|okay|alright|thanks|thank you) )*(?:(?:good ?bye|bye(?: bye)?)(?: (?:alex|for now))?|see you later|end (?:the|this) (?:call|conversation))(?: (?:thanks|thank you))?$/.test(text)
}
