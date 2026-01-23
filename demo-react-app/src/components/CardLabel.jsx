export default function CardLabel({ label }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '10px',
      fontSize: '11px',
      fontWeight: 500,
      color: label.color,
      background: `${label.color}18`,
      lineHeight: '16px',
    }}>
      {label.text}
    </span>
  );
}
