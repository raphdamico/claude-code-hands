export default function FilterChip({ filter }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '14px',
      fontSize: '12px',
      fontWeight: 500,
      cursor: 'pointer',
      background: filter.active ? '#6366f1' : '#f3f4f6',
      color: filter.active ? 'white' : '#6b7280',
      border: filter.active ? '1px solid #6366f1' : '1px solid #e5e7eb',
    }}>
      {filter.label}
    </span>
  );
}
