import { NextRequest, NextResponse } from 'next/server'
import { usesMockData } from '@/lib/supabase'
import { updateZoeSubmission } from '@/lib/zoe-mock-data'

const BRIEF_SYSTEM_PROMPT = `You are a master perfumer's assistant with deep knowledge of aroma chemistry, olfactory science, and the art of perfumery. You receive a customer's answers to a 28-question fragrance preference quiz and generate a precise creative brief for a perfumer.

Structure your response EXACTLY as follows:

OLFACTIVE FAMILY: [one of: Fresh Citrus / Fresh Aromatic / Floral / Soft Floral / Floral Oriental / Soft Oriental / Oriental / Woody Oriental / Mossy Woods / Dry Woods / Aromatic Fougère]

SUGGESTED NOTES:
— Top (3): [specific aroma chemicals or naturals, not just categories]
— Heart (3): [specific ingredients]
— Base (3): [specific ingredients]

EMOTIONAL TERRITORY: [one precise sentence — not generic]

REFERENCE FRAGRANCES: [two commercially available fragrances that share this profile, with brand and name]

AVOID: [3–5 specific things to avoid, chemical or aesthetic]

CONCENTRATION: 15–18% EDP in Perfumer's Alcohol

PERFUMER NOTE: [one paragraph with additional context to help the perfumer interpret this brief — draw on the customer's scent memories, music preferences, aesthetic identity, and desired emotional territory to paint a vivid picture of who this fragrance is for]

Be specific about chemistry. Name actual aroma chemicals (e.g., "Iso E Super" not "woody molecule", "Hedione" not "jasmine-like"). Reference the customer's specific answers. Do not use generic descriptions.`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { submission_id, answers, mood_board_notes } = body

    // Format answers for the prompt
    const answerText = Object.entries(answers)
      .map(([questionId, answer]) => `Q${questionId}: ${JSON.stringify(answer)}`)
      .join('\n')

    const moodText = mood_board_notes?.length
      ? `\nMood Board Notes: ${mood_board_notes.join(', ')}`
      : ''

    const userMessage = `Customer's quiz responses:\n${answerText}${moodText}`

    // Check if Anthropic API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY
    let brief: string

    if (apiKey) {
      // Call Claude API
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: BRIEF_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      brief = data.content[0].text
    } else {
      // Generate a high-quality mock brief when no API key
      brief = generateMockBrief(answers)
    }

    // Update the submission with the generated brief
    if (usesMockData) {
      updateZoeSubmission(submission_id, {
        generated_brief: brief,
        brief_status: 'ready',
      })
    } else {
      const { supabase } = await import('@/lib/supabase')
      await supabase!
        .from('zoe_quiz_submissions')
        .update({
          generated_brief: brief,
          brief_status: 'ready',
          updated_at: new Date().toISOString(),
        })
        .eq('id', submission_id)
    }

    return NextResponse.json({ brief, submission_id })
  } catch (err) {
    console.error('Brief generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate brief', brief: generateMockBrief({}) },
      { status: 200 } // Return 200 with fallback brief
    )
  }
}

function generateMockBrief(answers: Record<string, unknown>): string {
  // Determine olfactive family based on answers
  const florals = (answers[10] as number) || 5
  const woods = (answers[11] as number) || 5
  const fresh = (answers[12] as number) || 5

  let family = 'Woody Oriental'
  let topNotes = 'Bergamot, Pink Pepper, Cardamom'
  let heartNotes = 'Iris Root (Orris Butter), Violet Leaf Absolute, Hedione'
  let baseNotes = 'Vetiver, Iso E Super, Ambroxan'
  let reference1 = 'Terre d\'Hermès by Hermès'
  let reference2 = 'Bleu de Chanel by Chanel'
  let avoid = 'Excessive sweetness, gourmand notes, heavy white florals, synthetic aquatic accords, overt fruity notes'

  if (florals > 7) {
    family = 'Soft Floral'
    topNotes = 'Bergamot, Lychee, Pink Pepper'
    heartNotes = 'Rose Absolute, Peony Accord, Hedione HC'
    baseNotes = 'White Musk (Galaxolide), Cashmeran, Sandalwood (Javanol)'
    reference1 = 'Miss Dior Blooming Bouquet by Dior'
    reference2 = 'Delina by Parfums de Marly'
    avoid = 'Heavy orientals, smoky notes, aggressive musks, animalic bases, overly green accords'
  } else if (fresh > 7) {
    family = 'Fresh Aromatic'
    topNotes = 'Grapefruit, Basil Grand Vert, Watery Accord (Calone)'
    heartNotes = 'White Tea Accord, Violet Leaf, Dihydromyrcenol'
    baseNotes = 'Cedarwood (Virginian), White Musk, Ambroxan'
    reference1 = 'Acqua di Giò Profondo by Armani'
    reference2 = 'Replica Sailing Day by Maison Margiela'
    avoid = 'Heavy orientals, dense florals, sweet vanillic bases, powdery musks, animalic notes'
  } else if (woods > 7) {
    family = 'Dry Woods'
    topNotes = 'Black Pepper, Elemi, Juniper Berry'
    heartNotes = 'Guaiac Wood, Patchouli Heart, Cypriol (Nagarmotha)'
    baseNotes = 'Vetiver (Haitian), Oud Accord (Synthetics), Labdanum Absolute'
    reference1 = 'Tam Dao by Diptyque'
    reference2 = 'Encre Noire by Lalique'
    avoid = 'Sweet florals, fruity notes, aquatic accords, powdery musks, citrus-forward openings'
  }

  const season = (answers[5] as string) || 'Autumn'
  const feeling = (answers[28] as string) || 'confident and quietly magnetic'

  return `OLFACTIVE FAMILY: ${family}

SUGGESTED NOTES:
— Top (3): ${topNotes}
— Heart (3): ${heartNotes}
— Base (3): ${baseNotes}

EMOTIONAL TERRITORY: The feeling of ${feeling} — ${season.toLowerCase()} light through old glass, the moment before you speak and everyone is already listening.

REFERENCE FRAGRANCES: ${reference1} / ${reference2}

AVOID: ${avoid}

CONCENTRATION: 17% EDP in Perfumer's Alcohol (SDA 40-B)

PERFUMER NOTE: This customer is drawn to ${family.toLowerCase()} territory with a clear preference for sophistication over mass appeal. Their scent memories suggest an aesthetic rooted in natural materials, lived-in spaces, and emotional depth rather than performative luxury. The fragrance should feel discovered rather than worn — something that reveals itself slowly across the day and rewards proximity. Build the drydown with particular attention to longevity on the customer's skin type, using modern molecular fixatives (Ambroxan, Iso E Super) to extend projection without adding sweetness. The overall impression should be of someone who has always smelled this way — as though the fragrance grew from their skin rather than being applied to it.`
}
