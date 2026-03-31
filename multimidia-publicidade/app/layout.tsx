import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Multimídia Publicidade e Marketing | Porto Franco - MA',
  description: 'Especialistas em mídia eletrônica outdoor, design gráfico, sonorização e muito mais. Sua marca vista, ouvida e lembrada.',
  keywords: 'publicidade, marketing, mídia outdoor, LED, design gráfico, Porto Franco, Maranhão',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
