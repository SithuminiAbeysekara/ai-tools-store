import Groq from 'groq-sdk'
import { getProducts } from '../../lib/db'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const products = await getProducts()
  const { requirement } = req.body

  if (!requirement) {
    return res.status(400).json({ error: 'requirement is required' })
  }

  // Give agent the full catalog as context
  const catalogContext = products.map(p => `
    Name: ${p.name}
    Category: ${p.category}
    Description: ${p.description}
    Free Tier: ${p.pricing.free_tier}
    Paid: ${p.pricing.paid}
    Best For: ${(p.best_for || []).join(', ')}
    Rating: ${p.rating}/5
    Popularity: ${p.popularity}/100
    Integrates With: ${(p.integrates_with || []).join(', ')}
  `).join('\n---\n')

  const prompt = `
You are a Lead Software Architect. Help the user select the best tools from the catalog for their specific requirements.
CRITICAL INSTRUCTIONS:
1. Return your response ONLY in the following JSON format.
2. The "intro" field MUST be a single, concise sentence giving a high-level summary of the architecture. DO NOT put tool names or details in the intro.
3. All specific tool recommendations, "why" reasons, "pricing" tiers and "limitations" MUST go into the "tools" array.
4. If a tool isn't in the catalog but is essential, suggest the closest match and mention it in the "why".
5. Return your response in JSON format.

Format:
{
  "intro": "One expert summary sentence here.",
  "tools": [
    {
      "name": "Exact Product Name from Catalog",
      "why": "Detailed engineering reason for selection",
      "pricing": "Specific tier (e.g., Free Tier, Hobby, $20/mo)",
      "limitations": "Specific technical or budget constraints to note"
    }
  ]
}

Available catalog:
${catalogContext}

User requirement: "${requirement}"
`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1024
    })

    const parsedResponse = JSON.parse(completion.choices[0].message.content)

    res.status(200).json({
      requirement,
      intro: parsedResponse.intro,
      tools: parsedResponse.tools,
      relevant_products: products.filter(p =>
        parsedResponse.tools.some(t => t.name.toLowerCase().includes(p.name.toLowerCase()))
      ).map(p => ({
        name: p.name,
        slug: p.slug,
        category: p.category,
        rating: p.rating,
        description: p.description,
        trust_score: p.trust_score,
        attributes: p.attributes,
        pricing: p.pricing,
        category_rank: p.category_rank,
        best_for: p.best_for,
        verified: p.verified,
        review_count: p.review_count,
        gtin: p.gtin
      }))
    })
  } catch (error) {
    console.error('Groq error:', error)
    res.status(500).json({ error: 'Agent failed', details: error.message })
  }
}