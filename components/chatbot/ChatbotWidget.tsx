'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Sparkles,
  User,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
} from 'lucide-react'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
  suggestedQuestions?: string[]
}

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome-1',
  sender: 'bot',
  text: 'Welcome to AQS Restaurant! How can I help you today? ✨\n\nYou can ask me about our menu, dish prices, table & chair reservations, opening hours, or delivery.',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestedQuestions: [
    'What food do you have?',
    'How can I book a table?',
    'What are your opening hours?',
    'What is your delivery fee?',
  ],
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat session from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('aqs_chat_history')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch (e) {}
  }, [])

  // Save chat session whenever messages update
  useEffect(() => {
    try {
      sessionStorage.setItem('aqs_chat_history', JSON.stringify(messages))
    } catch (e) {}
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 250)
      setHasUnread(false)
    }
  }, [isOpen, isMinimized])

  // Handle message send
  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim()
    if (!textToSend || isTyping) return

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      })

      const data = await res.json()

      const botReply: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "Sorry! I don't have this information about AQS Restaurant right now. Please contact our restaurant for assistance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedQuestions: data.suggestedQuestions,
      }

      setMessages((prev) => [...prev, botReply])
      if (!isOpen) setHasUnread(true)
    } catch (err) {
      const errorReply: Message = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "Sorry! I don't have this information about AQS Restaurant right now. Please contact our restaurant for assistance.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorReply])
    } finally {
      setIsTyping(false)
    }
  }

  // Clear conversation
  const handleClearChat = () => {
    setMessages([
      {
        ...DEFAULT_WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    try {
      sessionStorage.removeItem('aqs_chat_history')
    } catch (e) {}
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* 1. FLOATING CHAT BUTTON (When Closed or Minimized) */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 sm:gap-3 cursor-pointer focus:outline-none"
          aria-label="Let's Chat with AI"
        >
          {/* Elegant Modern Responsive Label */}
          <span className="relative flex items-center whitespace-nowrap rounded-full bg-[#141418]/95 border border-primary/40 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-[#F5F5F7] shadow-xl backdrop-blur-md transition-all duration-300 ease-out group-hover:border-primary group-hover:text-primary group-hover:shadow-[0_0_20px_rgba(197,160,89,0.25)] group-hover:-translate-x-0.5">
            Let&apos;s Chat with AI
          </span>

          {/* Existing Golden Circular Chat Icon */}
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full gold-gradient-bg text-black shadow-2xl transition duration-300 group-hover:scale-105">
            {/* Pulsing ring animation */}
            <span className="absolute -inset-1 rounded-full gold-gradient-bg opacity-40 blur-sm animate-pulse" />

            {/* Icon */}
            <MessageSquare className="h-6 w-6 stroke-[2.2] relative z-10" />

            {/* Unread badge */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white z-20">
                1
              </span>
            )}
          </div>
        </motion.button>
      )}

      {/* 2. CHATBOT POPUP WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`flex flex-col overflow-hidden rounded-3xl bg-[#0c0c0e] border border-primary/40 shadow-2xl transition-all duration-300 ${
              isMinimized
                ? 'h-16 w-80 sm:w-96'
                : 'h-[580px] max-h-[85vh] w-[92vw] sm:w-[410px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/20 bg-[#141418] px-4 py-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-primary/40 shadow">
                  <Image
                    src="/images/logo.jpg"
                    alt="AQS Restaurant"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm font-bold tracking-wider gold-gradient-text">
                      AQS Assistant
                    </h3>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">
                    AI-Free Verified Knowledge Base
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1 text-gray-400">
                <button
                  onClick={handleClearChat}
                  title="Clear Conversation"
                  className="rounded-lg p-1.5 hover:bg-white/10 hover:text-red-400 transition"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                  className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition"
                  aria-label={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  title="Close Chat"
                  className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body (Messages & Input) — Hidden if Minimized */}
            {!isMinimized && (
              <>
                {/* Scrollable Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.sender === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div className="flex items-end gap-2 max-w-[88%]">
                        {msg.sender === 'bot' && (
                          <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-primary/30 shadow-sm mb-1">
                            <Image
                              src="/images/logo.jpg"
                              alt="AQS Bot"
                              fill
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed shadow-md ${
                            msg.sender === 'user'
                              ? 'gold-gradient-bg text-black font-medium rounded-br-none'
                              : 'bg-[#16161c] border border-primary/20 text-gray-200 rounded-bl-none'
                          }`}
                        >
                          <div className="whitespace-pre-line">{msg.text}</div>

                          <div
                            className={`mt-1.5 text-[9px] text-right font-light ${
                              msg.sender === 'user' ? 'text-black/60' : 'text-gray-500'
                            }`}
                          >
                            {msg.timestamp}
                          </div>
                        </div>

                        {msg.sender === 'user' && (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1c1c24] border border-white/10 text-primary mb-1">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Suggested Questions below Bot messages */}
                      {msg.sender === 'bot' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                        <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5">
                          {msg.suggestedQuestions.map((q) => (
                            <button
                              key={q}
                              onClick={() => handleSend(q)}
                              className="rounded-full bg-[#181820] border border-primary/30 px-3 py-1 text-[11px] font-medium text-[#E5C158] hover:bg-primary hover:text-black transition duration-200 shadow-sm"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2">
                      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-primary/30">
                        <Image
                          src="/images/logo.jpg"
                          alt="AQS Bot"
                          fill
                          sizes="28px"
                          className="object-cover"
                        />
                      </div>
                      <div className="rounded-2xl rounded-bl-none bg-[#16161c] border border-primary/20 px-4 py-3 flex items-center gap-1.5 shadow">
                        <span className="h-2 w-2 rounded-full gold-gradient-bg animate-bounce" />
                        <span className="h-2 w-2 rounded-full gold-gradient-bg animate-bounce [animation-delay:0.2s]" />
                        <span className="h-2 w-2 rounded-full gold-gradient-bg animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Navigation Action Pills */}
                <div className="border-t border-white/5 bg-[#101014] px-3 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
                  <Link
                    href="/menu"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-[#181820] border border-white/10 px-2.5 py-1 text-[10px] text-gray-300 hover:text-primary transition"
                  >
                    <span>Menu</span> <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                  <Link
                    href="/reservations"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-[#181820] border border-white/10 px-2.5 py-1 text-[10px] text-gray-300 hover:text-primary transition"
                  >
                    <span>Reserve Chairs</span> <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                  <Link
                    href="/orders"
                    className="flex shrink-0 items-center gap-1 rounded-full bg-[#181820] border border-white/10 px-2.5 py-1 text-[10px] text-gray-300 hover:text-primary transition"
                  >
                    <span>Track Order</span> <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                </div>

                {/* Chat Input Bar */}
                <div className="border-t border-primary/20 bg-[#141418] p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend()
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about food, prices, tables, timings..."
                      maxLength={500}
                      className="flex-1 rounded-full bg-[#0c0c0e] border border-white/10 px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-primary focus:outline-none transition"
                    />

                    <button
                      type="submit"
                      disabled={!input.trim() || isTyping}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full gold-gradient-bg text-black shadow transition duration-200 hover:opacity-90 hover:scale-105 disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4 stroke-[2.2]" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
