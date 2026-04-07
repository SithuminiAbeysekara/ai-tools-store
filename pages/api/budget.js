import { getProducts } from '../../lib/db'

export default async function handler(req, res) {
  const products = await getProducts()
  const maxBudget = parseFloat(req.query.max) || 100
  const categoriesNeeded = req.query.needs ? req.query.needs.split(',') : []

  if (categoriesNeeded.length === 0) {
    return res.status(400).json({ error: "Missing required parameter: needs (comma-separated categories)" })
  }

  // Budget Optimization Core (V2 Strategy: Merit-Weighted-Cost)
  const recommendations = []
  let currentTotal = 0

  categoriesNeeded.forEach(cat => {
    const options = products.filter(p => p.category === cat.toLowerCase())
    
    // Sort by: Free Tier First, then Highest Rating
    options.sort((a, b) => {
      if (a.attributes?.free_tier && !b.attributes?.free_tier) return -1
      if (!a.attributes?.free_tier && b.attributes?.free_tier) return 1
      return b.rating - a.rating
    })

    const choice = options[0] // Pick the best/cheapest merit option
    if (choice) {
      const priceStr = (choice.pricing.paid || "0").replace(/[^0-9.]/g, '')
      const price = parseFloat(priceStr) || 0
      
      recommendations.push({
        category: cat,
        tool: choice.name,
        slug: choice.slug,
        cost: price,
        plan: choice.pricing.free_tier || choice.pricing.paid,
        merit: choice.rating
      })
      currentTotal += price
    }
  })

  const withinBudget = currentTotal <= maxBudget

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.status(200).json({
    budget_limit: maxBudget,
    total_cost: currentTotal.toFixed(2),
    within_budget: withinBudget,
    recommendations: recommendations,
    strategy: "Low-Cost-High-Merit",
    disclaimer: "Pricing based on verified snapshots. Actual cost may vary due to usage-based scaling."
  })
}
