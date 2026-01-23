export default function ProjectItem({ project }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      background: project.active ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: project.color,
      }} />
      <span style={{
        fontSize: '13px',
        color: project.active ? 'white' : '#9ca3af',
        fontWeight: project.active ? 500 : 400,
      }}>
        {project.name}
      </span>
    </div>
  );
}
