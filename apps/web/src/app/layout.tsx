import type { Metadata } from 'next';
import { NavBar, Sidebar } from '@/components/NavBar';
import { ThemeProvider } from '@/components/theme-provider';
import { WagmiProvider } from '@/components/wagmi-provider';
import './globals.css';

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
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <WagmiProvider>
            <NavBar />
            <div className="flex flex-1">
              <Sidebar />
              <main className="min-w-0 flex-1">{children}</main>
            </div>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
