export default function Testimonials() {
  const testimonials = [
    { name: 'Sarah Chen', text: 'The flowers arrived incredibly fresh and beautifully arranged!', rating: 5 },
    { name: 'Marcus Rodriguez', text: 'Exceptional customer service and stunning bouquets. Highly recommend!', rating: 5 },
    { name: 'Emily Watson', text: 'Best floristry experience I\'ve ever had. Will definitely order again!', rating: 5 },
  ];

  return (
    <div style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '50px', fontSize: '2.5rem', color: '#222' }}>What Our Customers Say</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        {testimonials.map((t, i) => (
          <div key={i} style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderLeft: '4px solid #667eea' }}>
            <div style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#FFD700' }}>{'★'.repeat(t.rating)}</div>
            <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6', marginBottom: '20px', fontStyle: 'italic' }}>"{t.text}"</p>
            <p style={{ fontWeight: 'bold', color: '#222' }}>{t.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}