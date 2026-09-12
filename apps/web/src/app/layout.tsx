import type { Metadata } from 'next';
import { Geist_Mono, Space_Grotesk } from 'next/font/google';
import { NavBar } from '@/components/NavBar';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Tutela',
  description: 'Persistent monitoring agent for EVM wallets',
  icons: {
    icon: '/Tutela logo.png',
    shortcut: '/Tutela logo.png',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
