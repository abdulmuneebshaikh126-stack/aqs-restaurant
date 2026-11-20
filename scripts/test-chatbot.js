// Automated test runner for AQS Restaurant Chatbot
const { processChatQuery } = require('../lib/chatbot/nlpEngine')

const TEST_CASES = [
  // 1. Restaurant information
  {
    category: 'Restaurant Information',
    question: 'Tell me about AQS restaurant',
    expectedIntent: 'ABOUT_RESTAURANT',
    mustInclude: ['AQS Restaurant', 'Good Food • Good Mood', '123 Luxury Avenue'],
  },
  // 2. Food menu
  {
    category: 'Food Menu Overview',
    question: 'What food do you have?',
    expectedIntent: 'MENU_OVERVIEW',
    mustInclude: ['Steaks & Grills', 'Pizza', 'Burgers', 'Pasta'],
  },
  // 3. Category inquiry
  {
    category: 'Category Menu',
    question: 'Show me your pizza options',
    expectedIntent: 'CATEGORY_MENU',
    mustInclude: ['Artisan Truffle & Wild Mushroom Pizza'],
  },
  // 4. Food prices (Existing item)
  {
    category: 'Food Prices (Existing Item)',
    question: 'What is the price of Flame-Seared Prime Ribeye Steak?',
    expectedIntent: 'DISH_INQUIRY',
    mustInclude: ['34.00', '29.50', 'Prime Ribeye Steak'],
  },
  // 5. Food prices (Alias / Short name)
  {
    category: 'Food Prices (Alias / Burger)',
    question: 'How much is the Wagyu burger?',
    expectedIntent: 'DISH_INQUIRY',
    mustInclude: ['Prime Wagyu Brioche Burger', '16.99'],
  },
  // 6. Food prices (Dessert item)
  {
    category: 'Food Details (Dessert)',
    question: 'Tell me about molten lava cake',
    expectedIntent: 'DISH_INQUIRY',
    mustInclude: ['Molten Valrhona Lava Cake', '9.50'],
  },
  // 7. Table reservations & chairs
  {
    category: 'Table & Chairs Reservation',
    question: 'How can I book a table and chairs?',
    expectedIntent: 'RESERVATION_INQUIRY',
    mustInclude: ['floor plan', 'chairs', 'Window Terrace', 'VIP Lounge', '/reservations'],
  },
  // 8. Online orders & ordering process
  {
    category: 'Online Ordering',
    question: 'Can I order online?',
    expectedIntent: 'ORDER_INQUIRY',
    mustInclude: ['/menu', 'Cart', 'Cash on Delivery', 'track'],
  },
  // 9. Opening and closing hours
  {
    category: 'Opening Hours',
    question: 'What are your opening hours?',
    expectedIntent: 'OPENING_HOURS',
    mustInclude: ['Monday', '11:00 AM', '11:00 PM', 'Midnight', 'Sunday'],
  },
  // 10. Delivery fee & speed
  {
    category: 'Delivery Information',
    question: 'What is your delivery fee and time?',
    expectedIntent: 'DELIVERY_INFO',
    mustInclude: ['5.00', '30 minutes'],
  },
  // 11. Payment methods
  {
    category: 'Payment Methods',
    question: 'What payment methods do you accept?',
    expectedIntent: 'PAYMENT_INFO',
    mustInclude: ['Cash on Delivery'],
  },
  // 12. Location & Contact
  {
    category: 'Location & Contact',
    question: 'Where is your restaurant located?',
    expectedIntent: 'LOCATION_CONTACT',
    mustInclude: ['123 Luxury Avenue, Gourmet District', '+92 300 1234567', 'contact@aqsrestaurant.com'],
  },
  // 13. Unknown Question 1 (Non-existent food price)
  {
    category: 'Strict Fallback (Non-existent Dish Price)',
    question: 'What is the price of Chicken Biryani?',
    expectedIntent: 'UNKNOWN',
    mustInclude: [
      "Sorry! I don't have this information about AQS Restaurant right now. Please contact our restaurant for assistance.",
    ],
  },
  // 14. Unknown Question 2 (Completely unrelated question)
  {
    category: 'Strict Fallback (Unrelated Subject)',
    question: 'Who won the football world cup in 2022?',
    expectedIntent: 'UNKNOWN',
    mustInclude: [
      "Sorry! I don't have this information about AQS Restaurant right now. Please contact our restaurant for assistance.",
    ],
  },
]

console.log('='.repeat(70))
console.log('RUNNING CHATBOT ACCURACY & INTEGRATION TESTS')
console.log('='.repeat(70))

let passed = 0
let failed = 0

for (const t of TEST_CASES) {
  const result = processChatQuery(t.question)
  let testPassed = true
  const failures = []

  if (result.intent !== t.expectedIntent) {
    testPassed = false
    failures.push(`Expected intent "${t.expectedIntent}", got "${result.intent}"`)
  }

  for (const phrase of t.mustInclude) {
    if (!result.reply.toLowerCase().includes(phrase.toLowerCase())) {
      testPassed = false
      failures.push(`Reply missing required text: "${phrase}"`)
    }
  }

  if (testPassed) {
    passed++
    console.log(`[PASS] ${t.category}: "${t.question}" -> Intent: ${result.intent}`)
  } else {
    failed++
    console.error(`[FAIL] ${t.category}: "${t.question}"`)
    failures.forEach((f) => console.error(`       - ${f}`))
    console.error(`       Reply received:\n       ${result.reply.replace(/\n/g, '\n       ')}`)
  }
}

console.log('='.repeat(70))
console.log(`TEST RESULTS: ${passed} PASSED / ${failed} FAILED (Total: ${TEST_CASES.length})`)
console.log('='.repeat(70))

if (failed > 0) {
  process.exit(1)
} else {
  console.log('ALL CHATBOT KNOWLEDGE BASE & STRICT RULE TESTS PASSED!')
}
