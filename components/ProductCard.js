import Link from 'next/link'

export default function ProductCard({ product }) {
  if (!product) return null

  return (
    <div className="bento-card">
      {/* 🧬 Enhanced Agentic JSON-LD (All Protocols Integration) */}
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
              "price": product.pricing.paid.replace(/[^0-9.]/g, '') || "0",
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: '800' }}>{product.name}</h3>
            {product.verified && (
              <span title="AP2 Verified Data" style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.625rem', fontWeight: '900', padding: '2px 6px', borderRadius: '4px', border: '1px solid #10b981' }}>
                VERIFIED
              </span>
            )}
          </div>
          <span className="badge-solid">{product.category}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="rating-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span style={{ fontSize: '0.875rem' }}>RATING: {product.rating} / 5</span>
            <span style={{ fontSize: '0.625rem', opacity: 0.7, fontWeight: '700' }}>{(product.review_count || 0).toLocaleString()} REVIEWS</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#4f46e5', fontWeight: '900', marginTop: '0.75rem' }}>TRUST SCORE: {product.trust_score || 0}%</div>
        </div>
      </div>

      <p style={{ 
        color: '#475569', 
        fontSize: '1.0625rem', 
        lineHeight: '1.8', 
        marginBottom: '2.5rem', 
        display: '-webkit-box', 
        WebkitLineClamp: '3', 
        WebkitBoxOrient: 'vertical', 
        overflow: 'hidden',
        minHeight: '5.4rem'
      }}>
        {product.description}
      </p>

      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>LATENCY PROFILE</div>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.875rem' }}>{product.attributes.latency.toUpperCase()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>API PROTOCOL</div>
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.875rem' }}>{product.attributes.api_type}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
        {product.best_for.slice(0, 3).map(tag => (
          <span key={tag} style={{ background: '#e0e7ff', color: '#4338ca', padding: '6px 12px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', borderRadius: '9999px' }}>
            {tag}
          </span>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <Link href={`/tool/${product.slug}`} className="btn-premium" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '1.25rem' }}>
          Explore Full Technical Specs
        </Link>
      </div>
    </div>
  )
}