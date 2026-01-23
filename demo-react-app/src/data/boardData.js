export const currentUser = {
  name: 'Alex Morgan',
  initials: 'AM',
  avatar: null,
};

export const projects = [
  { id: 'p1', name: 'Website Redesign', color: '#6366f1', active: true },
  { id: 'p2', name: 'Mobile App v2', color: '#10b981', active: false },
  { id: 'p3', name: 'API Integration', color: '#f59e0b', active: false },
];

export const filters = [
  { id: 'f1', label: 'My Tasks', active: true },
  { id: 'f2', label: 'High Priority', active: false },
  { id: 'f3', label: 'Due Soon', active: false },
];

export const columns = [
  {
    id: 'col-todo',
    title: 'To Do',
    cards: [
      {
        id: 'card-1',
        title: 'Design new landing page',
        labels: [
          { id: 'l1', text: 'Design', color: '#6366f1' },
          { id: 'l2', text: 'High Priority', color: '#ef4444' },
        ],
        checklist: {
          title: 'Subtasks',
          items: [
            { id: 'ci-1', text: 'Create wireframes', done: true },
            { id: 'ci-2', text: 'Design mockups', done: false },
            { id: 'ci-3', text: 'Review with team', done: false },
          ],
        },
        assignees: [
          { initials: 'AM', color: '#6366f1' },
          { initials: 'JD', color: '#10b981' },
        ],
        dueDate: 'Jan 28',
      },
      {
        id: 'card-2',
        title: 'Set up analytics tracking',
        labels: [
          { id: 'l3', text: 'Engineering', color: '#3b82f6' },
        ],
        checklist: {
          title: 'Steps',
          items: [
            { id: 'ci-4', text: 'Install SDK', done: true },
            { id: 'ci-5', text: 'Configure events', done: false },
          ],
        },
        assignees: [
          { initials: 'SR', color: '#f59e0b' },
        ],
        dueDate: 'Feb 2',
      },
    ],
  },
  {
    id: 'col-progress',
    title: 'In Progress',
    cards: [
      {
        id: 'card-3',
        title: 'Implement user authentication',
        labels: [
          { id: 'l4', text: 'Engineering', color: '#3b82f6' },
          { id: 'l5', text: 'Security', color: '#a855f7' },
        ],
        checklist: {
          title: 'Tasks',
          items: [
            { id: 'ci-6', text: 'OAuth integration', done: true },
            { id: 'ci-7', text: 'Session management', done: true },
            { id: 'ci-8', text: 'Password reset flow', done: false },
          ],
        },
        assignees: [
          { initials: 'AM', color: '#6366f1' },
        ],
        dueDate: 'Jan 25',
      },
      {
        id: 'card-4',
        title: 'Write API documentation',
        labels: [
          { id: 'l6', text: 'Docs', color: '#10b981' },
        ],
        checklist: {
          title: 'Sections',
          items: [
            { id: 'ci-9', text: 'Authentication endpoints', done: true },
            { id: 'ci-10', text: 'User endpoints', done: false },
            { id: 'ci-11', text: 'Error handling guide', done: false },
          ],
        },
        assignees: [
          { initials: 'JD', color: '#10b981' },
          { initials: 'SR', color: '#f59e0b' },
        ],
        dueDate: 'Jan 30',
      },
    ],
  },
  {
    id: 'col-done',
    title: 'Done',
    cards: [
      {
        id: 'card-5',
        title: 'Set up CI/CD pipeline',
        labels: [
          { id: 'l7', text: 'DevOps', color: '#f59e0b' },
          { id: 'l8', text: 'Engineering', color: '#3b82f6' },
        ],
        checklist: {
          title: 'Pipeline',
          items: [
            { id: 'ci-12', text: 'Configure GitHub Actions', done: true },
            { id: 'ci-13', text: 'Add test stage', done: true },
            { id: 'ci-14', text: 'Deploy to staging', done: true },
          ],
        },
        assignees: [
          { initials: 'SR', color: '#f59e0b' },
        ],
        dueDate: 'Jan 20',
      },
      {
        id: 'card-6',
        title: 'Create component library',
        labels: [
          { id: 'l9', text: 'Design', color: '#6366f1' },
        ],
        checklist: {
          title: 'Components',
          items: [
            { id: 'ci-15', text: 'Button variants', done: true },
            { id: 'ci-16', text: 'Form inputs', done: true },
          ],
        },
        assignees: [
          { initials: 'AM', color: '#6366f1' },
          { initials: 'JD', color: '#10b981' },
        ],
        dueDate: 'Jan 18',
      },
    ],
  },
];
