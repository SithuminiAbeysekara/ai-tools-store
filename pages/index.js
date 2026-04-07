import { useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getProducts } from '../lib/db'
import Head from 'next/head'
import Link from 'next/link'

// ─── Single Styled Tool Block ─────────────────────────────────────────────────
const labelColors = {
  'why': { bg: '#eff6ff', text: '#1d4ed8', label: 'WHY' },
  'pricing': { bg: '#f0fdf4', text: '#166534', label: 'PRICING TIER' },
  'limitations': { bg: '#fff7ed', text: '#9a3412', label: 'LIMITATIONS' },
}

// ─── Redesigned Premium Tool Block ──────────────────────────────────────────
function ToolBlock({ tool, index }) {
  const delayClass = `stagger-${(index % 4) + 1}`
  
  return (
    <div className={`animate-fade-in ${delayClass}`} style={{
      background: 'white',
      borderRadius: '24px',
      padding: '3rem',
      marginBottom: '2.5rem',
      position: 'relative',
      border: '1px solid #f1f5f9',
      boxShadow: 'var(--shadow-premium)'
    }}>
      {/* Index Badge */}
      <div style={{
        position: 'absolute', top: '2rem', right: '3rem',
        color: '#e2e8f0', fontSize: '3rem', fontWeight: '900',
        lineHeight: 1, userSelect: 'none', pointerEvents: 'none'
      }}>
        0{index + 1}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <span className="badge-architect">Architect Recommended</span>
        <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>
          {tool.name}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {[
          { key: 'why', label: 'STRATEGIC RATIONALE', className: 'badge-why' },
          { key: 'pricing', label: 'PRICING TIER', className: 'badge-pricing' },
          { key: 'limitations', label: 'TECHNICAL CONSTRAINTS', className: 'badge-limit' }
        ].map(item => (
          <div key={item.key} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '2rem', alignItems: 'baseline' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: '900', padding: '6px 12px',
              borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.1em',
              textAlign: 'center', width: '100%'
            }} className={item.className}>
              {item.label}
            </span>
            <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.05rem', margin: 0, fontWeight: '500' }}>
              {tool[item.key]}
            </p>
          </div>
        ))}
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
      (p.best_for && p.best_for.some(b => b.toLowerCase().includes(search.toLowerCase())))
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

  const matchedProducts = agentResult?.relevant_products || []

  return (
    <>
      <Head>
        <title>AI Tools Store — Premium Technology Catalog</title>
        <meta name="description" content="Discover and compare AI-friendly software tools for databases, email, payments, auth and storage. Optimized for AI agent discovery." />
      </Head>

      <section className="premium-hero">
        <h1 style={{ marginBottom: '1.5rem' }}>Architectural Discovery Store</h1>
        <p>A high-performance directory of developer tools, infrastructure, and services optimized for autonomous agents.</p>
      </section>

      <div className="container" style={{ paddingBottom: '8rem' }}>
        {/* ── Architect Consultant ── */}
        <div className="consultant-box shadow-premium" style={{ marginBottom: '6rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.04em', marginBottom: '1rem' }}>
              Architect Consultant
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.125rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
              State your technical requirements and receive a structured, machine-verified architecture plan.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <input
              type="text"
              className="input-premium"
              value={agentQuery}
              onChange={e => setAgentQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAgent()}
              placeholder="e.g. Build a SaaS with auth and payments on a $50 budget"
              style={{ flex: 1, height: '72px', fontSize: '1.25rem' }}
            />
            <button className="btn-premium" onClick={askAgent} disabled={loading} style={{ height: '72px', padding: '0 3.5rem', fontSize: '1.1rem' }}>
              {loading ? 'ANALYZING...' : 'GENERATE PLAN'}
            </button>
          </div>

          {/* ── Results Panel ── */}
          {agentResult && (
            <div style={{ marginTop: '5rem' }}>
              {agentResult.error ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '2rem', borderRadius: '16px', fontWeight: '600', textAlign: 'center' }}>
                  {agentResult.error}
                </div>
              ) : (
                <div className="animate-fade-in">
                  {/* Intro sentence Styled as Header */}
                  {agentResult.intro && (
                    <div style={{ 
                      marginBottom: '2rem',
                      padding: '1.5rem 2rem',
                      borderRadius: '16px',
                      background: '#f8fafc',
                      border: '1px dashed #cbd5e1',
                      textAlign: 'center'
                    }}>
                      <span style={{ color: '#4f46e5', fontWeight: '900', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
                        Architect's Executive Summary
                      </span>
                      <p style={{ color: '#1e293b', fontSize: '1.25rem', fontWeight: '700', margin: 0, lineHeight: '1.4', letterSpacing: '-0.01em' }}>
                        "{agentResult.intro}"
                      </p>
                    </div>
                  )}

                  {/* Tool recommendations header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', margin: 0 }}>Recommended Stack</h3>
                    <div style={{ flex: 1, height: '2px', background: '#f1f5f9' }}></div>
                  </div>

                  {/* Tool cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {agentResult.tools?.map((tool, i) => (
                      <ToolBlock key={i} tool={tool} index={i} />
                    ))}
                  </div>

                  {/* Full ProductCards for matched tools */}
                  {matchedProducts.length > 0 && (
                    <div style={{ marginTop: '6rem', paddingTop: '5rem', borderTop: '2px solid #f1f5f9' }}>
                      <div style={{ marginBottom: '3.5rem', textAlign: 'center' }}>
                        <span style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '900', 
                          color: '#4f46e5', 
                          letterSpacing: '0.2em', 
                          textTransform: 'uppercase',
                          background: '#eef2ff',
                          padding: '10px 24px',
                          borderRadius: '9999px'
                        }}>
                          Verified Technical Resource Links
                        </span>
                      </div>
                      <div className="tile-grid" style={{ marginTop: '0' }}>
                        {matchedProducts.map(product => (
                          <ProductCard key={product.slug} product={product} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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

export async function getServerSideProps() {
  const allProducts = await getProducts()
  return {
    props: {
      allProducts: allProducts || []
    }
  }
}