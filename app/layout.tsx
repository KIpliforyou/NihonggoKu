import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Layout from '@/components/Layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NihonggoKu - Personal Japanese Learning',
  description: 'A personal Japanese learning application for grammar, vocabulary, and flashcards',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
