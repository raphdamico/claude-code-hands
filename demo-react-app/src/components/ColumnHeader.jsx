export default function ColumnHeader({ title, count }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      padding: '0 4px',
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#374151',
      }}>
        {title}
      </span>
      <span style={{
        fontSize: '12px',
        color: '#9ca3af',
        background: '#e5e7eb',
        borderRadius: '10px',
        padding: '1px 8px',
        fontWeight: 500,
      }}>
        {count}
      </span>
    </div>
  );
}
