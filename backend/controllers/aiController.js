const Note = require('../models/Note');
const aiService = require('../services/aiService');

/**
 * Generic handler for single-text AI features (summarize, explain, etc.)
 */
const singleTextFeature = (feature) => async (req, res, next) => {
  try {
    const { text, noteId } = req.body;
    if (!text && !noteId) {
      return res.status(400).json({ success: false, message: 'Text or noteId is required.' });
    }

    let content = text;
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
      content = note.content || note.richContent || '';
    }

    const { result, provider } = await aiService.executeFeature(feature, { text: content });

    res.json({ success: true, data: { result, provider } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Summarize
 */
const summarize = singleTextFeature('summarize');

/**
 * AI Rewrite
 */
const rewrite = async (req, res, next) => {
  try {
    const { text, noteId, tone } = req.body;
    if (!text && !noteId) {
      return res.status(400).json({ success: false, message: 'Text or noteId is required.' });
    }

    let content = text;
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
      content = note.content || note.richContent || '';
    }

    const validTone = ['professional', 'casual', 'academic', 'simple'].includes(tone) ? tone : 'professional';
    const { result, provider } = await aiService.executeFeature('rewrite', { text: content, tone: validTone });

    res.json({ success: true, data: { result, provider, tone: validTone } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Continue Writing
 */
const continueWriting = singleTextFeature('continueWriting');

/**
 * AI Grammar & Spell Check
 */
const grammarCheck = singleTextFeature('grammarCheck');

/**
 * AI Improve Writing
 */
const improveWriting = singleTextFeature('improveWriting');

/**
 * AI Translate
 */
const translate = async (req, res, next) => {
  try {
    const { text, noteId, language } = req.body;
    if (!text && !noteId) return res.status(400).json({ success: false, message: 'Text or noteId required.' });
    if (!language) return res.status(400).json({ success: false, message: 'Target language is required.' });

    let content = text;
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
      content = note.content || note.richContent || '';
    }

    const { result, provider } = await aiService.executeFeature('translate', { text: content, language });
    res.json({ success: true, data: { result, provider, language } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Explain
 */
const explain = singleTextFeature('explain');

/**
 * AI Chat with Notes
 */
const chatWithNotes = async (req, res, next) => {
  try {
    const { question, noteIds } = req.body;
    if (!question) return res.status(400).json({ success: false, message: 'Question is required.' });

    // Get relevant notes for context
    const query = { user: req.user._id, isTrashed: false };
    if (noteIds && noteIds.length) query._id = { $in: noteIds };

    const notes = await Note.find(query).select('title content').limit(10);
    const context = notes.map(n => `Title: ${n.title}\n${n.content}`).join('\n\n---\n\n');

    const { result, provider } = await aiService.executeFeature('chatWithNotes', { question, context });
    res.json({ success: true, data: { result, provider } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Smart Search
 */
const smartSearch = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Search query is required.' });

    const notes = await Note.find({ user: req.user._id, isTrashed: false })
      .select('title content tags')
      .limit(20);

    const notesText = notes.map(n => `ID: ${n._id}\nTitle: ${n.title}\nContent: ${n.content}\nTags: ${(n.tags || []).join(', ')}`).join('\n\n---\n\n');

    const { result, provider } = await aiService.executeFeature('smartSearch', { query, notes: notesText });
    res.json({ success: true, data: { result, provider } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Smart Tags
 */
const smartTags = singleTextFeature('smartTags');

/**
 * AI Flashcards
 */
const flashcards = singleTextFeature('flashcards');

/**
 * AI Quiz Generator
 */
const quizGenerator = async (req, res, next) => {
  try {
    const { text, noteId, type } = req.body;
    if (!text && !noteId) return res.status(400).json({ success: false, message: 'Text or noteId required.' });

    let content = text;
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
      content = note.content || note.richContent || '';
    }

    const validType = ['MCQs', 'True/False', 'short-answer'].includes(type) ? type : 'MCQs';
    const { result, provider } = await aiService.executeFeature('quizGenerator', { text: content, type: validType });
    res.json({ success: true, data: { result, provider, type: validType } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Mind Map
 */
const mindMap = singleTextFeature('mindMap');

/**
 * AI Meeting Notes
 */
const meetingNotes = singleTextFeature('meetingNotes');

/**
 * AI Action Items
 */
const actionItems = singleTextFeature('actionItems');

/**
 * AI PDF Summarizer (accepts text extracted from PDF)
 */
const pdfSummarizer = singleTextFeature('pdfSummarizer');

/**
 * AI OCR (Image to Text) - accepts OCR-extracted text
 */
const ocrText = singleTextFeature('ocrText');

/**
 * AI Voice to Notes
 */
const voiceToNotes = singleTextFeature('voiceToNotes');

/**
 * AI Email Generator
 */
const emailGenerator = async (req, res, next) => {
  try {
    const { text, noteId, tone } = req.body;
    if (!text && !noteId) return res.status(400).json({ success: false, message: 'Text or noteId required.' });

    let content = text;
    if (noteId) {
      const note = await Note.findOne({ _id: noteId, user: req.user._id });
      if (!note) return res.status(404).json({ success: false, message: 'Note not found.' });
      content = note.content || note.richContent || '';
    }

    const { result, provider } = await aiService.executeFeature('emailGenerator', { text: content, tone: tone || 'professional' });
    res.json({ success: true, data: { result, provider } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Blog/Article Generator
 */
const blogGenerator = singleTextFeature('blogGenerator');

/**
 * AI Study Notes
 */
const studyNotes = singleTextFeature('studyNotes');

/**
 * AI Interview Questions
 */
const interviewQuestions = singleTextFeature('interviewQuestions');

/**
 * AI To-Do Generator
 */
const todoGenerator = singleTextFeature('todoGenerator');

/**
 * AI Presentation Generator
 */
const presentationGenerator = singleTextFeature('presentationGenerator');

/**
 * AI Timeline Generator
 */
const timelineGenerator = singleTextFeature('timelineGenerator');

/**
 * AI Table Generator
 */
const tableGenerator = singleTextFeature('tableGenerator');

/**
 * AI Code Explanation
 */
const codeExplanation = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code snippet is required.' });

    const { result, provider } = await aiService.executeFeature('codeExplanation', { code });
    res.json({ success: true, data: { result, provider } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Code Generator
 */
const codeGenerator = async (req, res, next) => {
  try {
    const { prompt, language } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Code description is required.' });

    const { result, provider } = await aiService.executeFeature('codeGenerator', { prompt: prompt, language: language || 'JavaScript' });
    res.json({ success: true, data: { result, provider, language: language || 'JavaScript' } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Daily Recap
 */
const dailyRecap = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notes = await Note.find({
      user: req.user._id,
      createdAt: { $gte: today },
      isTrashed: false,
    }).select('title content').limit(50);

    if (notes.length === 0) {
      return res.json({ success: true, data: { result: 'No notes created today.', provider: null } });
    }

    const notesText = notes.map(n => `Title: ${n.title}\n${n.content}`).join('\n\n---\n\n');
    const { result, provider } = await aiService.executeFeature('dailyRecap', { notes: notesText });
    res.json({ success: true, data: { result, provider } });
  } catch (error) {
    next(error);
  }
};

/**
 * AI Weekly Insights
 */
const weeklyInsights = async (req, res, next) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const notes = await Note.find({
      user: req.user._id,
      createdAt: { $gte: weekAgo },
      isTrashed: false,
    }).select('title content createdAt').limit(100);

    if (notes.length === 0) {
      return res.json({ success: true, data: { result: 'No notes created this week.', provider: null } });
    }

    const stats = {
      total: notes.length,
      withTags: notes.filter(n => n.tags?.length > 0).length,
    };

    const notesText = notes.map(n => `[${n.createdAt.toISOString().split('T')[0]}] Title: ${n.title}\n${n.content}`).join('\n\n---\n\n');

    const { result, provider } = await aiService.executeFeature('weeklyInsights', { notes: notesText });
    res.json({ success: true, data: { result, provider, stats } });
  } catch (error) {
    next(error);
  }
};

/**
 * Check premium status with per-feature usage data
 */
const checkPremium = async (req, res) => {
  const { getUsageData } = require('../middleware/premium');
  const usageData = await getUsageData(req.user._id);

  res.json({
    success: true,
    data: {
      isPremium: req.user.isPremium,
      premiumSince: req.user.premiumSince,
      aiUsage: usageData,
    },
  });
};

module.exports = {
  summarize,
  rewrite,
  continueWriting,
  grammarCheck,
  improveWriting,
  translate,
  explain,
  chatWithNotes,
  smartSearch,
  smartTags,
  flashcards,
  quizGenerator,
  mindMap,
  meetingNotes,
  actionItems,
  pdfSummarizer,
  ocrText,
  voiceToNotes,
  emailGenerator,
  blogGenerator,
  studyNotes,
  interviewQuestions,
  todoGenerator,
  presentationGenerator,
  timelineGenerator,
  tableGenerator,
  codeExplanation,
  codeGenerator,
  dailyRecap,
  weeklyInsights,
  checkPremium,
};
