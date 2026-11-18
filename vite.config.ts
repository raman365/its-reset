import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Share previews (WhatsApp, iMessage, Slack) need an absolute image URL.
// The Pages workflow sets SITE_URL; locally it falls back to a relative path.
function siteUrl(): Plugin {
  const url = (process.env.SITE_URL ?? '').replace(/\/$/, '')
  return {
    name: 'site-url',
    transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url),
  }
}

export default defineConfig({
  plugins: [react(), siteUrl()],
})
