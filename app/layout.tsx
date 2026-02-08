import type { Metadata } from 'next';
import { Exo_2 } from 'next/font/google';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo2',
});

export const metadata: Metadata = {
  title: 'n8n Workflow Manager',
  description: 'Gerencie seus workflows do n8n com autenticação e 2FA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`dark ${exo2.variable}`}>
      <body className="antialiased" style={{ background: 'transparent' }}>
        {children}
      </body>
    </html>
  );
}
