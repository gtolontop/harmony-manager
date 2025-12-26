import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

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
    <html lang='fr'>
      <body className='font-sans antialiased'>
        {children}
        <Toaster richColors position='bottom-right' />
      </body>
    </html>
  );
}
