'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [productViews, setProductViews] = useState<{[key: number]: number}>({});

  const featuredPlants = [
    { id: 1, name: 'Sunlit Desk Tree', feature: 'Bright corner-ready', photos: ['🌿', '🌱', '☘️'] },
    { id: 2, name: 'Office Air Boost', feature: 'Easy-care desktop', photos: ['🍃', '🌵', '🪴'] },
    { id: 3, name: 'Minimalist Green', feature: 'Low-maintenance & chic', photos: ['🌱', '💚', '🪴'] },
  ];

  // Load cart and products from the API or local fallback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = window.localStorage.getItem('leofora_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
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
      } catch (error) {
        // ignore and fall back to sample products
      }

      setProducts([
        { id: 1, name: 'Silk Monstera', price: 45.99, image: '🌿', photos: ['🌿', '🍃', '☘️'], inStock: true, sku: 'LED-001', shopifyId: 'prod-001' },
        { id: 2, name: 'Faux Pothos Cascade', price: 32.99, image: '🍃', photos: ['🍃', '🌱', '🪴'], inStock: true, sku: 'PG-002', shopifyId: 'prod-002' },
        { id: 3, name: 'Artificial Snake Grass', price: 28.99, image: '🪴', photos: ['🪴', '🌾', '🌿'], inStock: false, sku: 'SP-003', shopifyId: 'prod-003' },
        { id: 4, name: 'EU Faux Rubber Plant', price: 55.99, image: '🌱', photos: ['🌱', '🍃', '🌳'], inStock: true, sku: 'RP-004', shopifyId: 'prod-004' },
        { id: 5, name: 'Premium Fake Peace Lily', price: 38.99, image: '🌸', photos: ['🌸', '🌿', '🍀'], inStock: true, sku: 'PL-005', shopifyId: 'prod-005' },
        { id: 6, name: 'Deluxe Faux Calathea', price: 49.99, image: '🦜', photos: ['🦜', '🌿', '🎍'], inStock: false, sku: 'CL-006', shopifyId: 'prod-006' },
      ]);
    };

    fetchProducts();
  }, []);

  // Save product views
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('leofora_product_views', JSON.stringify(productViews));
    }
  }, [productViews]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('leofora_cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Add to cart
  const addToCart = (product: any) => {
    if (!product.inStock) {
      alert('Sorry, this product is currently out of stock');
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    // Track product view/click
    setProductViews(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }));
  };

  // Remove from cart
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const placeOrder = async () => {
    if (!cart.length) {
      setOrderMessage('Add an item to your cart to begin checkout.');
      return;
    }
    setIsPlacingOrder(true);
    setOrderMessage('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number((total + 5).toFixed(2)),
          items: cart,
          currency: 'USD',
        }),
      });
      const result = await response.json();
      if (response.ok) {
        const supplierCount = Array.isArray(result.supplierOrders) ? result.supplierOrders.length : 0;
      const supplierText = supplierCount > 0 ? ` (${supplierCount} supplier batch${supplierCount === 1 ? '' : 'es'})` : '';
      setOrderMessage(`Order placed successfully. Reference: ${result.orderId}${supplierText}`);
      setCart([]);
    } else {
      setOrderMessage(result.error || 'Unable to place the order at this time.');
    }
    } catch (error) {
      setOrderMessage('Unable to complete checkout. Please try again later.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main style={{ minHeight: '100vh', background: '#f8fcf7' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #86c3a8 0%, #2d7f4f 100%)',
        color: 'white',
        padding: '22px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.9rem', fontWeight: 'bold' }}>🌿 LEOFORA</h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.95rem', opacity: 0.95 }}>EU dropshipped fake plants for polished workspaces, fast delivery, and secure PayPal-backed checkout.</p>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <a href="/shop" style={{
            background: 'rgba(255,255,255,0.18)',
            color: 'white',
            padding: '10px 16px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>Shop</a>
          <Link href="/chat" style={{
            background: '#ffffff',
            color: '#2d7f4f',
            border: 'none',
            borderRadius: '999px',
            padding: '10px 14px',
            cursor: 'pointer',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s',
            textDecoration: 'none'
          }}>
            Live Help
          </Link>
          <button 
            onClick={() => setShowCart(!showCart)}
            style={{
              background: '#ffe066',
              color: '#1a3d0a',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 18px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s'
            }}
          >
            🛒 {cartCount} Items
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f5fffb 0%, #c7f3d6 45%, #8ccf97 100%)',
        color: '#1a3d0a',
        padding: '70px 20px 40px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '16px', lineHeight: 1.05 }}>Premium EU Fake Plant Greenery, Curated for High-End Workspaces</h2>
        <p style={{ fontSize: '1.05rem', margin: '0 auto 24px auto', maxWidth: '720px', color: '#3f6351' }}>Leofora blends elevated style, compact presentation, and seamless order processing for executive offices and boutique workspaces.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'white', borderRadius: '18px', padding: '18px 22px', minWidth: '220px', boxShadow: '0 16px 30px rgba(50, 116, 76, 0.08)' }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#2d7f4f' }}>Office-ready</strong>
            <span style={{ color: '#556c58' }}>Chic, easy-care plants for professional spaces.</span>
          </div>
          <a href="/shop" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#2d7f4f',
            color: 'white',
            padding: '14px 24px',
            borderRadius: '999px',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 14px 30px rgba(45,127,79,0.18)'
          }}>
            Browse the Shop
          </a>
          <div style={{ background: 'white', borderRadius: '18px', padding: '18px 22px', minWidth: '220px', boxShadow: '0 16px 30px rgba(50, 116, 76, 0.08)' }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#2d7f4f' }}>Fast shipping</strong>
            <span style={{ color: '#556c58' }}>Packaged securely and shipped directly to your workspace.</span>
          </div>
          <div style={{ background: 'white', borderRadius: '18px', padding: '18px 22px', minWidth: '220px', boxShadow: '0 16px 30px rgba(50, 116, 76, 0.08)' }}>
            <strong style={{ display: 'block', marginBottom: '8px', color: '#2d7f4f' }}>Easy returns</strong>
            <span style={{ color: '#556c58' }}>Simple support and seamless order handling with linked account payments.</span>
          </div>
        </div>
      </section>

      {/* Showcase Slider */}
      <section style={{ padding: '40px 20px 10px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '2rem', margin: 0, color: '#1a3d0a' }}>Featured Fake Plant Selection</h3>
            <p style={{ color: '#556c58', marginTop: '8px' }}>Sliding showcase of top office plants with multiple views so customers can see them clearly.</p>
          </div>
          <span style={{ color: '#5f8f69', fontSize: '0.95rem' }}>Designed for workspaces, lobbies, and bright desks.</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {featuredPlants.map((item) => (
            <div key={item.id} className='vine-outline' style={{
              minWidth: '320px',
              flex: '0 0 auto',
              scrollSnapAlign: 'start',
              background: 'white',
              borderRadius: '24px',
              padding: '24px',
              boxShadow: '0 12px 24px rgba(0,0,0,0.08)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#2d7f4f' }}>{item.name}</h4>
              <p style={{ margin: '0 0 18px 0', color: '#5f8f69' }}>{item.feature}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {item.photos.map((photo, idx) => (
                  <div key={idx} style={{
                    background: '#f8fcf7',
                    borderRadius: '16px',
                    padding: '18px',
                    textAlign: 'center',
                    fontSize: '2rem'
                  }}>{photo}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Sidebar */}
      {showCart && (
        <div style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '350px',
          maxWidth: '100vw',
          height: '100vh',
          background: 'white',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '20px', background: '#1a3d0a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Your Cart</h3>
            <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>Your cart is empty</p>
            ) : (
              cart.map(item => (
                <div key={item.id} style={{
                  padding: '15px',
                  background: '#f5f5f5',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{item.name}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Qty: {item.quantity} @ ${item.price}</p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    style={{ background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ padding: '20px', borderTop: '1px solid #eee', background: '#fafafa' }}>
              <div style={{ marginBottom: '15px', textAlign: 'right' }}>
                <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '0.9rem' }}>Subtotal: ${total.toFixed(2)}</p>
                <p style={{ margin: '0 0 10px 0', color: '#999', fontSize: '0.85rem' }}>Shipping: $5.00</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#2d5016' }}>Total: ${(total + 5).toFixed(2)}</p>
              </div>
              <button
                onClick={placeOrder}
                disabled={isPlacingOrder}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: isPlacingOrder ? '#a3b18a' : 'linear-gradient(135deg, #2d5016 0%, #1a3d0a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                  marginBottom: '10px'
                }}>
                {isPlacingOrder ? 'Processing...' : 'Complete Purchase'}
              </button>
              {orderMessage && (
                <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f6f8f5', color: '#2b4f36', marginBottom: '12px' }}>
                  {orderMessage}
                </div>
              )}
              <button onClick={() => setShowCart(false)} style={{
                width: '100%',
                padding: '12px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}>
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      )}

      {/* Most Popular Section */}
      {Object.keys(productViews).length > 0 && (
        <section style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.2rem',
            marginBottom: '16px',
            color: '#1a3d0a'
          }}>🌟 Most Popular This Week</h2>
          <p style={{ textAlign: 'center', color: '#556c58', maxWidth: '600px', margin: '0 auto 30px auto' }}>
            Trending faux plants based on customer interest and recent activity.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {products
              .filter(product => productViews[product.id] > 0)
              .sort((a, b) => (productViews[b.id] || 0) - (productViews[a.id] || 0))
              .slice(0, 4)
              .map(product => (
                <div key={`popular-${product.id}`} className='vine-outline' style={{
                  background: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.06)',
                  opacity: product.inStock ? 1 : 0.65,
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#ffe066',
                    color: '#1a3d0a',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    zIndex: 2
                  }}>
                    {productViews[product.id]}
                  </div>
                  <div style={{
                    padding: '20px',
                    background: 'linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%)'
                  }}>
                    <div style={{
                      height: '140px',
                      background: 'white',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      boxShadow: '0 6px 14px rgba(0,0,0,0.05)'
                    }}>
                      {product.image}
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <h3 style={{ margin: '0 0 6px 0', color: '#1a3d0a', fontSize: '1.1rem' }}>{product.name}</h3>
                    <p style={{ fontSize: '1.3rem', color: '#2d7f4f', fontWeight: 'bold', margin: '8px 0' }}>${product.price}</p>
                    <p style={{ margin: '8px 0 14px 0', fontSize: '0.85rem', color: product.inStock ? '#2d7f4f' : '#d1495b', fontWeight: '600' }}>
                      {product.inStock ? 'Available for fast shipping' : 'Temporarily out of stock'}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: product.inStock ? '#2d7f4f' : '#ccc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: product.inStock ? 'pointer' : 'not-allowed',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Products Section */}
      <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '20px',
          color: '#1a3d0a'
        }}>Fake Plant Collection</h2>
        <p style={{ textAlign: 'center', color: '#556c58', maxWidth: '720px', margin: '0 auto 40px auto' }}>
          Curated plants for modern workspaces with easy shipping, clear stock alerts, and a mobile-friendly checkout.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px'
        }}>
          {products.map(product => (
            <div key={product.id} className='vine-outline' style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 22px rgba(0,0,0,0.08)',
              opacity: product.inStock ? 1 : 0.65
            }}>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #dff8ef 0%, #e4f6dd 100%)'
              }}>
                <div style={{
                  height: '180px',
                  background: 'white',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                }}>
                  {product.image}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '14px' }}>
                  {product.photos.map((photo: string, idx: number) => (
                    <span key={idx} style={{ fontSize: '1.5rem', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', padding: '10px' }}>{photo}</span>
                  ))}
                </div>
              </div>
              <div style={{ padding: '22px 24px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1a3d0a', fontSize: '1.2rem' }}>{product.name}</h3>
                <p style={{ margin: '0 0 12px 0', color: '#7a8c75', fontSize: '0.9rem' }}>SKU: {product.sku}</p>
                <p style={{ fontSize: '1.45rem', color: '#2d7f4f', fontWeight: 'bold', margin: '10px 0' }}>${product.price}</p>
                <p style={{ margin: '10px 0 18px 0', fontSize: '0.95rem', color: product.inStock ? '#2d7f4f' : '#d1495b', fontWeight: '700' }}>
                  {product.inStock ? 'Available for fast shipping' : 'Temporarily out of stock'}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: product.inStock ? 'linear-gradient(135deg, #2d7f4f 0%, #1a3d0a 100%)' : '#d3d3d3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: product.inStock ? 'pointer' : 'not-allowed',
                    fontWeight: 'bold'
                  }}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shopify Integration Info */}
      <section style={{
        padding: '40px 20px',
        background: '#ffffff',
        textAlign: 'center',
        marginTop: '40px',
        borderTop: '1px solid #e8f1ea',
        borderBottom: '1px solid #e8f1ea'
      }}>
        <h3 style={{ color: '#1a3d0a', marginBottom: '15px' }}>Shopify-Friendly Order Automation</h3>
        <p style={{ color: '#556c58', marginBottom: '10px' }}>✓ Live stock sync from supplier feeds | ✓ Out-of-stock alerts across collections.</p>
        <p style={{ color: '#556c58', marginBottom: '10px' }}>✓ Secure checkout routes payments to your linked account with reliable order handling.</p>
        <p style={{ color: '#556c58' }}>✓ Live Plant Concierge starts the conversation while orders wait for personal review.</p>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 20px',
        background: '#1a3d0a',
        color: '#ccc',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <p style={{ margin: '0 0 10px 0' }}>&copy; 2026 Leofora. Premium Fake Plants.</p>
        <p style={{ margin: 0 }}>Shopify Integrated | Linked Account Payments | Real-time Inventory | 24/7 Live Support</p>
      </footer>
    </main>
  );
}
