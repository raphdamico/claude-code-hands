import UserMenu from './UserMenu';

export default function AppHeader() {
  return (
    <header style={{
      height: '56px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <div style={{
        fontSize: '15px',
        fontWeight: 700,
        color: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ color: '#6366f1' }}>&#9670;</span>
        TaskFlow
      </div>
      <UserMenu />
    </header>
  );
}
