import {
  getKnowledgeBase,
  KnowledgeBaseSnapshot,
  MenuItemKB,
  TableKB,
} from './knowledgeBase'

export interface ChatResponse {
  reply: string
  intent: string
  suggestedQuestions?: string[]
  matchedEntities?: {
    type: 'dish' | 'category' | 'table' | 'info'
    name: string
  }[]
}

const STRICT_FALLBACK =
  "Sorry! I don't have this information about AQS Restaurant right now. Please contact our restaurant for assistance."

// Input normalization
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s$]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Tokenizer
function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((w) => w.length > 0)
}

// Find closest matching menu item in knowledge base
function findMenuItem(query: string, items: MenuItemKB[]): MenuItemKB | null {
  const normQuery = normalizeText(query)
  const queryTokens = tokenize(query)

  // Disallow foreign dishes not on the menu so words like "chicken biryani" do not falsely match
  const foreignDishes = [
    'biryani', 'pulao', 'sushi', 'karahi', 'nihari', 'handi', 'curry',
    'shawarma', 'kebab', 'naan', 'roti', 'paratha', 'roll', 'soup',
    'chowmein', 'ramen', 'dumpling', 'dumplings', 'haleem', 'daal'
  ]
  for (const fd of foreignDishes) {
    if (normQuery.includes(fd)) {
      return null
    }
  }

  // 1. Direct name match or substring
  for (const item of items) {
    const normName = normalizeText(item.name)
    if (normQuery.includes(normName) || normName.includes(normQuery)) {
      return item
    }
  }

  // 2. Keyword & Alias match (Specific compound phrases only)
  const aliasMap: { [key: string]: string } = {
    'ribeye': 'Flame-Seared Prime Ribeye Steak',
    'prime ribeye': 'Flame-Seared Prime Ribeye Steak',
    'steak': 'Flame-Seared Prime Ribeye Steak',
    'ribs': 'Slow-Smoked Sticky Glazed Ribs',
    'bbq ribs': 'Slow-Smoked Sticky Glazed Ribs',
    'smoked ribs': 'Slow-Smoked Sticky Glazed Ribs',
    'wagyu burger': 'Prime Wagyu Brioche Burger',
    'wagyu': 'Prime Wagyu Brioche Burger',
    'beef burger': 'Prime Wagyu Brioche Burger',
    'chicken katsu': 'Crispy Chicken Katsu Supreme',
    'katsu': 'Crispy Chicken Katsu Supreme',
    'chicken burger': 'Crispy Chicken Katsu Supreme',
    'crispy chicken': 'Crispy Chicken Katsu Supreme',
    'truffle pizza': 'Artisan Truffle & Wild Mushroom Pizza',
    'mushroom pizza': 'Artisan Truffle & Wild Mushroom Pizza',
    'sourdough pizza': 'Artisan Truffle & Wild Mushroom Pizza',
    'fettuccine': 'Handcrafted Truffle Fettuccine Alfredo',
    'alfredo': 'Handcrafted Truffle Fettuccine Alfredo',
    'truffle fettuccine': 'Handcrafted Truffle Fettuccine Alfredo',
    'caesar salad': 'Burrata & Heirloom Caesar Salad',
    'caesar': 'Burrata & Heirloom Caesar Salad',
    'burrata': 'Burrata & Heirloom Caesar Salad',
    'salmon': 'Pan-Seared Wild Atlantic Salmon',
    'atlantic salmon': 'Pan-Seared Wild Atlantic Salmon',
    'lava cake': 'Molten Valrhona Lava Cake',
    'molten cake': 'Molten Valrhona Lava Cake',
    'chocolate cake': 'Molten Valrhona Lava Cake',
    'cheesecake': 'Vanilla Berry Glazed Cheesecake',
    'berry cheesecake': 'Vanilla Berry Glazed Cheesecake',
    'mojito': 'Golden Passionfruit & Mint Mojito',
    'passionfruit mojito': 'Golden Passionfruit & Mint Mojito',
    'birria tacos': 'Slow-Braised Birria Tacos',
    'birria': 'Slow-Braised Birria Tacos',
    'tacos': 'Slow-Braised Birria Tacos',
  }

  for (const [alias, fullTitle] of Object.entries(aliasMap)) {
    if (normQuery.includes(alias)) {
      const match = items.find((i) => i.name === fullTitle)
      if (match) return match
    }
  }

  // 3. Token overlap scoring with high threshold
  let bestItem: MenuItemKB | null = null
  let maxScore = 0

  for (const item of items) {
    const itemTokens = tokenize(item.name)
    let matches = 0
    for (const qt of queryTokens) {
      if (['what', 'is', 'the', 'price', 'of', 'how', 'much', 'cost', 'do', 'you', 'have', 'tell', 'me', 'about'].includes(qt)) {
        continue
      }
      if (itemTokens.includes(qt)) {
        matches++
      }
    }
    if (matches > maxScore && matches >= 2) {
      maxScore = matches
      bestItem = item
    }
  }

  return bestItem
}

