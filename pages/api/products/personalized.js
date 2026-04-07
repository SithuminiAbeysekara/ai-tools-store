import { getProducts } from '../../../lib/db'

export default async function handler(req, res) {
  const products = await getProducts()
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { context } = req.body

  if (!context) {
    return res.status(400).json({ error: 'Context Required' })
  }

  // Identity and Context Filtering (Stripe/UCP Inspired)
  let results = [...products]

  // 1. Filter by budget
  if (context.budget_limit) {
    results = results.filter(p => {
      const priceStr = p.pricing.paid.replace(/[^0-9.]/g, '')
      const price = parseFloat(priceStr) || 0
      return price <= context.budget_limit
    })
  }

  // 2. Rank by stack alignment
  if (context.stack && Array.isArray(context.stack)) {
    results.sort((a, b) => {
      const matchA = a.integrates_with.filter(s => context.stack.includes(s)).length
      const matchB = b.integrates_with.filter(s => context.stack.includes(s)).length
      return matchB - matchA
    })
  }

  // 3. Stage-specific Merit
  if (context.stage === 'startup') {
    results = results.sort((a, b) => {
      const scoreA = a.attributes.free_tier ? 10 : 0
      const scoreB = b.attributes.free_tier ? 10 : 0
      return scoreB - scoreA
    })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Agent-Context', 'Ranked-Merit-Persona-1.0')

  res.status(200).json({
    status: 'success',
    context_applied: {
      budget: context.budget_limit || 'unlimited',
      stack: context.stack || 'general',
      stage: context.stage || 'any'
    },
    results: results.slice(0, 10)
  })
}
