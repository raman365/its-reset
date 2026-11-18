// All site copy lives here so it can be edited without touching layout code.
// Wording marked "from itsreset.com" is the brand's own. Everything else is
// written to match that voice: plain, warm, no hype.

export const SHOP = 'https://itsreset.com'

export const links = {
  journal: `${SHOP}/blogs/news`,
  contact: `${SHOP}/pages/contact`,
  privacy: `${SHOP}/policies/privacy-policy`,
  terms: `${SHOP}/policies/terms-of-service`,
  refunds: `${SHOP}/policies/refund-policy`,
  instagram: 'https://www.instagram.com/itsreset_/',
  tiktok: 'https://www.tiktok.com/@itsreset.com',
  email: 'hello@itsreset.com',
}

export const nav = [
  { label: 'The cream', href: '#cream' },
  { label: 'Inside', href: '#inside' },
  { label: 'Barrier lab', href: '#lab' },
  { label: 'Ritual', href: '#ritual' },
  { label: 'Story', href: '#story' },
  { label: 'Journal', href: '#journal' },
]

export const hero = {
  eyebrowLeft: ['Ceramide face cream', '50ml'],
  eyebrowRight: ['Launching soon', 'Made in the UK'],
  kicker: 'Take care. Start again.',
  intro: 'BARRIER is the first cream from re•set, inspired by the Balm of Gilead.',
  scroll: 'Scroll to open',
  // from itsreset.com
  title: 'A ceramide face cream inspired by history’s most legendary balm',
  lede:
    'For centuries the Balm of Gilead was legend, a rare balm so prized it became a symbol of care itself. re•set brings that philosophy into BARRIER, a ceramide face cream that strengthens your skin barrier and locks in moisture after long days, hard workouts, and everyday stress.',
  ledeShort:
    'BARRIER is a ceramide face cream that strengthens your skin barrier and locks in moisture after long days, hard workouts and everyday stress.',
}

export const marquee = [
  'Hydrate',
  'Protect',
  'Reset',
  'Ceramide formulated',
  'Fragrance free',
  'Made for daily use',
  'Made in the UK',
  'Cruelty free',
  '50ml frosted glass',
]

export const cream = {
  eyebrow: 'The cream',
  // from itsreset.com
  title: 'A face cream built for how hard you actually live',
  sub: 'BARRIER pairs an old idea with modern skincare: ceramides, known to strengthen the skin barrier, in a lightweight cream made for real, daily wear.',
  benefits: [
    {
      title: 'Strengthens the skin barrier',
      body: 'With ceramides to help lock in moisture after workouts, weather, and long days.',
    },
    {
      title: 'Made to be used often',
      body: 'A daily moisturiser, not an occasional treatment.',
    },
    {
      title: 'Fragrance free',
      body: 'Formulated to be gentle enough for daily use, without added fragrance.',
    },
  ],
  hotspots: [
    { x: 50, y: 14, title: 'Frosted glass jar', body: '50ml of cream in frosted glass. Small enough to live in your gym bag.' },
    { x: 22, y: 52, title: 'Ceramide NP', body: 'A stable liquid ceramide, known to strengthen the skin barrier.' },
    { x: 80, y: 60, title: 'Hydrate. Protect. Reset.', body: 'Three jobs, one jar. Nothing else on the label to decode.' },
    { x: 46, y: 84, title: 'Fragrance free', body: 'No added fragrance, so it stays gentle enough for every day.' },
  ],
}

export type Ingredient = {
  no: string
  name: string
  latin: string
  origin: string
  knownFor: string
  body: string
  art: 'ceramide' | 'butter' | 'centella' | 'kakadu'
}

export const ingredients: Ingredient[] = [
  {
    no: '01',
    name: 'Ceramide NP',
    latin: 'Once known as ceramide 3',
    origin: 'One of the lipids found naturally in your skin’s outer layer',
    knownFor: 'Barrier and moisture',
    body: 'A stable liquid ceramide, known to strengthen the skin barrier and help lock in moisture.',
    art: 'ceramide',
  },
  {
    no: '02',
    name: 'Shea & cocoa butter',
    latin: 'Butyrospermum parkii · Theobroma cacao',
    origin: 'Shea trees of West Africa and the cocoa bean',
    knownFor: 'Softness',
    body: 'Rich, nourishing butters for soft, comfortable skin.',
    art: 'butter',
  },
  {
    no: '03',
    name: 'Centella asiatica',
    latin: 'Tiger grass, or cica',
    origin: 'A small creeping plant from the wetlands of Asia',
    knownFor: 'A skincare classic',
    body: 'Also known as gotu kola, a plant extract long used in skincare.',
    art: 'centella',
  },
  {
    no: '04',
    name: 'Kakadu plum',
    latin: 'Terminalia ferdinandiana',
    origin: 'Native to the woodlands of northern Australia',
    knownFor: 'Antioxidant',
    body: 'An Australian fruit extract known as a powerful antioxidant.',
    art: 'kakadu',
  },
]

