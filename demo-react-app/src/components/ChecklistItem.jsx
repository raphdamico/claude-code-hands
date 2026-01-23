export default function ChecklistItem({ item }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '3px 0',
    }}>
      <input
        type="checkbox"
        checked={item.done}
        readOnly
        style={{
          width: '14px',
          height: '14px',
          accentColor: '#6366f1',
          cursor: 'pointer',
        }}
      />
      <span style={{
        fontSize: '12px',
        color: item.done ? '#9ca3af' : '#374151',
        textDecoration: item.done ? 'line-through' : 'none',
      }}>
        {item.text}
      </span>
    </div>
  );
}
