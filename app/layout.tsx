import type { Metadata } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatbotWidget from '@/components/chatbot/ChatbotWidget'
import QueryProvider from '@/components/providers/QueryProvider'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AQS Restaurant — Good Food • Good Mood',
  description: 'Experience luxury dining and exquisite culinary creations at AQS Restaurant.',
  icons: {
    icon: '/logo.jpg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#0c0c0e] text-[#f5f5f7] antialiased selection:bg-[#c5a059] selection:text-black">
        <QueryProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatbotWidget />
        </QueryProvider>
      </body>
    </html>
  )
}
