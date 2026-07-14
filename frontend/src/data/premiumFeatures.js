import {
  FiZap, FiEdit3, FiArrowRight, FiCheckCircle, FiTool, FiGlobe,
  FiStar, FiTag, FiSearch, FiBook, FiEdit, FiLayers, FiCalendar,
  FiCheckSquare, FiMessageSquare, FiFileText, FiCamera, FiMic,
  FiMail, FiBookOpen, FiTarget,
} from 'react-icons/fi';

/**
 * Premium AI Features with monthly usage limits
 * 
 * Each feature has:
 * - id: unique identifier, matches API route suffix
 * - name: display name
 * - desc: short description
 * - icon: Feather icon component
 * - limit: monthly usage limit (0 = locked, Infinity = unlimited)
 * - limitLabel: human-readable limit label
 * - category: feature category for grouping
 */
const PREMIUM_FEATURES_DATA = [
  {
    id: 'summarize',
    name: 'AI Summarize',
    desc: 'Concise summaries of long notes',
    icon: FiZap,
    limit: 500,
    limitLabel: '500/month',
    category: 'Writing',
  },
  {
    id: 'rewrite',
    name: 'AI Rewrite',
    desc: 'Professional, Casual, Academic, or Simple tone',
    icon: FiEdit3,
    limit: 300,
    limitLabel: '300/month',
    category: 'Writing',
  },
  {
    id: 'continue-writing',
    name: 'AI Continue Writing',
    desc: 'Intelligent content completion',
    icon: FiArrowRight,
    limit: 300,
    limitLabel: '300/month',
    category: 'Writing',
  },
  {
    id: 'grammar-check',
    name: 'AI Grammar Fix',
    desc: 'Grammar, spelling & punctuation correction',
    icon: FiCheckCircle,
    limit: 500,
    limitLabel: '500/month',
    category: 'Writing',
  },
  {
    id: 'improve-writing',
    name: 'AI Improve Writing',
    desc: 'Improve clarity, readability & structure',
    icon: FiTool,
    limit: 300,
    limitLabel: '300/month',
    category: 'Writing',
  },
  {
    id: 'translate',
    name: 'AI Translate',
    desc: 'Translate into multiple languages',
    icon: FiGlobe,
    limit: 300,
    limitLabel: '300/month',
    category: 'Writing',
  },
  {
    id: 'explain',
    name: 'AI Explain Notes',
    desc: 'Explain difficult topics in simple language',
    icon: FiStar,
    limit: 300,
    limitLabel: '300/month',
    category: 'Learning',
  },
  {
    id: 'smart-tags',
    name: 'AI Smart Tags',
    desc: 'Auto-generated relevant tags',
    icon: FiTag,
    limit: Infinity,
    limitLabel: 'Unlimited',
    category: 'Organization',
  },
  {
    id: 'smart-search',
    name: 'AI Smart Search',
    desc: 'Natural language search across notes',
    icon: FiSearch,
    limit: Infinity,
    limitLabel: 'Unlimited',
    category: 'Organization',
  },
  {
    id: 'flashcards',
    name: 'AI Flashcards',
    desc: 'Study flashcards from notes',
    icon: FiBook,
    limit: 200,
    limitLabel: '200/month',
    category: 'Learning',
  },
  {
    id: 'quiz',
    name: 'AI Quiz Generator',
    desc: 'MCQs, True/False, Short Answer questions',
    icon: FiEdit,
    limit: 200,
    limitLabel: '200/month',
    category: 'Learning',
  },
  {
    id: 'mind-map',
    name: 'AI Mind Map',
    desc: 'Visual mind maps from notes',
    icon: FiLayers,
    limit: 100,
    limitLabel: '100/month',
    category: 'Learning',
  },
  {
    id: 'meeting-notes',
    name: 'AI Meeting Notes',
    desc: 'Structured meeting minutes',
    icon: FiCalendar,
    limit: 150,
    limitLabel: '150/month',
    category: 'Productivity',
  },
  {
    id: 'action-items',
    name: 'AI Action Items',
    desc: 'Extract tasks, deadlines & responsibilities',
    icon: FiCheckSquare,
    limit: 200,
    limitLabel: '200/month',
    category: 'Productivity',
  },
  {
    id: 'chat',
    name: 'AI Chat with Notes',
    desc: 'Ask questions about your notes',
    icon: FiMessageSquare,
    limit: Infinity,
    limitLabel: 'Unlimited',
    category: 'Productivity',
  },
  {
    id: 'pdf-summarizer',
    name: 'AI PDF Summarizer',
    desc: 'Research paper & document summaries',
    icon: FiFileText,
    limit: 200,
    limitLabel: '200 PDFs/month',
    category: 'Analysis',
  },
  {
    id: 'ocr',
    name: 'AI OCR',
    desc: 'Extract text from images',
    icon: FiCamera,
    limit: 200,
    limitLabel: '200 images/month',
    category: 'Analysis',
  },
  {
    id: 'voice-to-notes',
    name: 'AI Voice to Notes',
    desc: 'Speech to text conversion',
    icon: FiMic,
    limit: 600,
    limitLabel: '10 hours/month',
    category: 'Analysis',
  },
  {
    id: 'email-generator',
    name: 'AI Email Generator',
    desc: 'Professional email drafts from notes',
    icon: FiMail,
    limit: 200,
    limitLabel: '200/month',
    category: 'Productivity',
  },
  {
    id: 'blog-generator',
    name: 'AI Blog Generator',
    desc: 'Blog posts from notes',
    icon: FiEdit3,
    limit: 100,
    limitLabel: '100/month',
    category: 'Writing',
  },
  {
    id: 'study-notes',
    name: 'AI Study Notes',
    desc: 'Simplify complex notes into study material',
    icon: FiBookOpen,
    limit: 300,
    limitLabel: '300/month',
    category: 'Learning',
  },
  {
    id: 'interview-questions',
    name: 'AI Interview Questions',
    desc: 'Interview questions from notes',
    icon: FiTarget,
    limit: 200,
    limitLabel: '200/month',
    category: 'Learning',
  },
];

/** Categories with display info */
const FEATURE_CATEGORIES = [
  { id: 'Writing', label: 'Writing & Editing', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'Learning', label: 'Learning & Study', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  { id: 'Productivity', label: 'Productivity', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  { id: 'Organization', label: 'Organization', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'Analysis', label: 'Analysis & Input', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
];

export { PREMIUM_FEATURES_DATA, FEATURE_CATEGORIES };
export default PREMIUM_FEATURES_DATA;