export const lab = {
  eyebrow: 'The barrier lab',
  title: 'Your skin is a wall. Ceramides are the mortar.',
  // adapted from the re•set journal
  body: [
    'Think of the surface of your skin like a brick wall. Skin cells are the bricks, and ceramides are a big part of the mortar holding them together.',
    'That wall keeps moisture in and everyday irritants out. Pile on the stress and it starts to give. Try it.',
  ],
  stressors: ['Hard workout', 'Cold commute', 'Central heating', 'Hot showers', 'Long day'],
  apply: 'Apply BARRIER',
  reset: 'Start again',
  note: 'An illustration of the idea, not a clinical model.',
  states: {
    calm: { label: 'Comfortable', body: 'Moisture stays in. Everyday irritants stay out.' },
    tight: { label: 'Feeling tight', body: 'A few gaps are opening up and moisture is finding a way out.' },
    dry: { label: 'Dry and uncomfortable', body: 'The mortar is wearing thin. Your barrier could do with some support.' },
    sealed: { label: 'Topped up', body: 'Ceramides help strengthen the barrier and lock moisture back in.' },
  },
}

export type RitualStep = {
  id: string
  label: string
  time: string
  t: number
  title: string
  steps: { name: string; body: string }[]
  tip: string
}

// adapted from "A simple skincare routine for busy, active days"
export const ritual: { eyebrow: string; title: string; sub: string; moments: RitualStep[] } = {
  eyebrow: 'The ritual',
  title: 'Three small resets in a busy day',
  sub: 'You don’t need a ten step routine. You need a few basics done every day. Drag the sun, or pick a moment.',
  moments: [
    {
      id: 'morning',
      label: 'Morning',
      time: '07:00',
      t: 1 / 17,
      title: 'Under two minutes',
      steps: [
        { name: 'Cleanse', body: 'Rinse with lukewarm water or a gentle cleanser. Very hot water can leave skin feeling tight.' },
        { name: 'Moisturise', body: 'Smooth BARRIER over your face and neck in gentle upward motions.' },
        { name: 'Protect', body: 'Heading outside? Finish with an SPF.' },
      ],
      tip: 'Consistency beats complexity. Two products every day do more than ten used now and then.',
    },
    {
      id: 'training',
      label: 'After training',
      time: '18:30',
      t: 12.5 / 17,
      title: 'Sweat, shower, reset',
      steps: [
        { name: 'Rinse', body: 'Wash your face after the session. Sweat, showers and towels can all leave skin dry.' },
        { name: 'Pat dry', body: 'Pat, don’t rub.' },
        { name: 'Reapply', body: 'A thin layer of BARRIER while skin is still fresh.' },
      ],
      tip: 'Keep a jar in your gym bag so it actually happens.',
    },
    {
      id: 'evening',
      label: 'Evening',
      time: '22:30',
      t: 16.5 / 17,
      title: 'Wash the day off',
      steps: [
        { name: 'Cleanse', body: 'Clear away the day.' },
        { name: 'Moisturise', body: 'A slightly more generous layer of BARRIER before bed.' },
      ],
      tip: 'Drink water and get some sleep. Not glamorous, but your skin notices.',
    },
  ],
}

