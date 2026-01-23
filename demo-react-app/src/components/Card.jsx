function Card({ title, description }) {
  return (
    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
      <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1e293b' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>{description}</p>
    </div>
  )
}

export default Card
