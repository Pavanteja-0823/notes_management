const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { requirePremium, checkUsageLimit, incrementUsage } = require('../middleware/premium');

// All routes require authentication
router.use(protect);

// ─── Premium Status ──────────────────────────────────────────────
router.get('/premium-status', aiController.checkPremium);

// ─── AI Features (all require premium + usage limit checks) ─────
// Note: incrementUsage runs BEFORE the handler (optimistic count)
// When adding real AI logic, move the increment to the controller's success path
const premiumRoute = (featureId, handler) => [
  requirePremium,
  checkUsageLimit(featureId),
  incrementUsage(featureId), // Pre-increment: counter increases before processing
  handler,
];

router.post('/summarize', ...premiumRoute('summarize', aiController.summarize));
router.post('/rewrite', ...premiumRoute('rewrite', aiController.rewrite));
router.post('/continue-writing', ...premiumRoute('continue-writing', aiController.continueWriting));
router.post('/grammar-check', ...premiumRoute('grammar-check', aiController.grammarCheck));
router.post('/improve-writing', ...premiumRoute('improve-writing', aiController.improveWriting));
router.post('/translate', ...premiumRoute('translate', aiController.translate));
router.post('/explain', ...premiumRoute('explain', aiController.explain));
router.post('/chat', ...premiumRoute('chat', aiController.chatWithNotes));
router.post('/smart-search', ...premiumRoute('smart-search', aiController.smartSearch));
router.post('/smart-tags', ...premiumRoute('smart-tags', aiController.smartTags));
router.post('/flashcards', ...premiumRoute('flashcards', aiController.flashcards));
router.post('/quiz', ...premiumRoute('quiz', aiController.quizGenerator));
router.post('/mind-map', ...premiumRoute('mind-map', aiController.mindMap));
router.post('/meeting-notes', ...premiumRoute('meeting-notes', aiController.meetingNotes));
router.post('/action-items', ...premiumRoute('action-items', aiController.actionItems));
router.post('/pdf-summarizer', ...premiumRoute('pdf-summarizer', aiController.pdfSummarizer));
router.post('/ocr', ...premiumRoute('ocr', aiController.ocrText));
router.post('/voice-to-notes', ...premiumRoute('voice-to-notes', aiController.voiceToNotes));
router.post('/email-generator', ...premiumRoute('email-generator', aiController.emailGenerator));
router.post('/blog-generator', ...premiumRoute('blog-generator', aiController.blogGenerator));
router.post('/study-notes', ...premiumRoute('study-notes', aiController.studyNotes));
router.post('/interview-questions', ...premiumRoute('interview-questions', aiController.interviewQuestions));
router.post('/todo-generator', ...premiumRoute('todo-generator', aiController.todoGenerator));
router.post('/presentation-generator', ...premiumRoute('presentation-generator', aiController.presentationGenerator));
router.post('/timeline-generator', ...premiumRoute('timeline-generator', aiController.timelineGenerator));
router.post('/table-generator', ...premiumRoute('table-generator', aiController.tableGenerator));
router.post('/code-explanation', ...premiumRoute('code-explanation', aiController.codeExplanation));
router.post('/code-generator', ...premiumRoute('code-generator', aiController.codeGenerator));
router.post('/daily-recap', ...premiumRoute('daily-recap', aiController.dailyRecap));
router.post('/weekly-insights', ...premiumRoute('weekly-insights', aiController.weeklyInsights));

module.exports = router;
