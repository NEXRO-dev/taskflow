import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow Pro - AI-Powered Task Management Platform',
  description: 'The world\'s most intelligent task manager. Powered by AI, gamified for motivation, and designed for teams that want to achieve more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const useClerk = isClerkConfigured();
  return (
    useClerk ? (
      <ClerkProvider>
        <html lang="en">
          <body className={inter.className}>{children}</body>
        </html>
      </ClerkProvider>
    ) : (
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    )
  );
}