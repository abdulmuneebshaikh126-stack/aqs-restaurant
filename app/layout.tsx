
import type { Metadata } from 'next'
import '@fontsource-variable/playfair-display'
import '@fontsource-variable/plus-jakarta-sans'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatbotWidget from '@/components/chatbot/ChatbotWidget'
import QueryProvider from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'APNA DERA Restaurant — Good Food • Good Mood',
  description: 'Experience luxury dining and exquisite culinary creations at APNA DERA Restaurant.',
  icons: {
    icon: '/images/logo.jpg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-[#c5a059] selection:text-black">
        <ThemeProvider>
          <QueryProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatbotWidget />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
