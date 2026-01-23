import CardLabel from './CardLabel';
import Checklist from './Checklist';
import CardFooter from './CardFooter';

export default function TaskCard({ card }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '14px',
      border: '1px solid #e5e7eb',
      marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
        {card.labels.map(label => (
          <CardLabel key={label.id} label={label} />
        ))}
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#1f2937',
        lineHeight: '1.4',
      }}>
        {card.title}
      </div>
      <Checklist checklist={card.checklist} />
      <CardFooter assignees={card.assignees} dueDate={card.dueDate} />
    </div>
  );
}
