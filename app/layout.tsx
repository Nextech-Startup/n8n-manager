import type { Metadata } from 'next';
import { Exo_2 } from 'next/font/google';
import './globals.css';

const exo2 = Exo_2({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-exo2',
});

export const metadata: Metadata = {
  title: 'Manager Workflows',
  description: 'Gerenciador de workflows.',
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