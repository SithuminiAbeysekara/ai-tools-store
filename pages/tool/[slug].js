import { getProducts, getProductBySlug } from '../../lib/db'
import { enrichToolData } from '../../lib/enrichment'
import Head from 'next/head'
import Link from 'next/link'

export default function ToolPage({ product }) {
  if (!product) return <div>Tool not found</div>

  return (
    <>
      <Head>
        <title>{`${product.name} — Architectural Spec`}</title>
        <meta name="description" content={product.description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              "name": product.name,
              "description": product.description,
              "url": `https://your-site.vercel.app/tool/${product.slug}`,
              "category": product.category,
              "gtin": product.gtin,
              "brand": { "@type": "Brand", "name": product.name },
              "identifier": product.slug,
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.review_count,
                "bestRating": "5"
              },
              "offers": {
                "@type": "Offer",
                "price": product.pricing?.paid?.replace(/[^0-9.]/g, '') || "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "url": product.website
              },
              "additionalProperty": [
                { "@type": "PropertyValue", "name": "trust_score", "value": product.trust_score },
                { "@type": "PropertyValue", "name": "verification_status", "value": product.verified ? "VERIFIED" : "PENDING" },
                { "@type": "PropertyValue", "name": "pricing_model", "value": product.attributes?.pricing_model },
                { "@type": "PropertyValue", "name": "api_type", "value": product.attributes?.api_type },
                { "@type": "PropertyValue", "name": "latency_profile", "value": product.attributes?.latency },
                { "@type": "PropertyValue", "name": "open_source", "value": product.attributes?.open_source ? "YES" : "NO" },
                { "@type": "PropertyValue", "name": "free_tier", "value": product.attributes?.free_tier ? "YES" : "NO" },
                { "@type": "PropertyValue", "name": "category_rank", "value": product.category_rank },
                { "@type": "PropertyValue", "name": "stability_status", "value": product.stability?.status || "stable" },
                { "@type": "PropertyValue", "name": "last_updated", "value": product.last_updated },
                { "@type": "PropertyValue", "name": "data_source", "value": product.data_source },
                { "@type": "PropertyValue", "name": "agent_summary", "value": product.agent_summary }
              ],
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `https://your-site.vercel.app/tool/${product.slug}`
              }
            })
          }}
        />
      </Head>

      <section className="premium-hero" style={{ textAlign: 'left', padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <Link href="/" style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '800', marginBottom: '3rem', display: 'inline-block', textDecoration: 'none', letterSpacing: '0.05em' }}>
            BACK TO ARCHITECTURAL CATALOG
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ flex: '1 1 600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <h1 style={{ color: 'white', fontSize: '4.5rem', margin: '0', letterSpacing: '-0.06em' }}>{product.name}</h1>
                {product.verified && (
                  <span style={{ background: '#10b981', color: 'white', fontSize: '0.75rem', fontWeight: '900', padding: '4px 10px', borderRadius: '4px' }}>VERIFIED HUB</span>
                )}
              </div>
              <p style={{ color: '#94a3b8', fontSize: '1.75rem', marginBottom: '3rem', maxWidth: '1000px', fontWeight: '600' }}>{product.tagline}</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <span className="badge-solid" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '9999px' }}>{product.category}</span>
                <span className="rating-badge" style={{ background: '#fef9c3', color: '#854d0e', padding: '10px 20px', borderRadius: '9999px' }}>RATING: {product.rating} / 5</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '5rem', fontWeight: '900', color: 'white', letterSpacing: '-0.08em', lineHeight: '1' }}>{product.trust_score}%</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '800', letterSpacing: '0.15em', marginTop: '0.5rem' }}>TRUST SCORE</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ maxWidth: '1000px', marginTop: '-4rem' }}>
        <main>
          {/* Stability & Freshness Status Bar */}
          <div style={{ background: '#0f172a', padding: '1.5rem 3rem', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem', fontWeight: '900', borderBottom: '1px solid #1e293b', letterSpacing: '0.1em' }}>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <span>STABILITY: <span style={{ color: '#10b981' }}>{product.stability?.status.toUpperCase() || "STABLE"}</span></span>
              <span>SINCE: {product.stability?.since || "2020"}</span>
              <span>BACKED BY: {product.stability?.backed_by || "Industry Standard"}</span>
            </div>
            <span>LAST PRICED: {product.freshness?.pricing_last_verified || product.last_updated}</span>
          </div>

          {/* Machine-Readable Identity Bar */}
          <div style={{ background: '#0f172a', padding: '1.5rem 3rem', borderRadius: '0 0 16px 16px', display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '800', marginBottom: '4rem', letterSpacing: '0.05em' }}>
            <span>GTIN: {product.gtin}</span>
            <span>DATA SOURCE: {product.data_source.toUpperCase()}</span>
            <span>IDENTIFIER: {product.slug}</span>
          </div>

          {/* Agent reasoning summary */}
          <section className="bento-card" style={{ marginBottom: '4rem', padding: '3rem', borderLeft: '6px solid #4f46e5' }}>
            <h2 style={{ fontSize: '1rem', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>Architect Reasoning Summary</h2>
            <p style={{ fontSize: '1.35rem', lineHeight: '1.8', color: '#0f172a', fontWeight: '600' }}>
              {product.agent_summary}
            </p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
            {/* Compatibility Matrix */}
            <div className="bento-card" style={{ padding: '3rem' }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Compatibility & Ecosystem</h3>
              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: '900', display: 'block', marginBottom: '0.75rem' }}>OPTIMIZED FOR</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(product.compatibility?.works_well_with || []).map(tool => (
                    <span key={tool} style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '800', borderRadius: '4px' }}>{tool.toUpperCase()}</span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: '900', display: 'block', marginBottom: '0.75rem' }}>COMMONLY PAIRED WITH</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(product.compatibility?.commonly_used_with || []).map(tool => (
                    <span key={tool} style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', padding: '4px 10px', fontSize: '0.75rem', fontWeight: '800', borderRadius: '4px' }}>{tool.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent FAQ */}
            <div className="bento-card" style={{ padding: '3rem' }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Architect Q&A (Verifiable)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(product.faq || []).map((faq, i) => (
                  <div key={i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.9375rem', marginBottom: '0.5rem' }}>Q: {faq.q}</div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.6' }}>A: {faq.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Logic Matrix */}
          <div className="bento-card" style={{ marginBottom: '4rem', padding: '3rem' }}>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Financial & Protocol Terms</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
              <div style={{ borderRight: '1px solid #e2e8f0', paddingRight: '3rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '700' }}>ENTRY THRESHOLD</span>
                <p style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: '0.5rem 0' }}>{product.pricing.free_tier}</p>
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '800' }}>FREEMIUM ENABLED: {product.attributes.free_tier ? "TRUE" : "FALSE"}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '700' }}>PROFESSIONAL TIER</span>
                <p style={{ fontSize: '2rem', fontWeight: '900', color: '#4f46e5', margin: '0.5rem 0' }}>{product.pricing.paid}</p>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '800' }}>BILLING STRATEGY: {product.pricing.model.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '5rem', flexWrap: 'wrap' }}>
            <div className="bento-card" style={{ padding: '3rem' }}>
              <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Core Capabilities</h3>
              <ul style={{ paddingLeft: '1.5rem', listStyle: 'square' }}>
                {product.features.map(f => (
                  <li key={f} style={{ marginBottom: '1.25rem', color: '#475569', fontSize: '1.125rem', fontWeight: '600' }}>{f}</li>
                ))}
              </ul>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              <div className="bento-card" style={{ padding: '3rem' }}>
                <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Ecosystem Alignment</h3>
                <ul style={{ paddingLeft: '1.5rem', listStyle: 'square' }}>
                  {product.best_for.map(tag => (
                    <li key={tag} style={{ marginBottom: '1.25rem', color: '#475569', fontSize: '1.125rem', fontWeight: '600' }}>{tag}</li>
                  ))}
                </ul>
              </div>
              <div className="bento-card" style={{ padding: '3rem' }}>
                <h3 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Discovery Connectivity</h3>
                <ul style={{ paddingLeft: '1.5rem', listStyle: 'square' }}>
                  {product.integrates_with.map(item => (
                    <li key={item} style={{ marginBottom: '1.25rem', color: '#475569', fontSize: '1.125rem', fontWeight: '600' }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <section style={{ marginBottom: '8rem' }}>
            <h3 style={{ marginBottom: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Category Merit Ranking (Global)</h3>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {product.alternatives.map(alt => (
                <Link key={alt} href={`/tool/${alt}`} className="bento-card" style={{ padding: '2rem 3rem', textDecoration: 'none', borderStyle: 'dashed' }}>
                  <span style={{ fontWeight: '900', color: '#4f46e5', fontSize: '1.25rem' }}>{alt.toUpperCase()}</span>
                </Link>
              ))}
            </div>
          </section>

          <footer style={{ display: 'flex', gap: '2rem', marginBottom: '10rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={product.website} target="_blank" rel="noopener noreferrer" className="btn-premium" style={{ textDecoration: 'none', padding: '1.75rem 4rem', fontSize: '1.25rem' }}>
              VISIT OFFICIAL WEBSITE
            </a>
            <a href={product.docs_url} target="_blank" rel="noopener noreferrer" className="btn-premium" style={{ background: 'white', color: '#0f172a', border: '3px solid #0f172a', textDecoration: 'none', padding: '1.75rem 4rem', fontSize: '1.25rem' }}>
              TECHNICAL SPECIFICATIONS
            </a>
          </footer>
        </main>
      </div>
    </>
  )
}

export async function getServerSideProps({ params }) {
  let product = await getProductBySlug(params.slug)
  
  if (!product) {
    return { notFound: true }
  }

  // 🚀 Dynamically Enrich with LLM if core metadata is missing
  product = await enrichToolData(product)

  return { props: { product } }
}