function Sidebar() {
  const items = ['Dashboard', 'Components', 'Settings', 'Help']

  return (
    <aside style={{ width: '200px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '16px' }}>
      <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px' }}>Navigation</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map(item => (
          <li key={item}>
            <a href="#" style={{ display: 'block', padding: '8px 12px', color: '#475569', textDecoration: 'none', borderRadius: '6px', fontSize: '14px' }}>
              {item}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default Sidebar
