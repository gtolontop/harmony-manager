import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Harmony Manager',
    template: '%s | Harmony Manager',
  },
  description: 'Systeme de gestion interne Harmony Motors',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr' className={inter.variable}>
      <body className='font-sans antialiased'>
        {children}
        <Toaster richColors position='bottom-right' />
      </body>
    </html>
  );
}
