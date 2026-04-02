import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Art Pneus - Arte e Decoração com Pneus',
  description: 'Peças únicas e sustentáveis feitas com pneus reciclados. Decoração criativa para jardins, festas e ambientes.',
  keywords: 'arte em pneus, decoração pneus, artesanato pneus, pneus reciclados, decoração sustentável',
  openGraph: {
    title: 'Art Pneus - Arte e Decoração com Pneus',
    description: 'Peças únicas e sustentáveis feitas com pneus reciclados.',
    type: 'website',
    url: 'https://artpneus.com.br',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
