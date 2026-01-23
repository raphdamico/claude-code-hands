import { currentUser } from '../data/boardData';

export default function UserMenu() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
    }}>
      <span style={{
        fontSize: '13px',
        color: '#6b7280',
      }}>
        {currentUser.name}
      </span>
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#6366f1',
        color: 'white',
        fontSize: '12px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {currentUser.initials}
      </div>
    </div>
  );
}
