import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const toAbs = (...p: string[]) => path.resolve(__dirname, ...p)

interface RouteInfo {
  url: string
  title: string
  description: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serverModule: any = await import('./dist/server/entry-server.js')
const render: (url: string) => string = serverModule.render
const stageRoutes: RouteInfo[] = serverModule.stageRoutes

const template = fs.readFileSync(toAbs('dist/client/index.html'), 'utf-8')

const BASE_URL = 'https://queems.netlify.app'

const routes: RouteInfo[] = [
  {
    url: '/',
    title: 'Queems — Daily Queens Puzzle Game',
    description:
      'A daily N-Queens puzzle game. Place one queen per color region so no two queens share a row, column, or diagonal.',
  },
  ...stageRoutes,
]

for (const route of routes) {
  const appHtml = render(route.url)

  let html = template
    .replace('<!--app-html-->', appHtml)
    .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${route.description}" />`,
    )
    .replace(
      /<link rel="canonical" href=".*?" \/>/,
      `<link rel="canonical" href="${BASE_URL}${route.url}" />`,
    )
    .replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="${BASE_URL}${route.url}" />`,
    )
    .replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${route.title}" />`,
    )

  const filePath =
    route.url === '/'
      ? toAbs('dist/client/index.html')
      : toAbs(`dist/client${route.url}/index.html`)

  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, html)
  console.log(`Prerendered: ${route.url}`)
}

// Generate sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${BASE_URL}${r.url}</loc>
    <priority>${r.url === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

fs.writeFileSync(toAbs('dist/client/sitemap.xml'), sitemap)
console.log('Generated: sitemap.xml')

// Generate robots.txt
fs.writeFileSync(
  toAbs('dist/client/robots.txt'),
  `User-agent: *\nAllow: /\nSitemap: ${BASE_URL}/sitemap.xml\n`,
)
console.log('Generated: robots.txt')
