import Link from 'next/link'

export default function ProductCard({ product }) {
  if (!product) return null

  return (
    <div className="bento-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* 🧬 Enhanced Agentic JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "category": product.category,
            "gtin": product.gtin,
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
              "availability": "https://schema.org/InStock"
            },
            "additionalProperty": [
              { "@type": "PropertyValue", "name": "trust_score", "value": product.trust_score || 0 },
              { "@type": "PropertyValue", "name": "verification_status", "value": product.verified ? "VERIFIED" : "PENDING" },
              { "@type": "PropertyValue", "name": "pricing_model", "value": product.attributes?.pricing_model || "unknown" },
              { "@type": "PropertyValue", "name": "api_type", "value": product.attributes?.api_type || "unknown" },
              { "@type": "PropertyValue", "name": "latency_profile", "value": product.attributes?.latency || "unknown" },
              { "@type": "PropertyValue", "name": "open_source_status", "value": product.attributes?.open_source ? "YES" : "NO" },
              { "@type": "PropertyValue", "name": "category_merit_rank", "value": product.category_rank || 0 }
            ],
            "identifier": product.gtin || product.slug,
            "brand": { "@type": "Brand", "name": product.name }
          })
        }}
      />

      {/* Header Section */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span style={{ 
            fontSize: '0.65rem', 
            fontWeight: '900', 
            color: '#6366f1', 
            textTransform: 'uppercase', 
            letterSpacing: '0.15em',
            background: '#eef2ff',
            padding: '4px 10px',
            borderRadius: '6px'
          }}>
            {product.category}
          </span>
          {product.verified && (
            <span title="AP2 Verified Data" style={{ 
              background: '#10b981', 
              color: 'white', 
              fontSize: '0.6rem', 
              fontWeight: '900', 
              padding: '4px 8px', 
              borderRadius: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              ✓ Verified
            </span>
          )}
        </div>
        <h3 style={{ fontSize: '1.85rem', color: '#0f172a', fontWeight: '900', letterSpacing: '-0.03em', margin: '0 0 1rem 0' }}>
          {product.name}
        </h3>
        
        {/* Stats Row */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          padding: '0.75rem 1rem', 
          background: '#f8fafc', 
          borderRadius: '12px',
          border: '1px solid #f1f5f9'
        }}>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>Rating</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
              {product.rating} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>/ 5</span>
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>Reviews</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
              {(product.review_count || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ width: '1px', height: '24px', background: '#e2e8f0' }}></div>
          <div>
            <div style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: '900', textTransform: 'uppercase', marginBottom: '2px' }}>Trust</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#6366f1' }}>
              {product.trust_score || 0}%
            </div>
          </div>
        </div>
      </div>

      <p style={{ 
        color: '#475569', 
        fontSize: '1rem', 
        lineHeight: '1.7', 
        marginBottom: '2rem', 
        display: '-webkit-box', 
        WebkitLineClamp: '3', 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden',
        minHeight: '5.1rem'
      }}>
        {product.description}
      </p>

      {/* Attributes Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '0.75rem', 
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>Latency</div>
          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.85rem' }}>{product.attributes.latency.toUpperCase()}</div>
        </div>
        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>Protocol</div>
          <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.85rem' }}>{product.attributes.api_type}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
        {product.best_for?.slice(0, 2).map(tag => (
          <span key={tag} style={{ 
            background: 'white', 
            color: '#64748b', 
            padding: '5px 12px', 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            textTransform: 'uppercase', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <Link href={`/tool/${product.slug}`} className="btn-premium" style={{ 
          display: 'block', 
          textAlign: 'center', 
          textDecoration: 'none', 
          padding: '1.25rem',
          borderRadius: '12px',
          fontSize: '0.9rem',
          letterSpacing: '0.02em'
        }}>
          Technical Specification
        </Link>
      </div>
    </div>
  )
}