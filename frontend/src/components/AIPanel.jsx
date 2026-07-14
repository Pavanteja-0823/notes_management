import { useState } from 'react';
import {
  FiZap,
  FiLoader,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiCopy,
  FiCheck,
  FiRefreshCw,
  FiFileText,
  FiEdit3,
  FiArrowRight,
  FiCheckCircle,
  FiSearch,
  FiTag,
  FiBook,
  FiCheckSquare,
  FiMail,
  FiGlobe,
  FiTool,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { usePremium } from '../context/PremiumContext';
import { PremiumBadge } from './PremiumGuard';
import aiApi from '../api/aiApi';

const AI_FEATURES = [
  { id: 'summarize', label: 'Summarize', icon: FiFileText, desc: 'Get a concise summary' },
  { id: 'rewrite', label: 'Rewrite', icon: FiEdit3, desc: 'Change tone & style' },
  { id: 'continue-writing', label: 'Continue', icon: FiArrowRight, desc: 'Continue writing' },
  { id: 'grammar-check', label: 'Grammar', icon: FiCheckCircle, desc: 'Fix grammar & spelling' },
  { id: 'improve-writing', label: 'Improve', icon: FiTool, desc: 'Improve clarity' },
  { id: 'translate', label: 'Translate', icon: FiGlobe, desc: 'Translate text' },
  { id: 'smart-tags', label: 'Smart Tags', icon: FiTag, desc: 'Auto-generate tags' },
  { id: 'action-items', label: 'Actions', icon: FiCheckSquare, desc: 'Extract tasks' },
  { id: 'flashcards', label: 'Flashcards', icon: FiBook, desc: 'Study cards' },
  { id: 'todo-generator', label: 'To-Do', icon: FiCheckSquare, desc: 'Create checklist' },
  { id: 'email-generator', label: 'Email', icon: FiMail, desc: 'Draft email' },
  { id: 'smart-search', label: 'Search', icon: FiSearch, desc: 'Smart search' },
];

export default function AIPanel({ noteContent, noteTitle, onResult, isOpen, onClose }) {
  const { isPremium, requirePremium } = usePremium();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeFeature, setActiveFeature] = useState(null);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleFeature = async (featureId) => {
    if (!requirePremium()) return;

    if (!noteContent && !noteTitle) {
      toast.error('Add some content to the note first');
      return;
    }

    setActiveFeature(featureId);
    setIsProcessing(true);
    setResult('');

    try {
      const text = noteContent || noteTitle;
      const feature = AI_FEATURES.find((f) => f.id === featureId);
      const featureName = feature?.label || featureId;

      let response;
      switch (featureId) {
        case 'summarize':
          response = await aiApi.summarize({ text });
          break;
        case 'rewrite':
          response = await aiApi.rewrite({ text, tone: 'professional' });
          break;
        case 'continue-writing':
          response = await aiApi.continueWriting({ text });
          break;
        case 'grammar-check':
          response = await aiApi.grammarCheck({ text });
          break;
        case 'improve-writing':
          response = await aiApi.improveWriting({ text });
          break;
        case 'translate':
          response = await aiApi.translate({ text, language: 'English' });
          break;
        case 'smart-tags':
          response = await aiApi.smartTags({ text });
          break;
        case 'flashcards':
          response = await aiApi.flashcards({ text });
          break;
        case 'action-items':
          response = await aiApi.actionItems({ text });
          break;
        case 'todo-generator':
          response = await aiApi.todoGenerator({ text });
          break;
        case 'email-generator':
          response = await aiApi.emailGenerator({ text, tone: 'professional' });
          break;
        case 'smart-search':
          response = await aiApi.smartSearch({ query: text });
          break;
        default:
          response = await aiApi.summarize({ text });
      }

      const aiResult = response.data.data.result;
      setResult(aiResult);
      toast.success(`${featureName} complete`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'AI processing failed';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyResult = () => {
    if (result && onResult) {
      onResult(result);
      toast.success('Result applied to note');
    }
  };

  const handleCopyResult = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40">
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs 
          hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors duration-200"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
            <FiZap size={12} className="text-white" />
          </div>
          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">AI Tools</span>
          {!isPremium && <PremiumBadge />}
        </div>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-[10px]">{isExpanded ? 'Hide' : 'Show'}</span>
          {isExpanded ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3">
          {/* Feature buttons grid */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AI_FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isActive = activeFeature === feature.id;
              return (
                <button
                  key={feature.id}
                  onClick={() => handleFeature(feature.id)}
                  disabled={isProcessing}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-200 ${
                      isActive && isProcessing
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 ring-1 ring-amber-300 dark:ring-amber-700 shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-amber-50/50 dark:hover:bg-gray-600/80 border border-gray-200/80 dark:border-gray-600/80 hover:border-amber-200 dark:hover:border-amber-700/50'
                    }
                    disabled:opacity-50 disabled:cursor-wait`}
                  title={feature.desc}
                >
                  <Icon size={12} className={isActive && isProcessing ? 'text-amber-500' : ''} />
                  {feature.label}
                </button>
              );
            })}
          </div>

          {/* Loading state */}
          {isProcessing && (
            <div className="flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-400 
              bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-900/15 dark:to-transparent 
              rounded-xl px-4 py-3 border border-amber-200/50 dark:border-amber-800/30">
              <FiLoader size={14} className="animate-spin text-amber-500" />
              <span className="font-medium">AI is processing...</span>
              <span className="text-amber-400 dark:text-amber-500">·</span>
              <span className="text-amber-500/70 dark:text-amber-500/70">This may take a moment</span>
            </div>
          )}

          {/* Result */}
          {result && !isProcessing && (
            <div className="relative bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm">
              {/* Result header */}
              <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-50/50 
                dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-600">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <FiZap size={12} className="text-amber-500" />
                  AI Result
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyResult}
                    className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 
                      hover:from-amber-600 hover:to-amber-700 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    Apply to note
                  </button>
                  <button
                    onClick={handleCopyResult}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 transition-colors"
                    title="Copy result"
                  >
                    {copied ? <FiCheck size={13} className="text-green-500" /> : <FiCopy size={13} />}
                  </button>
                </div>
              </div>
              {/* Result body */}
              <div className="p-4">
                <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed max-h-56 overflow-y-auto">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
