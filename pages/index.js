import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import products from '../data/products.json'
import Head from 'next/head'
import Link from 'next/link'

// ─── Recommendation Text Parser ───────────────────────────────────────────────
function parseRecommendation(raw) {
  const clean = raw.replace(/\*\*/g, '').replace(/\*/g, '')
  const lines = clean.split('\n').map(l => l.trim()).filter(Boolean)

  let intro = ''
  const tools = []
  let current = null

  for (const line of lines) {
    const toolMatch = line.match(/^(\d+)\.\s+(.+?):\s*$/)
    const bulletMatch = line.match(/^[-–]\s+([^:]+):\s*(.*)/)
    const continuationMatch = !toolMatch && !bulletMatch && !line.match(/^\d+\./)

    if (toolMatch) {
      if (current) tools.push(current)
      current = { index: toolMatch[1], name: toolMatch[2].trim(), sections: [] }
    } else if (current && bulletMatch) {
      current.sections.push({ label: bulletMatch[1].trim(), content: bulletMatch[2].trim() })
    } else if (current && current.sections.length > 0 && continuationMatch) {
      const last = current.sections[current.sections.length - 1]
      last.content += ' ' + line
    } else if (!current) {
      intro += (intro ? ' ' : '') + line
    }
  }
  if (current) tools.push(current)

  return { intro, tools }
}

// ─── Single Styled Tool Block ─────────────────────────────────────────────────
const labelColors = {
  'Why': { bg: '#eff6ff', text: '#1d4ed8' },
  'Pricing Tier': { bg: '#f0fdf4', text: '#166534' },
  'Limitations': { bg: '#fff7ed', text: '#9a3412' },
}

function ToolBlock({ tool, index }) {
  const color = labelColors

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '2rem 2.5rem',
      marginBottom: '1.5rem',
      position: 'relative',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      {/* Index badge */}
      <div style={{
        position: 'absolute', top: '-14px', left: '2rem',
        background: '#4f46e5', color: 'white',
        width: '28px', height: '28px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: '900'
      }}>{tool.index}</div>

      <h3 style={{ fontSize: '1.375rem', fontWeight: '900', color: '#0f172a', marginBottom: '1.5rem', marginTop: '0.25rem' }}>
        {tool.name}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tool.sections.map((s, i) => {
          const palette = color[s.label] || { bg: '#f8fafc', text: '#475569' }
          return (
            <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{
                background: palette.bg, color: palette.text,
                fontSize: '0.7rem', fontWeight: '800', padding: '4px 10px',
                borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.06em',
                whiteSpace: 'nowrap', marginTop: '2px', flexShrink: 0
              }}>{s.label}</span>
              <p style={{ color: '#334155', lineHeight: '1.75', fontSize: '0.9375rem', margin: 0 }}>
                {s.content}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home({ allProducts }) {
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [agentQuery, setAgentQuery] = useState('')
  const [agentResult, setAgentResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const categories = ['all', ...new Set(allProducts.map(p => p.category))]

  const filtered = allProducts.filter(p => {
    const matchCategory = category === 'all' || p.category === category
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.best_for.some(b => b.toLowerCase().includes(search.toLowerCase()))
    return matchCategory && matchSearch
  })

  async function askAgent() {
    if (!agentQuery.trim()) return
    setLoading(true)
    setAgentResult(null)
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirement: agentQuery })
      })
      const data = await res.json()
      setAgentResult(data)
    } catch (err) {
      setAgentResult({ error: 'Failed to get recommendation' })
    }
    setLoading(false)
  }

  // Match full product data for relevant products
  const matchedProducts = agentResult?.relevant_products?.length > 0
    ? allProducts.filter(p => agentResult.relevant_products.some(rp => rp.slug === p.slug))
    : []

  const parsed = agentResult?.recommendation
    ? parseRecommendation(agentResult.recommendation)
    : null

  return (
    <>
      <Head>
        <title>AI Tools Store — Premium Technology Catalog</title>
        <meta name="description" content="Discover and compare AI-friendly software tools for databases, email, payments, auth and storage. Optimized for AI agent discovery." />
      </Head>

      <section className="premium-hero">
        <h1>Architectural Discovery Store</h1>
        <p>A high-performance directory of developer tools, infrastructure, and services for building full-stack applications into the future.</p>
      </section>

      <div className="container" style={{ paddingBottom: '8rem' }}>
        {/* ── Architect Consultant ── */}
        <div className="consultant-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Architect Consultant</h2>
          </div>
          <p style={{ color: '#64748b', fontSize: '1.125rem', marginBottom: '2rem' }}>
            State your project requirements and receive curated tool recommendations from our catalog.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              className="input-premium"
              value={agentQuery}
              onChange={e => setAgentQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAgent()}
              placeholder="e.g. Build a SaaS with auth and payments on a $50 budget"
              style={{ flex: 1 }}
            />
            <button className="btn-premium" onClick={askAgent} disabled={loading}>
              {loading ? 'Thinking...' : 'Consult Architect'}
            </button>
          </div>

          {/* ── Results Panel ── */}
          {agentResult && (
            <div style={{ marginTop: '2.5rem' }}>
              {agentResult.error ? (
                <p style={{ color: '#ef4444', fontWeight: '600' }}>{agentResult.error}</p>
              ) : (
                <>
                  {/* Intro sentence */}
                  {parsed?.intro && (
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: '600', marginBottom: '2rem', letterSpacing: '0.01em' }}>
                      {parsed.intro}
                    </p>
                  )}

                  {/* Tool cards */}
                  {parsed?.tools.map((tool, i) => (
                    <ToolBlock key={i} tool={tool} index={i} />
                  ))}

                  {/* Full ProductCards for matched tools */}
                  {matchedProducts.length > 0 && (
                    <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '2px solid #e2e8f0' }}>
                      <div style={{ marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                          Explore Recommended Tools
                        </span>
                      </div>
                      <div className="tile-grid">
                        {matchedProducts.map(product => (
                          <ProductCard key={product.slug} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Catalog Section ── */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ marginBottom: '1.5rem' }}>Verified Technical Sources</h2>
              <div className="search-pill-group">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`pill-btn ${category === cat ? 'active' : ''}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ flex: '1', minWidth: '320px', maxWidth: '400px', marginBottom: '2rem' }}>
              <input
                type="text"
                className="input-premium"
                style={{ padding: '0.875rem 1.5rem', fontSize: '1rem' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search resources, tags, stacks..."
              />
            </div>
          </div>

          <div className="tile-grid">
            {filtered.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>

        <footer style={{ marginTop: '5rem', padding: '4rem 0', borderTop: '2px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: '700', letterSpacing: '0.05em' }}>
            Powered by Automated Metadata Protocols: JSON-LD Schema / XML Sitemap / Robots.txt
          </p>
        </footer>
      </div>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      allProducts: products
    }
  }
}