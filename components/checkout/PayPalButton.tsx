'use client';

import { useState } from 'react';
import styles from './PayPalButton.module.css';

interface PayPalButtonProps {
  items: Array<{
    id: string;
    quantity: number;
  }>;
  customerEmail: string;
}

export default function PayPalButton({ items, customerEmail }: PayPalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customerEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }

      const { approvalUrl } = await response.json();
      window.location.href = approvalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={styles.paypalButton}
      >
        {loading ? 'Processing...' : 'Pay with PayPal'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}