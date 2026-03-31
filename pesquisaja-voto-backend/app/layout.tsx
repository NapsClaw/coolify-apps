import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pesquisa Já — Votação Eleitoral',
  description: 'Pesquisa Já: participe da votação eleitoral para Deputado Estadual — Guarujá, SP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#f0f4ff', fontFamily: "'Inter', sans-serif" }}>
        {children}
      </body>
    </html>
  )
}
