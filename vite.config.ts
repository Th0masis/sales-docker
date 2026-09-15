import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { defineConfig, type Plugin, type ViteDevServer } from 'vite'

const skillsOrigin = 'https://www.skills.sh'
const skippedResponseHeaders = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'content-security-policy',
  'transfer-encoding',
  'x-frame-options',
])

const rewriteSkillsLocation = (location: string) => {
  try {
    const target = new URL(location, skillsOrigin)
    if (target.hostname !== 'skills.sh' && target.hostname !== 'www.skills.sh') return location
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return location
  }
}

const toRequestHeaders = (request: IncomingMessage) => {
  const headers: Record<string, string> = {}

  for (const [headerName, headerValue] of Object.entries(request.headers)) {
    if (headerName === 'connection' || headerName === 'host' || headerName === 'content-length') continue
    if (typeof headerValue === 'string') headers[headerName] = headerValue
  }

  return headers
}

const proxySkillsRequest = async (request: IncomingMessage, response: ServerResponse) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.statusCode = 405
    response.end()
    return
  }

  const incomingUrl = new URL(request.url ?? '/', 'http://localhost')
  const remoteUrl = new URL(incomingUrl.pathname || '/', skillsOrigin)
  remoteUrl.search = incomingUrl.search

  const remoteResponse = await fetch(remoteUrl, {
    headers: toRequestHeaders(request),
    redirect: 'manual',
  })
  const remoteBody = request.method === 'HEAD' ? new ArrayBuffer(0) : await remoteResponse.arrayBuffer()
  const body = Buffer.from(remoteBody)

  response.statusCode = remoteResponse.status

  for (const [headerName, headerValue] of remoteResponse.headers) {
    if (skippedResponseHeaders.has(headerName)) continue
    response.setHeader(
      headerName,
      headerName === 'location' ? rewriteSkillsLocation(headerValue) : headerValue,
    )
  }

  if (request.method !== 'HEAD') response.setHeader('content-length', body.byteLength)
  response.end(request.method === 'HEAD' ? undefined : body)
}

const startSkillsProxy = (server: ViteDevServer) => {
  const start = () => {
    const address = server.httpServer?.address()
    if (!address || typeof address === 'string') return

    const proxyPort = address.port + 1
    const proxyServer = createServer((request, response) => {
      proxySkillsRequest(request, response).catch(error => {
        if (response.headersSent) {
          response.destroy(error as Error)
          return
        }

        response.statusCode = 502
        response.end('Unable to reach skills.sh')
      })
    })

    proxyServer.listen(proxyPort)
    server.httpServer?.once('close', () => proxyServer.close())
  }

  if (server.httpServer?.listening) start()
  else server.httpServer?.once('listening', start)
}

const skillsEmbedProxy: Plugin = {
  name: 'skills-embed-proxy',
  configureServer: startSkillsProxy,
}

export default defineConfig({
  plugins: [skillsEmbedProxy],
})