// Find category in query
function findCategory(query: string, categories: { id: string; name: string }[]): string | null {
  const normQuery = normalizeText(query)
  if (normQuery.includes('pizza') || normQuery.includes('pizzas')) return 'Pizza'
  if (normQuery.includes('burger') || normQuery.includes('burgers')) return 'Burgers'
  if (normQuery.includes('pasta') || normQuery.includes('pastas')) return 'Pasta'
  if (normQuery.includes('steak') || normQuery.includes('steaks') || normQuery.includes('grill') || normQuery.includes('meat') || normQuery.includes('ribs') || normQuery.includes('seafood') || normQuery.includes('tacos')) return 'Steaks & Grills'
  if (normQuery.includes('dessert') || normQuery.includes('desserts') || normQuery.includes('cake') || normQuery.includes('sweet') || normQuery.includes('sweets')) return 'Desserts'
  if (normQuery.includes('drink') || normQuery.includes('drinks') || normQuery.includes('beverage') || normQuery.includes('beverages') || normQuery.includes('mojito') || normQuery.includes('mocktail')) return 'Drinks'
  return null
}

// Format dish details for chat response
function formatDishCard(item: MenuItemKB): string {
  const priceStr = item.discount_price
    ? `$${item.discount_price.toFixed(2)} (Special Offer! Regular price: $${item.price.toFixed(2)})`
    : `$${item.price.toFixed(2)}`

  const availabilityStr = item.is_available
    ? '✅ Currently Available'
    : '❌ Currently Sold Out'

  return `🍽️ **${item.name}**\n• Category: ${item.category}\n• Price: ${priceStr}\n• Status: ${availabilityStr}\n• Description: ${item.description}`
}

