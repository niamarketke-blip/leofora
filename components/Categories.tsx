export default function Categories() {
  const categories = [
    { name: 'Bouquets', emoji: '💐' },
    { name: 'Plants', emoji: '🌿' },
    { name: 'Arrangements', emoji: '🌹' },
    { name: 'Gifts', emoji: '🎁' },
  ];

  return (
    <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2rem', color: '#333' }}>Shop by Category</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {categories.map((cat) => (
          <div key={cat.name} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ 
              width: '100%', 
              height: '180px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '4rem',
              transition: 'transform 0.3s'
            }} onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}>
              {cat.emoji}
            </div>\n            <h3 style={{ marginTop: '15px', color: '#333', fontSize: '1.2rem' }}>{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}