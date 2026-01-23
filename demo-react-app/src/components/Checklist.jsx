import ChecklistItem from './ChecklistItem';

export default function Checklist({ checklist }) {
  const done = checklist.items.filter(i => i.done).length;
  const total = checklist.items.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div style={{ marginTop: '10px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>
          {checklist.title}
        </span>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
          {done}/{total}
        </span>
      </div>
      <div style={{
        height: '3px',
        background: '#e5e7eb',
        borderRadius: '2px',
        marginBottom: '6px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: pct === 100 ? '#10b981' : '#6366f1',
          borderRadius: '2px',
          transition: 'width 0.2s',
        }} />
      </div>
      {checklist.items.map(item => (
        <ChecklistItem key={item.id} item={item} />
      ))}
    </div>
  );
}
