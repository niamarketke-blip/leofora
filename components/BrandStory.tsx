export default function BrandStory() {
  return (
    <div style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', textAlign: 'center' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#222' }}>About Petale</h2>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#555', marginBottom: '30px' }}>
          At Petale, we believe in bringing joy through beautiful flowers. 
          Our passion for floristry drives us to deliver the freshest blooms and exceptional service to our customers.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '40px' }}>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✨</div>
            <p style={{ color: '#666' }}>Handpicked by experts</p>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🚀</div>
            <p style={{ color: '#666' }}>Fast delivery</p>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✅</div>
            <p style={{ color: '#666' }}>100% satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}