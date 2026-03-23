// Zoe Fragrance — 28-Question Quiz Data
// Five blocks: Scent Memories, Existing Preferences, Aesthetic World, Occasion & Identity, Practical

export interface QuizQuestion {
  id: number
  block: string
  blockNumber: number
  type: 'text' | 'multiselect' | 'slider' | 'select' | 'textarea'
  question: string
  placeholder?: string
  options?: string[]
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
}

export const quizBlocks = [
  { number: 1, name: 'Scent Memories', description: 'The smells that shaped you' },
  { number: 2, name: 'Fragrance Preferences', description: 'What you already know you love' },
  { number: 3, name: 'Aesthetic World', description: 'The sensory landscape you inhabit' },
  { number: 4, name: 'Occasion & Identity', description: 'How this fragrance lives in your life' },
  { number: 5, name: 'Practical Details', description: 'The details that make it work on your skin' },
]

export const quizQuestions: QuizQuestion[] = [
  // Block 1: Scent Memories (6 questions)
  {
    id: 1,
    block: 'Scent Memories',
    blockNumber: 1,
    type: 'textarea',
    question: 'Describe a smell from your childhood that you loved. What was happening around you?',
    placeholder: 'e.g., My grandmother\'s kitchen when she was baking bread on Sunday mornings...',
  },
  {
    id: 2,
    block: 'Scent Memories',
    blockNumber: 1,
    type: 'textarea',
    question: 'Is there a place — a specific room, outdoor space, or city — whose smell you could live inside?',
    placeholder: 'e.g., A pine forest after rain, a old bookshop in Paris...',
  },
  {
    id: 3,
    block: 'Scent Memories',
    blockNumber: 1,
    type: 'textarea',
    question: 'What smell instantly changes your mood for the better?',
    placeholder: 'e.g., Fresh coffee, ocean air, clean laundry...',
  },
  {
    id: 4,
    block: 'Scent Memories',
    blockNumber: 1,
    type: 'textarea',
    question: 'Is there a person whose smell you associate with safety or love?',
    placeholder: 'e.g., My mother always smelled like jasmine and warm cotton...',
  },
  {
    id: 5,
    block: 'Scent Memories',
    blockNumber: 1,
    type: 'select',
    question: 'What season smells the most like you?',
    options: ['Spring', 'Summer', 'Autumn', 'Winter'],
  },
  {
    id: 6,
    block: 'Scent Memories',
    blockNumber: 1,
    type: 'textarea',
    question: 'What smell do you most associate with feeling like your best self?',
    placeholder: 'e.g., The smell of a garden at dusk, leather and wood...',
  },

  // Block 2: Existing Fragrance Preferences (6 questions)
  {
    id: 7,
    block: 'Fragrance Preferences',
    blockNumber: 2,
    type: 'textarea',
    question: 'Name up to three fragrances you currently own or have owned and loved.',
    placeholder: 'e.g., Chanel No. 5, Le Labo Santal 33, Maison Margiela By the Fireplace...',
  },
  {
    id: 8,
    block: 'Fragrance Preferences',
    blockNumber: 2,
    type: 'textarea',
    question: 'Name one fragrance you have tried and actively disliked.',
    placeholder: 'e.g., Angel by Mugler — too sweet and heavy for me...',
  },
  {
    id: 9,
    block: 'Fragrance Preferences',
    blockNumber: 2,
    type: 'multiselect',
    question: 'When you smell something and think "that\'s not for me," what is usually the quality that bothers you?',
    options: ['Too sweet', 'Too sharp', 'Too heavy', 'Too bland', 'Too synthetic', 'Too old-fashioned'],
  },
  {
    id: 10,
    block: 'Fragrance Preferences',
    blockNumber: 2,
    type: 'slider',
    question: 'What is your relationship with florals?',
    min: 1,
    max: 10,
    minLabel: 'Hate them',
    maxLabel: 'Love them',
  },
  {
    id: 11,
    block: 'Fragrance Preferences',
    blockNumber: 2,
    type: 'slider',
    question: 'What is your relationship with woods and smoke?',
    min: 1,
    max: 10,
    minLabel: 'Hate them',
    maxLabel: 'Love them',
  },
  {
    id: 12,
    block: 'Fragrance Preferences',
    blockNumber: 2,
    type: 'slider',
    question: 'What is your relationship with clean, fresh, or aquatic scents?',
    min: 1,
    max: 10,
    minLabel: 'Hate them',
    maxLabel: 'Love them',
  },

  // Block 3: Aesthetic World (6 questions)
  {
    id: 13,
    block: 'Aesthetic World',
    blockNumber: 3,
    type: 'multiselect',
    question: 'Choose three words that describe your ideal scent identity.',
    options: [
      'Warm', 'Cool', 'Dark', 'Bright', 'Earthy', 'Ethereal',
      'Sensual', 'Intellectual', 'Wild', 'Polished', 'Nostalgic',
      'Futuristic', 'Minimal', 'Opulent',
    ],
  },
  {
    id: 14,
    block: 'Aesthetic World',
    blockNumber: 3,
    type: 'textarea',
    question: 'Describe an image that captures the visual world you want your fragrance to inhabit.',
    placeholder: 'e.g., A misty Japanese garden at dawn, stone pathways, bamboo...',
  },
  {
    id: 15,
    block: 'Aesthetic World',
    blockNumber: 3,
    type: 'textarea',
    question: 'Name three songs or artists whose sound feels like your aesthetic.',
    placeholder: 'e.g., Nils Frahm, Bon Iver, Radiohead...',
  },
  {
    id: 16,
    block: 'Aesthetic World',
    blockNumber: 3,
    type: 'select',
    question: 'What time of day do you feel most like yourself?',
    options: ['Early morning', 'Late morning', 'Afternoon', 'Golden hour', 'Evening', 'Late night'],
  },
  {
    id: 17,
    block: 'Aesthetic World',
    blockNumber: 3,
    type: 'multiselect',
    question: 'What environment do you spend most of your ideal time in?',
    options: ['Forest', 'Ocean', 'City', 'Desert', 'Mountains', 'Interior spaces', 'Garden'],
  },
  {
    id: 18,
    block: 'Aesthetic World',
    blockNumber: 3,
    type: 'multiselect',
    question: 'What texture describes you?',
    options: ['Silk', 'Linen', 'Leather', 'Stone', 'Wood', 'Water', 'Velvet', 'Denim'],
  },

  // Block 4: Occasion & Identity (5 questions)
  {
    id: 19,
    block: 'Occasion & Identity',
    blockNumber: 4,
    type: 'select',
    question: 'Is this fragrance primarily for:',
    options: ['Everyday wear', 'Special occasions', 'A specific season', 'All of the above'],
  },
  {
    id: 20,
    block: 'Occasion & Identity',
    blockNumber: 4,
    type: 'select',
    question: 'Do you want people to notice your fragrance immediately, or discover it when they get close?',
    options: ['Notice immediately — I want presence', 'Discover when close — intimate and personal', 'Somewhere in between'],
  },
  {
    id: 21,
    block: 'Occasion & Identity',
    blockNumber: 4,
    type: 'select',
    question: 'Is this fragrance more about who you are or who you want to become?',
    options: ['Who I am right now', 'Who I want to become', 'Both — a bridge between the two'],
  },
  {
    id: 22,
    block: 'Occasion & Identity',
    blockNumber: 4,
    type: 'select',
    question: 'How would you describe your relationship with scent currently?',
    options: [
      'Never really thought about it',
      'Casually interested',
      'Actively collect fragrances',
      'Obsessed',
    ],
  },
  {
    id: 23,
    block: 'Occasion & Identity',
    blockNumber: 4,
    type: 'textarea',
    question: 'Is there a chapter of your life you want this fragrance to capture or evoke?',
    placeholder: 'e.g., The summer I lived in Barcelona, the year I found myself...',
  },

  // Block 5: Practical (5 questions)
  {
    id: 24,
    block: 'Practical Details',
    blockNumber: 5,
    type: 'select',
    question: 'Your skin type:',
    options: ['Dry', 'Normal', 'Oily', 'Combination'],
  },
  {
    id: 25,
    block: 'Practical Details',
    blockNumber: 5,
    type: 'select',
    question: 'Do you prefer your fragrance to last 2–3 hours and stay close, or 6–8 hours and project further?',
    options: ['2–3 hours, close and intimate', '4–5 hours, moderate presence', '6–8 hours, strong projection'],
  },
  {
    id: 26,
    block: 'Practical Details',
    blockNumber: 5,
    type: 'textarea',
    question: 'Are there any ingredients you know you react to or want to avoid?',
    placeholder: 'e.g., Strong musks give me headaches, allergic to certain florals...',
  },
  {
    id: 27,
    block: 'Practical Details',
    blockNumber: 5,
    type: 'text',
    question: 'What is the name you want to give this fragrance?',
    placeholder: 'Even a placeholder — you can change it later.',
  },
  {
    id: 28,
    block: 'Practical Details',
    blockNumber: 5,
    type: 'textarea',
    question: 'In one sentence: what should this fragrance make you feel?',
    placeholder: 'e.g., Like I\'m the most interesting person in the room and I know it.',
  },
]
