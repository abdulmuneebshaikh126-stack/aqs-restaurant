import { NextRequest, NextResponse } from 'next/server'
import { processChatQuery } from '@/lib/chatbot/nlpEngine'
import { getKnowledgeBase, syncKnowledgeBaseFromAdmin } from '@/lib/chatbot/knowledgeBase'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

let lastMenuSync = 0

async function syncMenuFromSupabaseIfNeeded() {
  const now = Date.now()
  if (now - lastMenuSync < 60000) return // 60s cache
  lastMenuSync = now

  try {
    const supabase = await createServerSupabaseClient()
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('id, name, category_name, price, discount_price, description, image_url, is_available, is_featured')

    if (!error && items && items.length > 0) {
      syncKnowledgeBaseFromAdmin(items)
    }
  } catch (err) {
    // If Supabase table is not yet initialized, knowledge base fallback continues smoothly
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const rawMessage = body.message

    if (!rawMessage || typeof rawMessage !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid text message.',
        },
        { status: 400 }
      )
    }

    // Sanitize and limit input length
    const sanitized = rawMessage.slice(0, 500).trim()

    if (sanitized.length === 0) {
      return NextResponse.json({
        success: true,
        reply: 'Hello! How can I help you today with APNA-DERA Restaurant?',
        intent: 'GREETING',
      })
    }

    // Check if this is an explicit admin sync request
    if (body.action === 'sync' && body.menuItems) {
      const syncResult = syncKnowledgeBaseFromAdmin(body.menuItems)
      return NextResponse.json({
        success: true,
        message: 'Knowledge Base synchronized with admin catalog successfully.',
        syncResult,
      })
    }

    // Synchronize latest menu and prices from Supabase
    await syncMenuFromSupabaseIfNeeded()

    // Process via local AI-free NLP rule-based engine
    const response = processChatQuery(sanitized)

    return NextResponse.json({
      success: true,
      query: sanitized,
      reply: response.reply,
      intent: response.intent,
      suggestedQuestions: response.suggestedQuestions || [],
      matchedEntities: response.matchedEntities || [],
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    console.error('Chatbot API error:', err)
    return NextResponse.json(
      {
        success: false,
        error: 'An internal error occurred while processing your request.',
        reply:
          "Sorry! I don't have this information about APNA-DERA Restaurant right now. Please contact our restaurant for assistance at +92 300 1234567 or contact@apnadera.com.",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await syncMenuFromSupabaseIfNeeded()
    const kb = getKnowledgeBase()
    return NextResponse.json({
      status: 'online',
      restaurant: kb.info.name,
      tagline: kb.info.tagline,
      dishesCount: kb.menuItems.length,
      tablesCount: kb.tables.length,
      lastUpdated: kb.lastUpdated,
      initialSuggestions: [
        'What food do you have?',
        'What is the price of Flame-Seared Prime Ribeye Steak?',
        'How can I book a table and chairs?',
        'What are your opening hours?',
        'What is your delivery fee?',
      ],
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message }, { status: 500 })
  }
}
