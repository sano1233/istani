import React, { useState, useEffect } from 'react';

const ProductCard = ({ title, description, price, cta, image, affiliateLink, format, accessType, deliveryNote, onError }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => { setImageError(true); if (onError) onError(`Image failed to load: ${title}`); };

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', margin: '16px', padding: '16px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', maxWidth: '320px', minHeight: '460px', textAlign: 'center', backgroundColor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', width: '100%', height: '200px', backgroundColor: imageError ? '#f0f0f0' : '#e0e0e0', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
        {!imageError ? <img src={image} alt={title} onLoad={handleImageLoad} onError={handleImageError} style={{ width: '100%', height: '100%', objectFit: 'cover', display: imageLoaded ? 'block' : 'none' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '12px' }}>Image not available</div>}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: '#e3f2fd', color: '#0d47a1', fontSize: '10px', fontWeight: '600' }}>Digital • Instant access</span>
        {format && <span style={{ padding: '2px 8px', borderRadius: '999px', backgroundColor: '#f3e5f5', color: '#4a148c', fontSize: '10px', fontWeight: '600' }}>{format}</span>}
      </div>
      <h3 style={{ margin: '8px 0 6px', color: '#333', fontSize: '16px', fontWeight: 'bold' }}>{title}</h3>
      <p style={{ color: '#666', fontSize: '13px', marginBottom: '8px', flexGrow: 1 }}>{description}</p>
      {accessType && <p style={{ color: '#0070f3', fontSize: '11px', marginBottom: '4px', fontWeight: 600 }}>Access: {accessType}</p>}
      <p style={{ margin: '8px 0 12px', fontSize: '20px', fontWeight: 'bold', color: '#0070f3' }}>${price.toFixed(2)}</p>
      <a href={affiliateLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#0070f3', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', marginTop: 'auto' }}>{cta}</a>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');

  const productsData = [
    { id: 1, title: 'ISTANI Smart Bands Digital Protocol', description: '12-week near-failure resistance protocol. HD video demos & PDF playbook.', price: 59.99, cta: 'Unlock Protocol', image: 'https://images.unsplash.com/photo-1599059813005-11265ba4b7a5?w=400&h=300&fit=crop', affiliateLink: 'https://istani.org', category: 'training', format: 'Video + PDF', accessType: 'Lifetime access', active: true },
    { id: 2, title: 'ISTANI HIIT Audio Neuro-Pack', description: 'BDNF-oriented HIIT audio cues & timers for 8-20 min brain-boost sessions.', price: 39.00, cta: 'Get Audio Pack', image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&h=300&fit=crop', affiliateLink: 'https://istani.org', category: 'audio', format: 'MP3 + streaming', accessType: 'Download', active: true },
    { id: 3, title: 'ISTANI Behavior Tracking OS', description: 'Digital OS for 8-minute habits: Notion system & weekly review scripts.', price: 29.00, cta: 'Access Behavior OS', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop', affiliateLink: 'https://istani.org', category: 'habits', format: 'Notion + PDF', accessType: 'Cloud workspace', active: true }
  ];

  useEffect(() => { setProducts(productsData); }, []);
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  return (
    <div style={{ padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a1a' }}>ISTANI Digital Products</h2>
        <p style={{ fontSize: '14px', color: '#666' }}>100% digital protocols to upgrade your BDNF & strength.</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        {['all', 'training', 'audio', 'habits'].map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '8px 16px', backgroundColor: filter === cat ? '#0070f3' : '#f0f0f0', color: filter === cat ? '#fff' : '#333', border: 'none', borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize' }}>{cat}</button>
        ))}
      </div>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', maxWidth: '1200px', margin: '0 auto', justifyContent: 'center' }}>
        {filtered.map(p => <ProductCard key={p.id} {...p} />)}
      </section>
    </div>
  );
};
export default Products;
