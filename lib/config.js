// Claude Hands - Central Configuration
// Single source of truth for ports, trackers, file extensions, and labels

const config = {
  relay: {
    httpPort: parseInt(process.env.CLAUDE_HANDS_HTTP_PORT, 10) || 9527,
    wsPort: parseInt(process.env.CLAUDE_HANDS_WS_PORT, 10) || 9528,
  },

  // Each tracker: which tools to match, operation type, and visual metadata
  trackers: [
    {
      tools: ['Read'],
      operation: 'read',
      visual: { emoji: '\u{1F441}\uFE0F', cssClass: 'reading' },
    },
    {
      tools: ['Edit'],
      operation: 'edit',
      visual: { emoji: '\u{1F91A}', cssClass: 'editing' },
    },
    {
      tools: ['Write'],
      operation: 'write',
      visual: { emoji: '\u{1F91A}', cssClass: 'editing' },
    },
    {
      tools: ['Glob', 'Grep'],
      operation: 'search',
      visual: { emoji: '\u{1F50D}', cssClass: 'reading' },
    },
  ],

  // File extensions that qualify as "frontend files" (skip others unless search)
  fileExtensions: ['.vue', '.css', '.scss', '.less', '.js', '.ts', '.jsx', '.tsx', '.html', '.json'],

  // Extension -> human-readable label for descriptions
  fileLabels: {
    '.vue': 'component',
    '.jsx': 'component',
    '.tsx': 'component',
    '.css': 'styles',
    '.scss': 'styles',
    '.less': 'styles',
    '.js': 'script',
    '.ts': 'script',
    '.html': 'template',
    '.json': 'config',
  },
};

export default config;
