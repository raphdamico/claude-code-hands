export default function CardFooter({ assignees, dueDate }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '12px',
      paddingTop: '10px',
      borderTop: '1px solid #f3f4f6',
    }}>
      <div style={{ display: 'flex', gap: '0px' }}>
        {assignees.map((a, i) => (
          <div key={i} style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: a.color,
            color: 'white',
            fontSize: '10px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white',
            marginLeft: i > 0 ? '-6px' : '0',
          }}>
            {a.initials}
          </div>
        ))}
      </div>
      <span style={{
        fontSize: '11px',
        color: '#9ca3af',
      }}>
        {dueDate}
      </span>
    </div>
  );
}
