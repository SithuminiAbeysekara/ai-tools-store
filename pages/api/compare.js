import products from '../../data/products.json'

export default function handler(req, res) {
  // Agentic Merit Comparison (Klarna Inspired)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Comparison-Protocol', 'Merit-Merit-Side-by-Side-1.0')
  
  const category = req.query.category ? req.query.category.toLowerCase() : null
  
  if (!category) {
    return res.status(400).json({ error: "Missing required query parameter: category" })
  }

  const comparisonSet = products.filter(p => p.category === category)
  
  if (comparisonSet.length === 0) {
    return res.status(404).json({ error: `No tools found in category: ${category}` })
  }

  // Rank by merit (rating + popularity)
  comparisonSet.sort((a, b) => {
    const scoreA = (a.rating * 0.7) + (a.popularity * 0.3)
    const scoreB = (b.rating * 0.7) + (b.popularity * 0.3)
    return scoreB - scoreA
  })

  // Return side-by-side comparison matrix
  res.status(200).json({
    category: category,
    total_in_set: comparisonSet.length,
    comparison_matrix: comparisonSet.map(p => ({
      name: p.name,
      slug: p.slug,
      merit_rating: p.rating,
      trust_score: p.trust_score,
      rank: p.category_rank,
      pricing: p.pricing,
      attributes: p.attributes,
      best_for: p.best_for,
      integrations: p.integrates_with.length
    }))
  })
}
