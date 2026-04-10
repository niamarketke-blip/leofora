'use client';

import { useState, useEffect } from 'react';

export default function SetupPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'failed'>('idle');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [shop, setShop] = useState('');

  useEffect(() => {
    fetch('/api/shopify/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.installed && data.shop) {
          setShop(data.shop);
          setStatus('connected');
          setMessage(`Already connected to ${data.shop}`);
        }
      })
      .catch(() => {});
  }, []);

  const handleConnect = async () => {
    if (!token.trim()) {
      setMessage('Please paste your Shopify Admin API token (shpat_...)');
      return;
    }
    setStatus('loading');
    setMessage('Connecting to Shopify...');
    try {
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop: 'j6rnun-fy.myshopify.com', accessToken: token }),
      });
      const result = await response.json();
      if (response.ok) {
        setShop(result.shop);
        setStatus('connected');
        setMessage('Connected to ' + result.shop);
        setToken('');
        setTimeout(() => {
          window.open('https://admin.shopify.com/store/j6rnun-fy/themes', '_blank');
          window.open('https://j6rnun-fy.myshopify.com', '_blank');
        }, 800);
      } else {
        setStatus('failed');
        setMessage(result.error || 'Connection failed');
      }
    } catch {
      setStatus('failed');
      setMessage('Connection error - check your token and try again');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fcf7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '560px', width: '100%', background: 'white', borderRadius: '20px', padding: '48px', boxShadow: '0 4px 32px rgba(45,127,79,0.10)' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>&#127807;</div>
          <h1 style={{ color: '#1a3d0a', margin: 0, fontSize: '26px', fontWeight: 700 }}>Leofora x Shopify</h1>
          <p style={{ color: '#6b8f6b', marginTop: '8px', fontSize: '15px' }}>Connect your store to get started</p>
        </div>

        {status !== 'connected' ? (
          <>
            <label style={{ display: 'block', color: '#1a3d0a', fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>
              Shopify Admin API Token
            </label>
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your shpat_... token here"
              rows={3}
              style={{ width: '100%', padding: '14px', border: '2px solid #dfe7dd', borderRadius: '12px', fontFamily: 'monospace', fontSize: '13px', marginBottom: '16px', boxSizing: 'border-box', outline: 'none', resize: 'none' }}
            />
            <button
              onClick={handleConnect}
              disabled={status === 'loading'}
              style={{ width: '100%', padding: '16px', background: status === 'loading' ? '#a8c9b0' : '#2d7f4f', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 700, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
            >
              {status === 'loading' ? 'Connecting...' : 'Connect Shopify Store'}
            </button>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              Shopify Admin - Settings - Apps - Develop apps - Create app - Install - Copy token
            </p>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>&#9989;</div>
            <h2 style={{ color: '#1a3d0a', margin: '0 0 8px 0' }}>Store Connected!</h2>
            <p style={{ color: '#6b8f6b', marginBottom: '32px' }}>{shop}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a href="https://admin.shopify.com/store/j6rnun-fy/themes" target="_blank" rel="noreferrer"
                style={{ display: 'block', padding: '14px', background: '#2d7f4f', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', textAlign: 'center' }}>
                Open Theme Editor
              </a>
              <a href="https://admin.shopify.com/store/j6rnun-fy/products" target="_blank" rel="noreferrer"
                style={{ display: 'block', padding: '14px', background: '#1a3d0a', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', textAlign: 'center' }}>
                View Products in Shopify
              </a>
              <a href="https://j6rnun-fy.myshopify.com" target="_blank" rel="noreferrer"
                style={{ display: 'block', padding: '14px', background: '#f8fcf7', color: '#1a3d0a', border: '2px solid #dfe7dd', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '15px', textAlign: 'center' }}>
                View Live Store
              </a>
            </div>
          </div>
        )}

        {message && (
          <div style={{ marginTop: '20px', padding: '14px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, background: status === 'failed' ? '#ffebee' : '#e8f5e9', color: status === 'failed' ? '#c62828' : '#2d7f4f', textAlign: 'center' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
