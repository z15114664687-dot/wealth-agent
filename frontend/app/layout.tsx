import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NoiseBackground } from '@/components/layout/NoiseBackground';

export const metadata: Metadata = {
  title: 'WealthAgent AI',
  description: '面向 A 股投资者的智能研究与组合诊断系统。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="font-mono antialiased">
        <NoiseBackground />
        <Navbar />
        <main className="pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