// MAIN PROCESSOR
export function processChatQuery(rawQuery: string): ChatResponse {
  const kb: KnowledgeBaseSnapshot = getKnowledgeBase()
  const query = rawQuery.trim()
  const norm = normalizeText(query)
  const queryTokens = tokenize(query)

  if (!norm) {
    return {
      reply: 'Hello! Welcome to AQS Restaurant. How may I assist you today? You can ask about our menu, dish prices, table & chair reservations, opening hours, or delivery.',
      intent: 'GREETING',
      suggestedQuestions: ['What food do you have?', 'How can I book a table?', 'What are your opening hours?'],
    }
  }

  // 1. GREETINGS
  const greetingPatterns = [
    'hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon',
    'assalam', 'salam', 'aoa', 'howdy', 'greetings', 'who are you', 'what can you do'
  ]
  if (greetingPatterns.some((p) => norm === p || norm.startsWith(p + ' '))) {
    return {
      reply: `Welcome to **${kb.info.name}**! ✨\n*${kb.info.tagline}*\n\nI am your intelligent dining assistant. I can help you with:\n• Browsing our menu categories and dish ingredients\n• Checking exact food prices and today's specials\n• Reserving tables and choosing individual chairs\n• Opening hours, location, and delivery details\n\nHow can I help you today?`,
      intent: 'GREETING',
      suggestedQuestions: [
        'What food do you have?',
        'How can I book a table?',
        'What are your opening hours?',
        'What is your delivery fee?',
      ],
    }
  }

  // 2. SPECIFIC DISH INQUIRY CHECK FIRST
  const matchedDish = findMenuItem(query, kb.menuItems)
  const isAskingPrice =
    norm.includes('price') ||
    norm.includes('cost') ||
    norm.includes('how much') ||
    norm.includes('rate') ||
    norm.includes('$')

  if (
    matchedDish &&
    (isAskingPrice ||
      norm.includes('what is') ||
      norm.includes('tell me about') ||
      norm.includes('do you have') ||
      norm.includes('ingredients') ||
      norm.includes('describe') ||
      norm.includes('show me'))
  ) {
    return {
      reply: formatDishCard(matchedDish),
      intent: 'DISH_INQUIRY',
      matchedEntities: [{ type: 'dish', name: matchedDish.name }],
      suggestedQuestions: [
        'What food do you have?',
        'Can I order online?',
        'What are today’s specials?',
      ],
    }
  }

  // If customer asked for price of a dish that DOES NOT exist in the knowledge base
  // e.g. "What is the price of Chicken Biryani?" or "How much is sushi?"
  if (isAskingPrice && !matchedDish) {
    return {
      reply: STRICT_FALLBACK,
      intent: 'UNKNOWN',
    }
  }

  // 3. RESTAURANT ABOUT / STORY
  if (
    norm.includes('about aqs') ||
    norm.includes('about your restaurant') ||
    norm.includes('what is aqs') ||
    norm.includes('restaurant story') ||
    norm.includes('who are you') ||
    (norm.includes('tell me about') &&
      (norm.includes('restaurant') ||
        norm.includes('aqs') ||
        norm.includes('place') ||
        norm.endsWith('about')))
  ) {
    return {
      reply: `👑 **Welcome to ${kb.info.name}**\n*"${kb.info.tagline}"*\n\n${kb.info.description}\n\n• **Location**: ${kb.info.address}\n• **Phone**: ${kb.info.phone}\n• **Email**: ${kb.info.email}\n• **Dining Style**: Luxury fine dining with wood-fired pizzas, prime Wagyu burgers, flame-seared steaks, and handcrafted pasta.`,
      intent: 'ABOUT_RESTAURANT',
      suggestedQuestions: ['What food do you have?', 'How can I book a table?', 'What are your opening hours?'],
    }
  }

  // 3. OPENING HOURS & TIMINGS
  if (
    norm.includes('hours') ||
    norm.includes('timing') ||
    norm.includes('timings') ||
    norm.includes('open') ||
    norm.includes('close') ||
    norm.includes('closing') ||
    norm.includes('when do you open') ||
    norm.includes('what time')
  ) {
    const hoursText = kb.openingHours
      .map((h) => `• **${h.day_range}**: ${h.open_time} – ${h.close_time} *(${h.notes || 'Dine-in & Delivery'})*`)
      .join('\n')

    return {
      reply: `⏰ **AQS Restaurant Opening & Closing Hours**:\n\n${hoursText}\n\nWe welcome you for lunch, evening fine dining, and late-night weekend dining!`,
      intent: 'OPENING_HOURS',
      suggestedQuestions: ['Where is your restaurant?', 'How can I book a table?', 'Can I order online?'],
    }
  }

  // 4. LOCATION, ADDRESS & CONTACT DETAILS
  if (
    norm.includes('where') ||
    norm.includes('location') ||
    norm.includes('address') ||
    norm.includes('contact') ||
    norm.includes('phone') ||
    norm.includes('number') ||
    norm.includes('email') ||
    norm.includes('call') ||
    norm.includes('situated') ||
    norm.includes('how to reach')
  ) {
    return {
      reply: `📍 **AQS Restaurant Location & Contact Information**:\n\n• **Address**: ${kb.info.address}\n• **Phone Number**: ${kb.info.phone}\n• **Email Address**: ${kb.info.email}\n• **Tagline**: ${kb.info.tagline}\n\nFeel free to visit us in person or order delivery to your doorstep!`,
      intent: 'LOCATION_CONTACT',
      suggestedQuestions: ['What are your opening hours?', 'What food do you have?', 'How can I book a table?'],
    }
  }

  // 5. DELIVERY & DELIVERY FEE
  if (
    norm.includes('delivery') ||
    norm.includes('deliver') ||
    norm.includes('delivery fee') ||
    norm.includes('delivery charge') ||
    norm.includes('delivery time') ||
    norm.includes('how long does delivery take')
  ) {
    return {
      reply: `🚚 **AQS Delivery Service**:\n\n• **Delivery Fee**: $${kb.info.delivery_fee.toFixed(2)} flat delivery charge.\n• **Delivery Speed**: ${kb.info.delivery_time}\n• **Payment**: Cash on Delivery upon arrival.\n• **Tracking**: You can track live kitchen and rider milestones at /orders anytime.`,
      intent: 'DELIVERY_INFO',
      suggestedQuestions: ['What payment methods do you accept?', 'What food do you have?', 'Can I order online?'],
    }
  }

  // 6. PAYMENT METHODS
  if (
    norm.includes('payment') ||
    norm.includes('pay') ||
    norm.includes('cash on delivery') ||
    norm.includes('cod') ||
    norm.includes('credit card') ||
    norm.includes('card')
  ) {
    return {
      reply: `💳 **Payment Information**:\n\n• We currently accept **${kb.info.payment_methods}**.\n• You can place your order online at /menu and hand cash directly to our delivery courier upon receiving your hot meal.`,
      intent: 'PAYMENT_INFO',
      suggestedQuestions: ['What is your delivery fee?', 'Can I order online?', 'What food do you have?'],
    }
  }

  // 7. ONLINE ORDERING INSTRUCTIONS
  if (
    norm.includes('how to order') ||
    norm.includes('order online') ||
    norm.includes('order food') ||
    norm.includes('place an order') ||
    norm.includes('can i order online')
  ) {
    return {
      reply: `🛒 **How to Order Online at AQS Restaurant**:\n\n1. Visit our **Menu** page (/menu).\n2. Click the **"+ Add"** button on any dish you desire.\n3. Open your **Cart** (/cart) to review your order.\n4. Proceed to **Checkout** (/checkout), enter your delivery address and phone number.\n5. Select **Cash on Delivery** and place your order!\n6. You will receive a live order tracker (/orders) with instant kitchen updates.`,
      intent: 'ORDER_INQUIRY',
      suggestedQuestions: ['What food do you have?', 'What is your delivery fee?', 'What are today’s specials?'],
    }
  }

  // 8. TABLE RESERVATIONS & CHAIR SELECTION
  if (
    norm.includes('book a table') ||
    norm.includes('reserve') ||
    norm.includes('reservation') ||
    norm.includes('table') ||
    norm.includes('chair') ||
    norm.includes('chairs') ||
    norm.includes('seat') ||
    norm.includes('seating') ||
    norm.includes('vip lounge') ||
    norm.includes('window terrace')
  ) {
    const totalChairs = kb.tables.reduce((acc, t) => acc + t.capacity, 0)
    return {
      reply: `🪑 **AQS Restaurant Table & Chair Reservation System**:\n\n• **Interactive 2D Floor Plan**: You can reserve a table and choose your exact **individual chairs** at /reservations.\n• **Floor Capacity**: ${kb.tables.length} luxury tables with a total of ${totalChairs} chairs.\n• **4 Atmosphere Zones**:\n  1. **Window Terrace**: Panoramic sunset views (Tables 1-3, 2 & 4 chairs)\n  2. **Main Dining**: Chandelier & wine cellar center (Tables 4-7, 4 & 6 chairs)\n  3. **VIP Lounge**: Royal Velvet booths & 8-seat Presidential table (Tables 8-9)\n  4. **Chef's Garden**: Courtyard fountain & outdoor patio (Tables 10-12, 4 & 8 chairs)\n• **Arrival Slots**: Lunch (12:30 PM - 02:00 PM) & Dinner (07:00 PM - 10:00 PM).\n• **Booking Fee**: Free online booking with instant digital AQS Dining Pass!`,
      intent: 'RESERVATION_INQUIRY',
      suggestedQuestions: ['What are your opening hours?', 'What food do you have?', 'Where is your restaurant?'],
    }
  }

  // 9. SPECIAL DEALS & OFFERS
  if (
    norm.includes('special') ||
    norm.includes('specials') ||
    norm.includes('deal') ||
    norm.includes('deals') ||
    norm.includes('discount') ||
    norm.includes('discounts') ||
    norm.includes('offer') ||
    norm.includes('sale')
  ) {
    const discountedItems = kb.menuItems.filter((i) => i.discount_price !== null)
    const list = discountedItems
      .map(
        (i) =>
          `• **${i.name}**: Sale Price **$${i.discount_price!.toFixed(2)}** *(Regular: $${i.price.toFixed(2)})*\n  ${i.description}`
      )
      .join('\n\n')

    return {
      reply: `🔥 **Today's Chef Specials & Discounted Dishes at AQS**:\n\n${list}\n\nYou can order these specials right now from our Menu page (/menu)!`,
      intent: 'SPECIALS_DEALS',
      suggestedQuestions: ['What is the price of Flame-Seared Prime Ribeye Steak?', 'What food do you have?', 'Can I order online?'],
    }
  }

  // 10. SPECIFIC CATEGORY INQUIRY (e.g. "Show me pizzas", "What burgers do you have?")
  const matchedCategory = findCategory(query, kb.categories)
  if (matchedCategory) {
    const categoryItems = kb.menuItems.filter((i) => i.category === matchedCategory)
    if (categoryItems.length > 0) {
      const itemsList = categoryItems
        .map((i) => {
          const pr = i.discount_price
            ? `$${i.discount_price.toFixed(2)} (Was $${i.price.toFixed(2)})`
            : `$${i.price.toFixed(2)}`
          return `• **${i.name}** — ${pr}\n  ${i.description}`
        })
        .join('\n\n')

      return {
        reply: `🍽️ **${matchedCategory} at AQS Restaurant**:\n\n${itemsList}\n\nYou can add any of these to your cart on /menu.`,
        intent: 'CATEGORY_MENU',
        matchedEntities: [{ type: 'category', name: matchedCategory }],
        suggestedQuestions: ['What food do you have?', 'What are today’s specials?', 'How can I book a table?'],
      }
    }
  }

  // 12. GENERAL MENU OVERVIEW ("What food do you have?", "Show menu", "Menu items")
  if (
    norm.includes('menu') ||
    norm.includes('food') ||
    norm.includes('dishes') ||
    norm.includes('items') ||
    norm.includes('what do you have') ||
    norm.includes('what can i eat') ||
    norm.includes('categories')
  ) {
    const catList = kb.categories
      .map((c) => {
        const count = kb.menuItems.filter((m) => m.category === c.name).length
        return `• **${c.name}** (${count} dishes) — *${c.description}*`
      })
      .join('\n')

    return {
      reply: `📖 **AQS Restaurant Menu Overview**:\n\nWe feature 6 handcrafted gourmet categories:\n\n${catList}\n\n**Popular Signature Dishes**:\n• Flame-Seared Prime Ribeye Steak ($29.50 sale)\n• Prime Wagyu Brioche Burger ($16.99)\n• Artisan Truffle & Wild Mushroom Pizza ($15.99 sale)\n• Handcrafted Truffle Fettuccine Alfredo ($17.00)\n• Molten Valrhona Lava Cake ($9.50)\n\nAsk me about any specific dish or visit /menu to explore all ${kb.menuItems.length} dishes!`,
      intent: 'MENU_OVERVIEW',
      suggestedQuestions: [
        'What steaks do you have?',
        'What pizzas do you have?',
        'What is the price of Flame-Seared Prime Ribeye Steak?',
        'What are today’s specials?',
      ],
    }
  }

  // 13. FREQUENTLY ASKED QUESTIONS MATCHING
  for (const faq of kb.faqs) {
    const faqTokens = tokenize(faq.question)
    const matches = queryTokens.filter((qt) => faqTokens.includes(qt)).length
    if (matches >= 3) {
      return {
        reply: `💡 **${faq.question}**\n\n${faq.answer}`,
        intent: 'FAQ',
        suggestedQuestions: ['What food do you have?', 'How can I book a table?', 'What are your opening hours?'],
      }
    }
  }

  // 14. STRICT FALLBACK RULE: Never guess or invent answers
  return {
    reply: STRICT_FALLBACK,
    intent: 'UNKNOWN',
    suggestedQuestions: [
      'What food do you have?',
      'What are your opening hours?',
      'Where is your restaurant?',
      'How can I book a table?',
    ],
  }
}
