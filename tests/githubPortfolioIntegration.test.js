import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

let server, answerQuestion
before(async () => {
  server = await createServer({ envDir: 'tests', server: { middlewareMode: true, hmr: false, ws: false } })
  ;({ answerQuestion } = await server.ssrLoadModule('/src/lib/assistantAnswers.js'))
})
after(async () => { await server?.close() })

test('Alex sends contribution questions to live evidence without inventing totals', () => {
  for (const question of ['Show his GitHub contributions', 'Can I see his contribution calendar?', 'Where is his GitHub profile?']) {
    const answer = answerQuestion(question)
    assert.ok(answer.actions?.some(action => action.href === '/#github'))
    assert.ok(answer.actions?.some(action => action.href === 'https://github.com/CharlieJamesGwapo' && action.external))
    assert.doesNotMatch(answer.text, /10,?316|134|70\s*repositories/)
    assert.match(answer.text, /public|published/i)
  }
})

test('GitHub questions retain the commercial commitment guard', () => {
  assert.match(answerQuestion('What is his hourly rate on GitHub?').text, /scope|price|rate|quote|confirm/i)
  assert.match(answerQuestion('Can his GitHub guarantee delivery tomorrow?').text, /not confirmed/i)
})

test('GitHub Actions still leads to deployment skills rather than contribution counts', () => {
  assert.ok(answerQuestion('Does Charlie work with GitHub Actions?').actions.some(action => action.href === '/#skills'))
})
