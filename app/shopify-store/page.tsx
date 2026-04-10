'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ShopifyStorePage() {
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      // Fetch store details
      const storeRes = await fetch('/api/shopify/store-details');
      if (storeRes.ok) {
        const storeData = await storeRes.json();
        setStoreInfo(storeData.store);
      }

      // Fetch products
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }
    } catch (error) {
      setMessage('Failed to load store data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
      {/* Header */}
      <header style={{ background: 'var(--color-primary)', color: 'white', padding: '28px 20px', borderBottom: '2px solid var(--color-secondary)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem' }}>🏪 Leofora Shopify Store</h1>
            <p style={{ margin: 0, opacity: 0.9 }}>{storeInfo?.name || 'Loading...'}</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/admin" style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>📊 Admin</Link>
            <Link href="/shopify" style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>🔗 Connect</Link>
            <Link href="/store-config" style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', fontSize: '0.95rem' }}>⚙️ Config</Link>
          </div>
        </div>
      </header>

      {/* Store Status */}
      {storeInfo && (
        <section style={{ background: 'var(--color-secondary)', color: 'white', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '0.9rem' }}>Store Domain</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{storeInfo.myshopifyDomain}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '0.9rem' }}>Shopify Admin</p>
              <a
                href={`https://admin.shopify.com/store/${(storeInfo.myshopifyDomain || '').replace(/\.myshopify\.com$/i, '')}`}
                target="_blank"
                rel="noreferrer"
                style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'white', textDecoration: 'underline' }}
              >
                https://admin.shopify.com/store/{(storeInfo.myshopifyDomain || '').replace(/\.myshopify\.com$/i, '')}
              </a>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '0.9rem' }}>Country</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{storeInfo.country} 🌍</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '0.9rem' }}>Currency</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{storeInfo.currency}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', opacity: 0.8, fontSize: '0.9rem' }}>Email</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>{storeInfo.email}</p>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h2 style={{ margin: '0 0 6px 0', color: 'var(--color-secondary)', fontSize: '1.6rem' }}>📦 Products</h2>
            <p style={{ margin: 0, color: '#556c58' }}>Available for Ireland & Netherlands customers</p>
          </div>
          <button onClick={loadStoreData} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: '700' }}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#556c58' }}>
            <p>Loading products from Shopify...</p>
          </div>
        ) : products.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {products.map((product, index) => (
              <div key={index} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s' }}>
                <div style={{ background: 'var(--color-accent)', color: 'white', padding: '40px', textAlign: 'center', fontSize: '2rem' }}>
                  {product.image}
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: 'var(--color-secondary)', fontSize: '1.1rem' }}>{product.name}</h3>
                  <p style={{ margin: '0 0 4px 0', color: '#556c58' }}>SKU: {product.sku}</p>
                  <p style={{ margin: '0 0 12px 0', color: '#556c58' }}>Stock: {product.stock || 0} units</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--color-primary)' }}>${product.price}</span>
                    <span style={{ padding: '6px 12px', borderRadius: '6px', background: product.inStock ? '#e7f7eb' : '#ffe7e7', color: product.inStock ? '#2d7f4f' : '#d1495b', fontSize: '0.9rem', fontWeight: '700' }}>
                      {product.inStock ? '✓ In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#556c58' }}>
            <p>No products available. <Link href="/admin" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Go to admin to sync products.</Link></p>
          </div>
        )}
      </section>

      {/* Integration Status */}
      <section style={{ background: '#f1f8ed', padding: '40px 20px', margin: '40px 0 0 0', borderTop: '1px solid var(--color-accent)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ margin: '0 0 20px 0', color: 'var(--color-secondary)' }}>🔗 Integration Status</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', borderLeft: '4px solid var(--color-primary)' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: 'var(--color-secondary)' }}>✓ Shopify Connected</p>
              <p style={{ margin: 0, color: '#556c58', fontSize: '0.9rem' }}>Store linked: {storeInfo?.myshopifyDomain}</p>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', borderLeft: '4px solid var(--color-primary)' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: 'var(--color-secondary)' }}>✓ Products Synced</p>
              <p style={{ margin: 0, color: '#556c58', fontSize: '0.9rem' }}>Total: {products.length} products</p>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', borderLeft: '4px solid var(--color-primary)' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: 'var(--color-secondary)' }}>💳 PayPal Ready</p>
              <p style={{ margin: 0, color: '#556c58', fontSize: '0.9rem' }}><Link href="/store-config" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Configure PayPal</Link></p>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '16px', borderLeft: '4px solid var(--color-primary)' }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: '700', color: 'var(--color-secondary)' }}>🌍 EU Regions</p>
              <p style={{ margin: 0, color: '#556c58', fontSize: '0.9rem' }}>Ireland & Netherlands ready</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={{ maxWidth: '1400px', margin: '40px auto 40px', padding: '0 20px' }}>
        <h2 style={{ margin: '0 0 20px 0', color: 'var(--color-secondary)' }}>⚡ Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <Link href="/admin" style={{ padding: '14px 16px', borderRadius: '8px', background: 'var(--color-primary)', color: 'white', textDecoration: 'none', textAlign: 'center', fontWeight: '700' }}>📊 Go to Admin Panel</Link>
          <Link href="/shopify" style={{ padding: '14px 16px', borderRadius: '8px', background: 'var(--color-accent)', color: 'white', textDecoration: 'none', textAlign: 'center', fontWeight: '700' }}>🔗 Manage Shopify Connection</Link>
          <Link href="/store-config" style={{ padding: '14px 16px', borderRadius: '8px', background: 'var(--color-secondary)', color: 'white', textDecoration: 'none', textAlign: 'center', fontWeight: '700' }}>⚙️ PayPal Configuration</Link>
          <Link href="/shop" style={{ padding: '14px 16px', borderRadius: '8px', background: '#2f7e52', color: 'white', textDecoration: 'none', textAlign: 'center', fontWeight: '700' }}>🛍️ View Store</Link>
        </div>
      </section>

      {message && (
        <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '16px 20px', background: '#ffe7e7', color: '#d1495b', borderRadius: '8px', textAlign: 'center' }}>
          {message}
        </div>
      )}
    </main>
  );
}