export const story = {
  eyebrow: 'The story',
  // from itsreset.com
  quote: 'Is there no balm in Gilead; is there no physician there? Why then is the health of my people not restored?',
  cite: 'Jeremiah 8:22. The words that inspired re•set.',
  what: {
    title: 'What was the Balm of Gilead?',
    body: 'In the ancient world, Gilead, a region east of the Jordan River, was famous for a rare, fragrant balm. It was so valued that merchants carried it across the region as one of the most precious goods of its time. Over the centuries the phrase came to stand for care and comfort itself.',
  },
  why: {
    title: 'Why it inspired re•set',
    body: 'God is the foundation of re•set and the guidance behind it, from the name to the formula. The Balm of Gilead is a reminder that looking after yourself isn’t a luxury. It’s worth doing well, every day, even when life is busy.',
  },
  timeline: [
    { when: 'Genesis 37:25', body: 'A caravan comes down from Gilead, camels loaded with spices, balm and myrrh, bound for Egypt.' },
    { when: 'Ezekiel 27:17', body: 'Balm is listed among the goods traded in the busy markets of Tyre.' },
    { when: 'Jeremiah 8:22', body: 'The prophet asks the question that started all this: is there no balm in Gilead?' },
    { when: '19th century', body: '“There is a balm in Gilead” becomes a spiritual sung across America, an answer to that old question.' },
    { when: 'Now', body: 're•set takes the idea of a trusted, everyday balm and builds it with modern skincare. BARRIER, made in the UK.' },
  ],
}

// from itsreset.com
export const founder = {
  eyebrow: 'Why re•set',
  pull: 'I was never really into skincare. I’d use whatever was there and get on with my day.',
  body: [
    'But with long days, training and a life that rarely slows down, I wanted something made for the way I actually live.',
    'God is the foundation of re•set and the guidance behind it, from the name to the formula. BARRIER is where it starts: a simple, fragrance-free cream to support your skin through busy, active days.',
  ],
  sign: 'Founder, re•set',
}

export type Article = {
  title: string
  excerpt: string
  date: string
  minutes: number
  href: string
  cover: 'gilead' | 'routine' | 'ceramide'
}

// Live articles on the re•set journal
export const journal: Article[] = [
  {
    title: 'The Balm of Gilead: the story behind re•set',
    excerpt: 'For centuries the Balm of Gilead was legend, a rare balm so prized it became a symbol of care itself. Here’s why it inspired re•set.',
    date: '28 Oct 2026',
    minutes: 3,
    href: `${SHOP}/blogs/news/balm-of-gilead-story-behind-reset`,
    cover: 'gilead',
  },
  {
    title: 'A simple skincare routine for busy, active days',
    excerpt: 'Training, long hours, a family to juggle. You don’t need a 10 step routine. You need a few basics done consistently.',
    date: '22 Oct 2026',
    minutes: 3,
    href: `${SHOP}/blogs/news/simple-skincare-routine-busy-active-days`,
    cover: 'routine',
  },
  {
    title: 'What does a ceramide face cream actually do?',
    excerpt: 'Ceramides are everywhere right now. Here’s a simple, no jargon guide to what they are and why your barrier likes them.',
    date: '14 Oct 2026',
    minutes: 4,
    href: `${SHOP}/blogs/news/what-does-a-ceramide-face-cream-do`,
    cover: 'ceramide',
  },
]

export const waitlist = {
  eyebrow: 'Early access',
  // from itsreset.com
  title: 'Be first to try it',
  body: 're•set hasn’t launched yet. Join the waitlist for early access before we open to everyone else, plus a founding member discount on launch day.',
  perks: ['Early access before everyone else', 'A founding member discount on launch day', 'Pricing shared with the list first'],
  note: 'No spam. Just early access when we launch.',
  cta: 'Get access',
  success: (name: string) => (name ? `You’re on the list, ${name}.` : 'You’re on the list.'),
  successBody: 'We’ll be in touch before launch day with early access and your founding member discount.',
}

export const faq = [
  // from itsreset.com
  { q: 'When does BARRIER launch?', a: 'Very soon. Join the waitlist and you’ll be the first to know, with early access before we open to everyone else.' },
  { q: 'How much will it cost?', a: 'We’ll share pricing with the waitlist before launch day, along with your founding member discount.' },
  { q: 'How do I use it?', a: 'Smooth a small amount over your face and neck in gentle upward motions, morning and evening, or whenever your skin needs it.' },
  { q: 'Is it fragrance free?', a: 'Yes. BARRIER is made without added fragrance, so it’s gentle enough for everyday use.' },
  { q: 'What size is it?', a: 'Each frosted glass jar holds 50ml.' },
  { q: 'Can I use it after the gym?', a: 'That’s what it was made for. Rinse your face after your session, pat dry and smooth on a thin layer.' },
  { q: 'Where is it made?', a: 'In the UK. BARRIER is cruelty free and made for daily use.' },
]
