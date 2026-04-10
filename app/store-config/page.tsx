'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StoreDetailsPage() {
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalSecret, setPaypalSecret] = useState('');
  const [paypalMode, setPaypalMode] = useState<'sandbox' | 'live'>('sandbox');
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    fetchStoreDetails();
  }, []);

  const fetchStoreDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/shopify/store-details');
      const data = await response.json();

      if (response.ok) {
        setStoreInfo(data.store);
      } else {
        setMessage(data.error || 'Failed to load store details.');
      }
    } catch (error) {
      setMessage('Unable to fetch store details.');
    } finally {
      setLoading(false);
    }
  };

  const setupPayPal = async () => {
    if (!paypalClientId || !paypalSecret) {
      setMessage('Please enter PayPal Client ID and Secret.');
      return;
    }

    setSetupLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/shopify/paypal-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: paypalClientId,
          clientSecret: paypalSecret,
          mode: paypalMode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}\n\n${data.instructions}`);
        setPaypalClientId('');
        setPaypalSecret('');
      } else {
        setMessage(data.error || 'Failed to set up PayPal.');
      }
    } catch (error) {
      setMessage('Unable to configure PayPal.');
    } finally {
      setSetupLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f6faf3', padding: '38px 22px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <Link href="/admin" style={{ color: '#2d7f4f', textDecoration: 'underline', marginBottom: '12px', display: 'block' }}>← Back to Admin</Link>
          <h1 style={{ margin: '12px 0 8px 0', color: '#1d4d22' }}>Store Configuration</h1>
          <p style={{ margin: 0, color: '#556c58' }}>View your Shopify store details and configure PayPal payment processing.</p>
        </header>

        {loading ? (
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
            <p>Loading store details...</p>
          </div>
        ) : storeInfo ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Store Details */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
              <h2 style={{ margin: '0 0 20px 0', color: '#1d4d22' }}>📦 Store Details</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: '#556c58', fontWeight: '700' }}>Store Name</p>
                  <p style={{ margin: 0, color: '#2d7f4f', fontSize: '1.1rem' }}>{storeInfo.name}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: '#556c58', fontWeight: '700' }}>Domain</p>
                  <p style={{ margin: 0, color: '#2d7f4f' }}>{storeInfo.myshopifyDomain}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: '#556c58', fontWeight: '700' }}>Email</p>
                  <p style={{ margin: 0, color: '#2d7f4f' }}>{storeInfo.email}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: '#556c58', fontWeight: '700' }}>Country</p>
                  <p style={{ margin: 0, color: '#2d7f4f' }}>{storeInfo.country}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: '#556c58', fontWeight: '700' }}>Currency</p>
                  <p style={{ margin: 0, color: '#2d7f4f' }}>{storeInfo.currency}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 6px 0', color: '#556c58', fontWeight: '700' }}>Timezone</p>
                  <p style={{ margin: 0, color: '#2d7f4f' }}>{storeInfo.timezone}</p>
                </div>
              </div>
            </div>

            {/* PayPal Setup */}
            <div style={{ background: 'white', borderRadius: '24px', padding: '28px', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
              <h2 style={{ margin: '0 0 20px 0', color: '#1d4d22' }}>💳 PayPal Payment Setup</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#2d7f4f' }}>PayPal Client ID</label>
                  <input
                    type="password"
                    placeholder="Your PayPal Client ID"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d9e6d4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#2d7f4f' }}>PayPal Client Secret</label>
                  <input
                    type="password"
                    placeholder="Your PayPal Client Secret"
                    value={paypalSecret}
                    onChange={(e) => setPaypalSecret(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d9e6d4' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '700', color: '#2d7f4f' }}>Payment Mode</label>
                  <select
                    value={paypalMode}
                    onChange={(e) => setPaypalMode(e.target.value as 'sandbox' | 'live')}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #d9e6d4' }}
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </div>
                <button
                  onClick={setupPayPal}
                  disabled={setupLoading}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: setupLoading ? '#ddd' : '#2d7f4f',
                    color: 'white',
                    border: 'none',
                    fontWeight: '700',
                    cursor: setupLoading ? 'not-allowed' : 'pointer',
                    marginTop: '12px',
                  }}
                >
                  {setupLoading ? 'Configuring...' : '✅ Enable PayPal'}
                </button>
                <p style={{ fontSize: '0.9rem', color: '#556c58', marginTop: '12px' }}>
                  Your PayPal credentials will be securely stored and used to process payments on your Shopify store.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
            <p style={{ color: '#d1495b' }}>Please connect your Shopify store first.</p>
            <Link href="/shopify" style={{ color: '#2d7f4f', textDecoration: 'underline', marginTop: '12px', display: 'block' }}>Go to Shopify Connect</Link>
          </div>
        )}

        {message && (
          <div style={{ marginTop: '24px', background: 'white', borderRadius: '24px', padding: '20px', whiteSpace: 'pre-wrap', color: message.includes('✅') ? '#2d7f4f' : '#d1495b' }}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
