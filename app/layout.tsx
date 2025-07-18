import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '粵語語音轉文字 | AI 智能轉錄',
  description: 'AI 智能粵語語音轉錄及說話者識別系統，支援多種音頻格式，提供精準的語音轉文字及智能說話者分析功能。',
  keywords: ['粵語', '語音轉文字', 'AI轉錄', '說話者識別', '語音識別', '廣東話', 'Cantonese', 'Speech-to-Text'],
  openGraph: {
    title: '粵語語音轉文字 | AI 智能轉錄',
    description: 'AI 智能粵語語音轉錄及說話者識別系統',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-HK">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 