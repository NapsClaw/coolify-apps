import type { Metadata } from 'next';
import './globals.css';
import './admin.css';

export const metadata: Metadata = {
  title: 'Raspadinha FISIOT por Elas — Caminhada Contra o Câncer',
  description:
    'Recebeu um código da Caminhada FISIOT por Elas? Desbloqueie sua raspadinha e revele sua surpresa especial.',
  icons: { icon: '/assets/logo-fisiot.jpg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
