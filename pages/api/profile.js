import products from '../../data/products.json'

export default function handler(req, res) {
  // Agent Capability Discovery (V2 Reasoning Layer)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('X-Agent-Protocol', 'UCP-2.0-Reasoning-Layer')
  
  res.status(200).json({
    store_name: "Architect Discovery Store",
    version: "3.0-V2-Reasoning",
    protocol: "UCP-2.0",
    last_updated: "2026-04-01",
    capabilities: [
      "product_discovery",
      "merit-based_sorting",
      "category_filter",
      "trust_verification",
      "multi-product_comparison",
      "context-aware_personalization",
      "semantic_intent_resolution",
      "budget_optimization",
      "usecase_mapping",
      "stability_signals"
    ],
    categories: [...new Set(products.map(p => p.category))],
    total_products: products.length,
    sort_options: ["popularity", "rating", "trend", "trust", "merit"],
    endpoints: {
      discovery: "/api/products",
      comparison: "/api/compare",
      personalization: "/api/products/personalized",
      semantic: "/api/products/semantic",
      budget: "/api/budget",
      usecases: "/api/usecases",
      verification: "/api/products/[slug]/verify",
      agent_consultant: "/api/agent"
    },
    verification_authority: "official-architect-registry",
    intent_usage: "Merit-based ranking and demand forecasting"
  })
}
