// Pre-built canvas templates

export const TEMPLATES = [
  {
    id: 'student',
    name: 'Student Template',
    description: 'Lecture notes, concept maps, and revision nodes',
    icon: '🎓',
    nodes: {
      't_n1': { id: 't_n1', type: 'concept', title: 'Lecture Topic', desc: 'Main subject of today\'s lecture', x: 100, y: 120, w: 220, timestamp: 0, imageUrl: null, color: 'blue', tags: ['lecture'], audioData: null },
      't_n2': { id: 't_n2', type: 'note', title: 'Key Concepts', desc: 'List the core ideas from this lecture', x: 400, y: 80, w: 220, timestamp: 0, imageUrl: null, color: 'green', tags: ['notes'], audioData: null },
      't_n3': { id: 't_n3', type: 'question', title: 'Questions to Answer', desc: 'What do I still not understand?', x: 400, y: 260, w: 220, timestamp: 0, imageUrl: null, color: 'violet', tags: ['questions'], audioData: null },
      't_n4': { id: 't_n4', type: 'note', title: 'Revision Summary', desc: 'Write a 3-sentence summary after reviewing', x: 700, y: 160, w: 220, timestamp: 0, imageUrl: null, color: 'amber', tags: ['review'], audioData: null },
      't_n5': { id: 't_n5', type: 'concept', title: 'Related Topics', desc: 'What other subjects connect to this?', x: 100, y: 300, w: 220, timestamp: 0, imageUrl: null, color: 'default', tags: [], audioData: null },
    },
    connections: [
      { id: 't_c1', from: 't_n1', fromSide: 'right', to: 't_n2', toSide: 'left' },
      { id: 't_c2', from: 't_n1', fromSide: 'right', to: 't_n3', toSide: 'left' },
      { id: 't_c3', from: 't_n2', fromSide: 'right', to: 't_n4', toSide: 'left' },
      { id: 't_c4', from: 't_n3', fromSide: 'right', to: 't_n4', toSide: 'left' },
      { id: 't_c5', from: 't_n1', fromSide: 'bottom', to: 't_n5', toSide: 'top' },
    ],
    nextNodeId: 10,
    nextConnId: 10,
  },

  {
    id: 'project',
    name: 'Project Template',
    description: 'Goals, tasks, notes and progress tracking',
    icon: '🚀',
    nodes: {
      't_n1': { id: 't_n1', type: 'concept', title: 'Project Goal', desc: 'Define the main objective in one sentence', x: 300, y: 80, w: 240, timestamp: 0, imageUrl: null, color: 'amber', tags: ['goal'], audioData: null },
      't_n2': { id: 't_n2', type: 'note', title: 'Phase 1: Research', desc: '• Gather requirements\n• Review existing solutions\n• Interview stakeholders', x: 80, y: 250, w: 220, timestamp: 0, imageUrl: null, color: 'blue', tags: ['todo'], audioData: null },
      't_n3': { id: 't_n3', type: 'note', title: 'Phase 2: Build', desc: '• Design architecture\n• Implement core features\n• Write tests', x: 360, y: 250, w: 220, timestamp: 0, imageUrl: null, color: 'blue', tags: ['todo'], audioData: null },
      't_n4': { id: 't_n4', type: 'note', title: 'Phase 3: Launch', desc: '• QA testing\n• Deploy to production\n• Monitor metrics', x: 640, y: 250, w: 220, timestamp: 0, imageUrl: null, color: 'blue', tags: ['todo'], audioData: null },
      't_n5': { id: 't_n5', type: 'question', title: 'Risks & Blockers', desc: 'What could go wrong? Plan mitigations', x: 200, y: 440, w: 220, timestamp: 0, imageUrl: null, color: 'rose', tags: ['important'], audioData: null },
      't_n6': { id: 't_n6', type: 'concept', title: 'Success Metrics', desc: 'How will you know when you\'re done?', x: 540, y: 440, w: 220, timestamp: 0, imageUrl: null, color: 'green', tags: ['done'], audioData: null },
    },
    connections: [
      { id: 't_c1', from: 't_n1', fromSide: 'bottom', to: 't_n2', toSide: 'top' },
      { id: 't_c2', from: 't_n1', fromSide: 'bottom', to: 't_n3', toSide: 'top' },
      { id: 't_c3', from: 't_n1', fromSide: 'bottom', to: 't_n4', toSide: 'top' },
      { id: 't_c4', from: 't_n2', fromSide: 'bottom', to: 't_n5', toSide: 'top' },
      { id: 't_c5', from: 't_n4', fromSide: 'bottom', to: 't_n6', toSide: 'top' },
    ],
    nextNodeId: 10,
    nextConnId: 10,
  },

  {
    id: 'brainstorm',
    name: 'Brainstorm Template',
    description: 'Free-form idea generation and concept mapping',
    icon: '💡',
    nodes: {
      't_n1': { id: 't_n1', type: 'concept', title: '💡 Central Idea', desc: 'Your main topic or problem statement', x: 360, y: 200, w: 200, timestamp: 0, imageUrl: null, color: 'amber', tags: ['idea'], audioData: null },
      't_n2': { id: 't_n2', type: 'concept', title: 'Idea Branch 1', desc: 'First direction to explore', x: 80, y: 100, w: 180, timestamp: 0, imageUrl: null, color: 'blue', tags: ['idea'], audioData: null },
      't_n3': { id: 't_n3', type: 'concept', title: 'Idea Branch 2', desc: 'Second direction to explore', x: 640, y: 100, w: 180, timestamp: 0, imageUrl: null, color: 'violet', tags: ['idea'], audioData: null },
      't_n4': { id: 't_n4', type: 'concept', title: 'Idea Branch 3', desc: 'Third direction to explore', x: 80, y: 340, w: 180, timestamp: 0, imageUrl: null, color: 'green', tags: ['idea'], audioData: null },
      't_n5': { id: 't_n5', type: 'concept', title: 'Idea Branch 4', desc: 'Fourth direction to explore', x: 640, y: 340, w: 180, timestamp: 0, imageUrl: null, color: 'rose', tags: ['idea'], audioData: null },
      't_n6': { id: 't_n6', type: 'question', title: '❓ Key Question', desc: 'What is the most important question to answer?', x: 340, y: 420, w: 200, timestamp: 0, imageUrl: null, color: 'default', tags: ['question'], audioData: null },
    },
    connections: [
      { id: 't_c1', from: 't_n1', fromSide: 'left', to: 't_n2', toSide: 'right' },
      { id: 't_c2', from: 't_n1', fromSide: 'right', to: 't_n3', toSide: 'left' },
      { id: 't_c3', from: 't_n1', fromSide: 'left', to: 't_n4', toSide: 'right' },
      { id: 't_c4', from: 't_n1', fromSide: 'right', to: 't_n5', toSide: 'left' },
      { id: 't_c5', from: 't_n1', fromSide: 'bottom', to: 't_n6', toSide: 'top' },
    ],
    nextNodeId: 10,
    nextConnId: 10,
  },
];
