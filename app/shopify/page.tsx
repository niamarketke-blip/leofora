'use client';
import { useEffect, useState } from 'react';

export default function ShopifyPage() {
  const [status, setStatus] = useState('Loading Shopify connection status...');
  const [shopUrl, setShopUrl] = useState('j6rnun-fy.myshopify.com');
  const [installed, setInstalled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [adminUrl, setAdminUrl] = useState('https://admin.shopify.com/store/j6rnun-fy');
  const [accessToken, setAccessToken] = useState('');

  const normalizeShopDomain = (value: string) => {
    const cleaned = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!cleaned) return '';
    if (cleaned.includes('.myshopify.com')) return cleaned;
    if (!cleaned.includes('.')) return `${cleaned}.myshopify.com`;
    return cleaned;
  };

  const toAdminUrl = (domain: string) => {
    const slug = normalizeShopDomain(domain).replace(/\.myshopify\.com$/i, '');
    return slug ? `https://admin.shopify.com/store/${slug}` : '';
  };

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await fetch('/api/shopify/session');
        const data = await response.json();
        setInstalled(data.installed);
        if (data.shop) {
          setShopUrl(data.shop);
          setAdminUrl(data.adminUrl || toAdminUrl(data.shop));
          setStatus(`Connected to Shopify store ${data.shop}`);
        } else {
          setAdminUrl(toAdminUrl(shopUrl));
          setStatus('No Shopify store is currently installed. Enter your domain and use the install button to connect.');
        }
      } catch (error) {
        setStatus('Unable to load Shopify status.');
      }
    }
    loadStatus();
  }, []);

  const normalizedShopUrl = normalizeShopDomain(shopUrl);

  const installUrl = normalizedShopUrl
    ? `/api/shopify/auth?shop=${encodeURIComponent(normalizedShopUrl)}`
    : '/api/shopify/auth';

  const handleInstall = () => {
    if (!normalizedShopUrl) {
      setErrorMessage('Please enter your Shopify store domain before installing.');
      return;
    }
    setShopUrl(normalizedShopUrl);
    setAdminUrl(toAdminUrl(normalizedShopUrl));
    window.location.href = installUrl;
  };

  const handleTokenConnect = async () => {
    if (!normalizedShopUrl || !accessToken.trim()) {
      setErrorMessage('Enter both Shopify store domain and Admin API access token.');
      return;
    }

    try {
      const response = await fetch('/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: normalizedShopUrl,
          accessToken: accessToken.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'Unable to connect with token.');
        return;
      }
      setInstalled(true);
      setStatus(`Connected to Shopify store ${data.shop}`);
      setAdminUrl(toAdminUrl(data.shop));
      setAccessToken('');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Unable to connect with token.');
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#f6faf3', padding: '38px 22px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', background: 'white', borderRadius: '24px', boxShadow: '0 24px 44px rgba(0,0,0,0.08)', padding: '34px' }}>
        <h1 style={{ margin: '0 0 18px 0', color: '#1d4d22' }}>Shopify App Connection</h1>
        <p style={{ margin: '0 0 24px 0', color: '#4f6b53' }}>Connect this Leofora app to your Shopify store for Ireland and Netherlands dropshipping workflows.</p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#2d663f' }}>Shopify store domain</label>
          <input
            placeholder="example.myshopify.com"
            value={shopUrl}
            onChange={(e) => {
              setShopUrl(e.target.value);
              setErrorMessage('');
            }}
            style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #d9e6d4' }}
          />
          {errorMessage && <p style={{ margin: '10px 0 0 0', color: '#b02a37' }}>{errorMessage}</p>}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 700, color: '#2d663f' }}>Admin API access token (optional direct connect)</label>
          <input
            type='password'
            placeholder='shpat_...'
            value={accessToken}
            onChange={(e) => {
              setAccessToken(e.target.value);
              setErrorMessage('');
            }}
            style={{ width: '100%', padding: '14px 16px', borderRadius: '14px', border: '1px solid #d9e6d4' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {!installed ? (
            <button onClick={handleInstall} style={{ padding: '14px 18px', borderRadius: '14px', background: '#2f7e52', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}>Install Shopify App</button>
          ) : (
            <>
              <a href={adminUrl || toAdminUrl(shopUrl)} target="_blank" rel="noreferrer" style={{ padding: '14px 18px', borderRadius: '14px', background: '#2f7e52', color: 'white', textDecoration: 'none', fontWeight: '700' }}>Open Shopify Admin</a>
              <a href={`https://${normalizeShopDomain(shopUrl)}`} target="_blank" rel="noreferrer" style={{ padding: '14px 18px', borderRadius: '14px', background: '#2f7e52', color: 'white', textDecoration: 'none', fontWeight: '700' }}>View Shopify Storefront</a>
            </>
          )}
          <button onClick={async () => {
            const response = await fetch('/api/shopify/session');
            const data = await response.json();
            setInstalled(data.installed);
            if (data.shop) {
              setShopUrl(data.shop);
              setAdminUrl(data.adminUrl || toAdminUrl(data.shop));
            } else {
              setAdminUrl(toAdminUrl(shopUrl));
            }
            setStatus(data.installed ? `Connected to Shopify store ${data.shop}` : 'Shopify is not connected yet.');
          }} style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #d9e6d4', background: 'white', color: '#1d4d22', cursor: 'pointer' }}>Refresh Status</button>
          <button onClick={handleTokenConnect} style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #d9e6d4', background: 'white', color: '#1d4d22', cursor: 'pointer' }}>Connect with Token</button>
        </div>

        <section style={{ marginTop: '32px', padding: '24px', borderRadius: '20px', background: '#f1f8ed', color: '#3a5e38' }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '700' }}>Connection status</p>
          <p style={{ margin: 0 }}>{status}</p>
          {installed && (
            <>
              <p style={{ margin: '12px 0 0 0', color: '#2d7f4f' }}>Connected store: <strong>{shopUrl}</strong>.</p>
              <p style={{ margin: '10px 0 0 0', color: '#2d7f4f' }}>Admin target: <a href={adminUrl || toAdminUrl(shopUrl)} target="_blank" rel="noreferrer" style={{ color: '#1f6b34', textDecoration: 'underline' }}>{adminUrl || toAdminUrl(shopUrl)}</a></p>
              <p style={{ margin: '10px 0 0 0', color: '#2d7f4f' }}>Shopify inventory sync is active for Ireland and Netherlands.</p>
              <p style={{ margin: '10px 0 0 0', color: '#2d7f4f' }}>
                View the storefront on Shopify at <a href={`https://${normalizeShopDomain(shopUrl)}`} target="_blank" rel="noreferrer" style={{ color: '#1f6b34', textDecoration: 'underline' }}>https://{normalizeShopDomain(shopUrl)}</a>
              </p>
            </>
          )}
          {!installed && <p style={{ margin: '12px 0 0 0', color: '#3a5e38' }}>If this store is already registered, press Refresh Status to load the current connection.</p>}
        </section>

        <section style={{ marginTop: '32px', padding: '24px', borderRadius: '20px', background: '#ffffff', border: '1px solid #e7f2e7' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#2d5f41' }}>How to use</h2>
          <ol style={{ paddingLeft: '18px', color: '#556c58' }}>
            <li>Enter your Shopify domain, for example <strong>j6rnun-fy.myshopify.com</strong>.</li>
            <li>Click <strong>Install Shopify App</strong>.</li>
            <li>Complete Shopify's OAuth installation flow.</li>
            <li>Return to the admin page to verify the connection.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}
