import { createServer, request as requestHttp } from 'node:http'
import { createServer as createHttpsServer } from 'node:https'
import { mkdtempSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let testTls
function localTestTls() {
  if (testTls) return testTls
  const directory = mkdtempSync(join(tmpdir(), 'portfolio-browser-tls-'))
  const keyPath = join(directory, 'localhost.key')
  const certPath = join(directory, 'localhost.crt')
  // Ephemeral loopback identity only. Leave generated files in the OS temp
  // directory; no private key or certificate enters the repository.
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1',
    '-subj', '/CN=localhost/O=Portfolio local browser tests',
    '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1',
    '-keyout', keyPath, '-out', certPath], { stdio: 'ignore' })
  testTls = { cert: readFileSync(certPath), key: readFileSync(keyPath) }
  return testTls
}

// Forward the built site through an isolated origin that this test can stop.
// Playwright's WebKit offline emulation rejects requests before dispatching
// service-worker fetch events, even for a worker-created literal Response.
// Removing the actual origin exercises network rejection and cache fallback
// in every engine without changing the worker or bypassing browser fetch.
export async function createOfflineOrigin(upstream, { secure = false } = {}) {
  const forward = (request, response) => {
    const forwarded = requestHttp(new URL(request.url, upstream), {
      method: request.method,
      headers: { ...request.headers, host: new URL(upstream).host, connection: 'close' },
    }, incoming => {
      response.writeHead(incoming.statusCode, incoming.headers)
      incoming.on('error', () => response.destroy())
      incoming.pipe(response)
    })
    forwarded.on('error', () => response.destroy())
    request.pipe(forwarded)
  }
  const server = secure ? createHttpsServer(localTestTls(), forward) : createServer(forward)
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  let closed = false
  return {
    url: `http${secure ? 's' : ''}://127.0.0.1:${server.address().port}`,
    async stop() {
      if (closed) return
      closed = true
      await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve())
        server.closeAllConnections()
      })
    },
  }
}
