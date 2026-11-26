// Permission prompts can outlive the panel that requested them. Invalidate
// pending permission checks before a later grant can start a detached session.
export function createVoiceSessionStarter(checkMicrophone) {
  let generation = 0
  return {
    cancel() { generation++ },
    async start(connect) {
      const attempt = ++generation
      const problem = await checkMicrophone()
      if (attempt !== generation) return { status: 'cancelled' }
      if (problem) return { status: 'denied', message: problem }
      try {
        // Invalidate SDK callbacks as soon as a retry begins, even while its
        // microphone check is pending and the old SDK session is tearing down.
        await connect(() => attempt === generation)
        return { status: attempt === generation ? 'started' : 'cancelled' }
      } catch (error) {
        return attempt === generation ? { status: 'error', error } : { status: 'cancelled' }
      }
    },
  }
}
