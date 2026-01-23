import ColumnHeader from './ColumnHeader';
import TaskCard from './TaskCard';

export default function Column({ column }) {
  return (
    <div style={{
      background: '#f7f8fa',
      borderRadius: '10px',
      padding: '14px',
      minWidth: '280px',
      maxWidth: '300px',
      flex: '1',
    }}>
      <ColumnHeader title={column.title} count={column.cards.length} />
      {column.cards.map(card => (
        <TaskCard key={card.id} card={card} />
      ))}
    </div>
  );
}
