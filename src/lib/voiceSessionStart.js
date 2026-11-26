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
        await connect()
        return { status: attempt === generation ? 'started' : 'cancelled' }
      } catch (error) {
        return attempt === generation ? { status: 'error', error } : { status: 'cancelled' }
      }
    },
  }
}
