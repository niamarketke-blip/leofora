'use client';

import { useState, useEffect } from 'react';

const defaultProducts = [
  { id: 1, name: 'Silk Monstera', price: 45.99, image: '🌿', photos: ['🌿', '🍃', '☘️'], inStock: true, sku: 'LED-001', shopifyId: 'prod-001' },
  { id: 2, name: 'Faux Pothos Cascade', price: 32.99, image: '🍃', photos: ['🍃', '🌱', '🪴'], inStock: true, sku: 'PG-002', shopifyId: 'prod-002' },
  { id: 3, name: 'Artificial Snake Grass', price: 28.99, image: '🪴', photos: ['🪴', '🌾', '🌿'], inStock: false, sku: 'SP-003', shopifyId: 'prod-003' },
  { id: 4, name: 'EU Faux Rubber Plant', price: 55.99, image: '🌱', photos: ['🌱', '🍃', '🌳'], inStock: true, sku: 'RP-004', shopifyId: 'prod-004' },
  { id: 5, name: 'Premium Fake Peace Lily', price: 38.99, image: '🌸', photos: ['🌸', '🌿', '🍀'], inStock: true, sku: 'PL-005', shopifyId: 'prod-005' },
  { id: 6, name: 'Deluxe Faux Calathea', price: 49.99, image: '🦜', photos: ['🦜', '🌿', '🎍'], inStock: false, sku: 'CL-006', shopifyId: 'prod-006' },
];

export default function ShopPage() {
  const [products, setProducts] = useState(defaultProducts);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productViews, setProductViews] = useState<{[key: number]: number}>({});

  const loadCartCount = () => {
    if (typeof window === 'undefined') return;
    const savedCart = window.localStorage.getItem('leofora_cart');
    if (!savedCart) {
      setCartCount(0);
      return;
    }
    const cartItems = JSON.parse(savedCart);
    setCartCount(cartItems.reduce((sum: number, item: any) => sum + (item.quantity ?? 1), 0));
  };

  const addToCart = (product: any) => {
    if (!product.inStock) return;
    const savedCart = typeof window !== 'undefined' ? window.localStorage.getItem('leofora_cart') : null;
    const cartItems = savedCart ? JSON.parse(savedCart) : [];
    const existing = cartItems.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cartItems.push({ ...product, quantity: 1 });
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('leofora_cart', JSON.stringify(cartItems));
    }
    setCartCount(cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0));
    setPurchaseMessage(`${product.name} added to cart.`);
    // Track product view/click
    setProductViews(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
  };

  useEffect(() => {
    loadCartCount();
    if (typeof window !== 'undefined') {
      const savedViews = window.localStorage.getItem('leofora_product_views');
      if (savedViews) {
        setProductViews(JSON.parse(savedViews));
      }
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          return;
        }
      } catch (_) {
      }
    };

    fetchProducts();
  }, []);

  // Save product views
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('leofora_product_views', JSON.stringify(productViews));
    }
  }, [productViews]);

  const purchaseNow = async (product: any) => {
    setPurchaseMessage('');
    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: product.price, items: [{ ...product, quantity: 1 }], currency: 'USD' }),
      });
      const result = await response.json();
      if (response.ok) {
        const supplierCount = Array.isArray(result.supplierOrders) ? result.supplierOrders.length : 0;
        const supplierText = supplierCount > 0 ? ` grouped into ${supplierCount} supplier batch${supplierCount === 1 ? '' : 'es'}` : '';
        setPurchaseMessage(`Your order for ${product.name} is confirmed${supplierText}. Ref: ${result.orderId}`);
      } else {
        setPurchaseMessage(result.error || 'Unable to process purchase at this time.');
      }
    } catch {
      setPurchaseMessage('Unable to complete purchase. Please try again later.');
    } finally {
      setIsProcessing(false);
      // Track product view/click
      setProductViews(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f8fcf7', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ margin: 0, color: '#2d7f4f', fontWeight: '700', letterSpacing: '0.08em' }}>LEOFORA SHOP</p>
              <h1 style={{ margin: '12px 0 0 0', fontSize: '3rem', lineHeight: 1.05, color: '#1a3d0a' }}>Premium EU dropship fake plants for refined offices and modern workspaces.</h1>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: 'white', background: 'rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: '999px', fontWeight: '700' }}>{cartCount} items in cart</span>
              <a href="/" style={{ background: '#2d7f4f', color: 'white', padding: '14px 22px', borderRadius: '999px', fontWeight: '700', textDecoration: 'none' }}>Back to Home</a>
            </div>
          </div>
          <p style={{ maxWidth: '840px', color: '#556c58', fontSize: '1rem', margin: 0 }}>Explore Leofora's EU dropship fake plant collection. Quick purchase and secure PayPal-backed checkout are built inline for easy ordering.</p>
        </div>

        {purchaseMessage && (
          <div style={{ marginBottom: '24px', padding: '18px 22px', borderRadius: '18px', background: '#eef6ea', color: '#2e5a34' }}>
            {purchaseMessage}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {products.map(product => (
            <div key={product.id} className='vine-outline' style={{ background: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 14px 28px rgba(0,0,0,0.08)', opacity: product.inStock ? 1 : 0.6 }}>
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #eaf8f0 0%, #f0f8f5 100%)' }}>
                <div style={{ height: '170px', borderRadius: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>{product.image}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
                  {product.photos.map((photo, idx) => (
                    <div key={idx} style={{ background: '#f8fcf7', borderRadius: '16px', padding: '16px', textAlign: 'center', fontSize: '1.7rem' }}>{photo}</div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <h2 style={{ margin: '0 0 10px 0', color: '#1a3d0a' }}>{product.name}</h2>
                <p style={{ margin: '0 0 10px 0', color: '#7a8c75', fontSize: '0.95rem' }}>SKU: {product.sku}</p>
                <p style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#2d7f4f' }}>${product.price.toFixed(2)}</p>
                <p style={{ margin: '0 0 20px 0', color: product.inStock ? '#2d7f4f' : '#d1495b', fontWeight: '700' }}>
                  {product.inStock ? 'In stock and shipping soon' : 'Out of stock - restock alerts available'}
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => purchaseNow(product)}
                    disabled={!product.inStock || isProcessing}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '14px',
                      border: 'none',
                      background: product.inStock ? (isProcessing ? '#8fa880' : 'linear-gradient(135deg, #2d7f4f 0%, #1a3d0a 100%)') : '#d3d3d3',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: product.inStock ? 'pointer' : 'not-allowed'
                    }}>
                    {product.inStock ? (isProcessing ? 'Processing…' : 'Quick purchase') : 'Coming Soon'}
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid #d3d3d3',
                      background: product.inStock ? 'white' : '#f5f5f5',
                      color: product.inStock ? '#2d7f4f' : '#999',
                      fontWeight: 'bold',
                      cursor: product.inStock ? 'pointer' : 'not-allowed'
                    }}>
                    {product.inStock ? 'Add to cart' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
