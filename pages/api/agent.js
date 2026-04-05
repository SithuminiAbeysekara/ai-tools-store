import Groq from 'groq-sdk'
import products from '../../data/products.json'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
You are an expert software architect helping developers pick the right tools.

Here is the available tool catalog:
${catalogContext}

Developer requirement: "${requirement}"

Based ONLY on the tools in the catalog above, recommend the best tools for this requirement.
For each recommended tool explain:
1. Why you picked it
2. Which pricing tier fits
3. Any limitations to be aware of

Be specific and practical. If multiple tools fit, compare them.
`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1024
    })

    const recommendation = completion.choices[0].message.content

    res.status(200).json({
      requirement,
      recommendation,
      relevant_products: products.filter(p =>
        recommendation.toLowerCase().includes(p.name.toLowerCase())
      ).map(p => ({
        name: p.name,
        slug: p.slug,
        category: p.category,
        rating: p.rating
      }))
    })
  } catch (error) {
    console.error('Groq error:', error)
    res.status(500).json({ error: 'Agent failed', details: error.message })
  }
}