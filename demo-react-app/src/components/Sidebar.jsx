import ProjectItem from './ProjectItem';
import { projects } from '../data/boardData';

export default function Sidebar() {
  return (
    <aside style={{
      width: '240px',
      background: '#1b1f2e',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '0 12px',
        marginBottom: '8px',
      }}>
        Projects
      </div>
      {projects.map(p => (
        <ProjectItem key={p.id} project={p} />
      ))}
    </aside>
  );
}
