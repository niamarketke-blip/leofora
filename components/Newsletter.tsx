'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    alert('Thank you for subscribing!');
    setEmail('');
  };

  return (
    <div style={{ padding: '40px 0', background: '#333', color: 'white', textAlign: 'center' }}>
      <h2>Subscribe to Our Newsletter</h2>
      <p>Get the latest updates and exclusive offers</p>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '20px auto' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{ padding: '10px', width: '70%', border: 'none', borderRadius: '4px 0 0 4px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>
          Subscribe
        </button>
      </form>
    </div>
  );
}