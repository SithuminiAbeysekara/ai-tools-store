import products from '../../data/products.json'

export default function handler(req, res) {
  // Agent Discovery Logging
  console.log({
    timestamp: new Date().toISOString(),
    agent: req.headers['user-agent'],
    intent: req.query,
    ip_hash: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  })

  // 🧬 V2 COMPOSITE SCORING LOGIC
  const calculateCompositeScore = (p) => {
    const weights = {
      quality: 0.4,
      popularity: 0.3,
      value: 0.2, // Pricing competitiveness
      dx: 0.1     // Developer experience / API maturity
    }

    const quality = (p.rating / 5) * 100
    const popularity = p.popularity
    const value = p.attributes?.free_tier ? 100 : 70
    const dx = p.attributes?.api_type === 'REST' ? 100 : 80

    return (
      quality * weights.quality +
      popularity * weights.popularity +
      value * weights.value +
      dx * weights.dx
    ).toFixed(2)
  }

  let results = products.map(p => ({
    ...p,
    merit_score: calculateCompositeScore(p)
  }))

  // --- MERIT-BASED FILTERING ---

  if (req.query.category) {
    results = results.filter(p => 
      p.category === req.query.category.toLowerCase()
    )
  }

  if (req.query.free_tier === 'true') {
    results = results.filter(p => p.attributes?.free_tier === true)
  }

  if (req.query.updated_after) {
    const since = new Date(req.query.updated_after)
    results = results.filter(p => new Date(p.last_updated) >= since)
  }

  // --- MERIT-BASED SORTING ---

  const sort = req.query.sort || 'merit'

  if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating)
  } else if (sort === 'merit') {
    results.sort((a, b) => b.merit_score - a.merit_score)
  } else if (sort === 'trust') {
    results.sort((a, b) => b.trust_score - a.trust_score)
  } else {
    results.sort((a, b) => b.popularity - a.popularity)
  }

  // --- PROTOCOL RESPONSE ---

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Discovery-Protocol', 'Agentic-Merit-2.0')
  
  res.status(200).json({
    status: "success",
    protocol: "Agentic-Discovery-V2",
    metadata: {
      total_count: products.length,
      filtered_count: results.length,
      categories: [...new Set(products.map(p => p.category))],
      timestamp: new Date().toISOString()
    },
    products: results
  })
}