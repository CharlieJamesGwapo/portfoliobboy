import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('../src/lib/registerServiceWorker.js', import.meta.url), 'utf8')
  .replace('import.meta.env.PROD', 'true')
  .replaceAll('export ', '')

for (const initiallyControlled of [false, true]) {
  test(`service worker ${initiallyControlled ? 'reloads once for an update' : 'keeps the first visit uninterrupted'}`, () => {
    const handlers = {}
    let reloads = 0
    const serviceWorker = {
      controller: initiallyControlled ? {} : null,
      register: () => Promise.resolve({ addEventListener() {} }),
      addEventListener: (name, handler) => { handlers[name] = handler },
    }
    runInNewContext(`${source}\nregisterServiceWorker()`, {
      navigator: { serviceWorker },
      window: {
        addEventListener: (_name, handler) => handler(),
        location: { reload: () => { reloads++ } },
      },
    })
    serviceWorker.controller = {}
    handlers.controllerchange()
    handlers.controllerchange()
    assert.equal(reloads, initiallyControlled ? 1 : 0)
  })
}
