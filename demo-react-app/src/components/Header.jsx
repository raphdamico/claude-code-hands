function Header() {
  return (
    <header style={{ background: '#1e293b', color: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '24px' }}>🤚</span>
      <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Claude Hands - React Demo</h1>
      <nav style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
        <a href="#" style={{ color: '#93c5fd', textDecoration: 'none' }}>Home</a>
        <a href="#" style={{ color: '#93c5fd', textDecoration: 'none' }}>About</a>
        <a href="#" style={{ color: '#93c5fd', textDecoration: 'none' }}>Docs</a>
      </nav>
    </header>
  )
}

export default Header
