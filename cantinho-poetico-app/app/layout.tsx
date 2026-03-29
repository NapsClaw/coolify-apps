import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cantinho Poéético — Delsio Pavan',
  description: 'Poeta, escritor e compositor. Conheça as obras, ouça as músicas e entre para a comunidade exclusiva.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <a href="https://wa.me/559891416254" target="_blank" className="wa-float" aria-label="WhatsApp">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="white">
            <path d="M16 3C9.4 3 4 8.4 4 15c0 2.6.8 5 2.2 7L4 29l7.3-2.1C13 28.2 14.5 28.6 16 28.6c6.6 0 12-5.4 12-12S22.6 3 16 3zm6.2 16.8c-.3.8-1.5 1.5-2.1 1.6-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.8-.6-3.1-1.3-5.1-4.4-5.3-4.6-.2-.2-1.3-1.7-1.3-3.2 0-1.5.8-2.3 1.1-2.6.3-.3.6-.4 1-.4l.7.01c.2 0 .5-.1.8.6.3.7 1 2.5 1.1 2.6.1.1.2.3.04.5l-.5.6c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.7-.1.3.1 1.8.85 2.1 1 .3.15.5.22.6.35.1.1.1.7-.2 1.45z"/>
          </svg>
        </a>
      </body>
    </html>
  )
}
