import Groq from 'groq-sdk'
import products from '../../../data/products.json'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { query } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Query Required' })
  }

  // Semantic Intent Resolution (V2 Agentic Layer)
  const productContext = products.map(p => ({
    id: p.slug,
    name: p.name,
    category: p.category,
    best_for: p.best_for,
    summary: p.agent_summary
  }))

  const prompt = `
    Resolve the following low-level user intent into a list of matching product slugs from the catalog.
    Return ONLY a JSON array of slugs. Use the summary and "best_for" fields to match intent.
    
    INTENT: "${query}"
    CATALOG: ${JSON.stringify(productContext)}
  `

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: "json_object" }
    })

    const result = JSON.parse(completion.choices[0].message.content)
    const slugs = result.slugs || result.results || []
    
    const matches = products.filter(p => slugs.includes(p.slug))

    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(200).json({
      intent: query,
      matches,
      protocol: "V2-Semantic-Resolution-1.0"
    })
  } catch (error) {
    res.status(500).json({ error: 'Semantic resolution failed', details: error.message })
  }
}
