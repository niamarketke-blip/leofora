'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: string, text: string}>>([
    { role: 'bot', text: 'Hi! I\'m your Leofora Plant Concierge. Tell me about your office or workspace, and I\'ll help you choose plants that ship easily.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setChatInput('');

    const responses: { [key: string]: string } = {
      'price': 'Our plants range from $28.99 to $55.99. Check individual products for exact pricing!',
      'shipping': 'We offer fast shipping. Orders are typically processed within 24 hours.',
      'return': 'We have a 30-day money-back guarantee. Please visit our support page for details.',
      'stock': 'I can help you check stock availability. Which plant are you interested in?',
      'order': 'You can place an order by adding items to your cart and choosing Buy now. Payments are routed securely to the linked account.',
      'payment': 'We accept payments through the linked account for secure order processing.',
      'shopify': 'Our Leofora store is fully integrated with Shopify for seamless inventory management.',
      'supplier': 'We source our fake plants through EU dropshipping partners and use PayPal for secure supplier payouts.',
    };

    let botResponse = "I'm here to help! Ask about pricing, shipping, returns, stock, orders, payments, or our Shopify integration.";
    const lowerInput = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (lowerInput.includes(key)) {
        botResponse = response;
        break;
      }
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fcf7', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #86c3a8 0%, #2d7f4f 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>🌿 LEOFORA</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.95, lineHeight: 1.3 }}>Office plants for polished workspaces, fast delivery, and secure checkout.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/shop" style={{
            background: 'rgba(255,255,255,0.18)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>Shop</Link>
          <Link href="/" style={{
            background: '#ffffff',
            color: '#2d7f4f',
            padding: '8px 12px',
            borderRadius: '999px',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '0.9rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s'
          }}>
            ← Back Home
          </Link>
        </div>
      </header>

      {/* Chat Interface */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px 16px',
        minHeight: 0
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          height: 'calc(100vh - 140px)',
          maxHeight: '700px',
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #2d7f4f 0%, #1a4d2e 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            <span>🌿 Live Plant Concierge</span>
            <Link href="/" style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              textDecoration: 'none'
            }}>✕</Link>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: '#fafafa'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '14px 18px',
                  borderRadius: '18px',
                  background: msg.role === 'user' ? '#2d5016' : '#ffffff',
                  color: msg.role === 'user' ? 'white' : '#333',
                  wordWrap: 'break-word',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '12px',
            background: '#ffffff',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              placeholder="Ask me about office plants..."
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '999px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.target as HTMLElement).style.borderColor = '#2d7f4f'}
              onBlur={(e) => (e.target as HTMLElement).style.borderColor = '#e0e0e0'}
            />
            <button
              onClick={handleChat}
              style={{
                padding: '12px 20px',
                background: '#2d7f4f',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
                transition: 'background 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => (e.target as HTMLElement).style.background = '#1a4d2e'}
              onMouseOut={(e) => (e.target as HTMLElement).style.background = '#2d7f4f'}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}