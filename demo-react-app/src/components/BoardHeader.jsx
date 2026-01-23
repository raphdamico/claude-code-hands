import FilterChip from './FilterChip';
import { filters } from '../data/boardData';

export default function BoardHeader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: '#1f2937',
        margin: 0,
      }}>
        Website Redesign
      </h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        {filters.map(f => (
          <FilterChip key={f.id} filter={f} />
        ))}
      </div>
    </div>
  );
}
