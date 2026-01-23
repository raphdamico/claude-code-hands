import BoardHeader from './BoardHeader';
import Column from './Column';
import { columns } from '../data/boardData';

export default function BoardView() {
  return (
    <div style={{
      flex: 1,
      padding: '24px',
      overflow: 'auto',
    }}>
      <BoardHeader />
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'flex-start',
      }}>
        {columns.map(col => (
          <Column key={col.id} column={col} />
        ))}
      </div>
    </div>
  );
}
