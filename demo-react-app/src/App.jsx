import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Card from './components/Card.jsx'

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', alignContent: 'start' }}>
          <Card title="Getting Started" description="Set up Claude Hands to visualize component interactions in real time." />
          <Card title="React Support" description="React 16+ components are detected via fiber nodes in development mode." />
          <Card title="Vue Support" description="Vue 2 & 3 components are detected via __file in development mode." />
        </main>
      </div>
    </div>
  )
}

export default App
