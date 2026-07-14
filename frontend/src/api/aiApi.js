import api from './axios';

const aiApi = {
  // ─── Premium Status ────────────────────────────────────────────
  checkPremiumStatus: () => api.get('/ai/premium-status'),

  // ─── All 30 AI Features ────────────────────────────────────────
  summarize: (data) => api.post('/ai/summarize', data),
  rewrite: (data) => api.post('/ai/rewrite', data),
  continueWriting: (data) => api.post('/ai/continue-writing', data),
  grammarCheck: (data) => api.post('/ai/grammar-check', data),
  improveWriting: (data) => api.post('/ai/improve-writing', data),
  translate: (data) => api.post('/ai/translate', data),
  explain: (data) => api.post('/ai/explain', data),
  chatWithNotes: (data) => api.post('/ai/chat', data),
  smartSearch: (data) => api.post('/ai/smart-search', data),
  smartTags: (data) => api.post('/ai/smart-tags', data),
  flashcards: (data) => api.post('/ai/flashcards', data),
  quizGenerator: (data) => api.post('/ai/quiz', data),
  mindMap: (data) => api.post('/ai/mind-map', data),
  meetingNotes: (data) => api.post('/ai/meeting-notes', data),
  actionItems: (data) => api.post('/ai/action-items', data),
  pdfSummarizer: (data) => api.post('/ai/pdf-summarizer', data),
  ocrText: (data) => api.post('/ai/ocr', data),
  voiceToNotes: (data) => api.post('/ai/voice-to-notes', data),
  emailGenerator: (data) => api.post('/ai/email-generator', data),
  blogGenerator: (data) => api.post('/ai/blog-generator', data),
  studyNotes: (data) => api.post('/ai/study-notes', data),
  interviewQuestions: (data) => api.post('/ai/interview-questions', data),
  todoGenerator: (data) => api.post('/ai/todo-generator', data),
  presentationGenerator: (data) => api.post('/ai/presentation-generator', data),
  timelineGenerator: (data) => api.post('/ai/timeline-generator', data),
  tableGenerator: (data) => api.post('/ai/table-generator', data),
  codeExplanation: (data) => api.post('/ai/code-explanation', data),
  codeGenerator: (data) => api.post('/ai/code-generator', data),
  dailyRecap: () => api.post('/ai/daily-recap'),
  weeklyInsights: () => api.post('/ai/weekly-insights'),

  // ─── Features List ─────────────────────────────────────────────
  getFeatures: () => api.get('/ai/features'),
};

export default aiApi;
