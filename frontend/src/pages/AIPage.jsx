import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { PremiumBadge } from '../components/PremiumGuard';
import { PREMIUM_FEATURES_DATA } from '../data/premiumFeatures';
import aiApi from '../api/aiApi';
import toast from 'react-hot-toast';
import {
  FiArrowLeft,
  FiZap,
  FiSearch,
  FiCopy,
  FiCheck,
  FiLoader,
  FiRefreshCw,
  FiCpu,
  FiFileText,
  FiSun,
  FiBarChart2,
  FiLock,
} from 'react-icons/fi';

const quickActions = [
  { id: 'daily-recap', name: 'Daily Recap', icon: FiSun },
  { id: 'weekly-insights', name: 'Weekly Insights', icon: FiBarChart2 },
];

export default function AIPage() {
  const navigate = useNavigate();
  const { isPremium, getFeatureUsage, getUsagePercentage } = usePremium();
  const { user } = useAuth();

  const [activeFeature, setActiveFeature] = useState(null);
  const [inputText, setInputText] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const feature = PREMIUM_FEATURES_DATA.find((f) => f.id === activeFeature);

  const filteredFeatures = PREMIUM_FEATURES_DATA.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFeature = (featureId) => {
    setActiveFeature(featureId);
    setResult('');
    setInputText('');
    setSelectedOption('');
  };

  const handleRun = useCallback(async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text');
      return;
    }
    setLoading(true);
    setResult('');

    try {
      const text = inputText.trim();
      let response;

      switch (activeFeature) {
        case 'summarize':
          response = await aiApi.summarize({ text });
          break;
        case 'rewrite':
          response = await aiApi.rewrite({ text, tone: selectedOption || 'professional' });
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
          response = await aiApi.translate({ text, language: selectedOption || 'English' });
          break;
        case 'explain':
          response = await aiApi.explain({ text });
          break;
        case 'smart-tags':
          response = await aiApi.smartTags({ text });
          break;
        case 'flashcards':
          response = await aiApi.flashcards({ text });
          break;
        case 'quiz':
          response = await aiApi.quizGenerator({ text, type: selectedOption || 'MCQs' });
          break;
        case 'mind-map':
          response = await aiApi.mindMap({ text });
          break;
        case 'meeting-notes':
          response = await aiApi.meetingNotes({ text });
          break;
        case 'action-items':
          response = await aiApi.actionItems({ text });
          break;
        case 'email-generator':
          response = await aiApi.emailGenerator({ text, tone: 'professional' });
          break;
        case 'blog-generator':
          response = await aiApi.blogGenerator({ text });
          break;
        case 'study-notes':
          response = await aiApi.studyNotes({ text });
          break;
        case 'interview-questions':
          response = await aiApi.interviewQuestions({ text });
          break;
        case 'todo-generator':
          response = await aiApi.todoGenerator({ text });
          break;
        case 'presentation-generator':
          response = await aiApi.presentationGenerator({ text });
          break;
        case 'timeline-generator':
          response = await aiApi.timelineGenerator({ text });
          break;
        case 'table-generator':
          response = await aiApi.tableGenerator({ text });
          break;
        case 'code-explanation':
          response = await aiApi.codeExplanation({ code: text });
          break;
        case 'code-generator':
          response = await aiApi.codeGenerator({ prompt: text, language: selectedOption || 'JavaScript' });
          break;
        default:
          response = await aiApi.summarize({ text });
      }

      setResult(response.data.data.result);
      toast.success(`${feature?.name || 'AI'} complete`);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'AI processing failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeFeature, inputText, selectedOption, feature]);

  const handleQuickAction = async (actionId) => {
    setLoading(true);
    setResult('');
    try {
      let response;
      if (actionId === 'daily-recap') {
        response = await aiApi.dailyRecap();
      } else {
        response = await aiApi.weeklyInsights();
      }
      setResult(response.data.data.result);
      toast.success('Report generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Premium gradient header */}
      <header className="relative bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/30 via-transparent to-transparent dark:from-amber-900/5" />
        <div className="relative max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              aria-label="Back to dashboard"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200/30">
                <FiZap size={20} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Workspace</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">22 AI tools with monthly usage limits</p>
              </div>
            </div>
          </div>
          <PremiumBadge isPremium={isPremium} size="md" />
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Feature List with usage limits */}
          <div className="w-full lg:w-72 shrink-0">
            {/* Search */}
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
                  transition-all duration-200"
              />
            </div>

            {/* Features list with usage limits */}
            <div className="space-y-0.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredFeatures.map((f) => {
                const Icon = f.icon;
                const isActive = activeFeature === f.id;
                const usage = getFeatureUsage(f.id);
                const usagePct = getUsagePercentage(f.id);
                const isUnlimited = f.limit === Infinity;

                return (
                  <button
                    key={f.id}
                    onClick={() => handleSelectFeature(f.id)}
                    className={`w-full text-left transition-all duration-200 rounded-xl ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-900/20 dark:to-amber-900/10 ring-1 ring-amber-200 dark:ring-amber-800/50 shadow-sm'
                        : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-amber-100 dark:bg-amber-900/30'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          <Icon size={15} className={isActive ? 'text-amber-600' : 'text-gray-500 dark:text-gray-400'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold truncate text-gray-800 dark:text-gray-200">{f.name}</p>
                            {/* Limit badge */}
                            {!isPremium ? (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 dark:bg-gray-600 text-gray-400 flex items-center gap-0.5">
                                <FiLock size={8} />
                                Locked
                              </span>
                            ) : isUnlimited ? (
                              <span className="shrink-0 text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                                ∞
                              </span>
                            ) : (
                              <span className={`shrink-0 text-[9px] font-medium ${
                                usagePct > 80 ? 'text-red-500' : usagePct > 50 ? 'text-amber-500' : 'text-blue-500'
                              }`}>
                                {usage.used}/{usage.limit}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                      {/* Usage progress bar (premium only) */}
                      {isPremium && !isUnlimited && usagePct > 0 && (
                        <div className="mt-1.5 ml-11 pr-1">
                          <div className="w-full h-1 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                usagePct > 80 ? 'bg-red-400' : usagePct > 50 ? 'bg-amber-400' : 'bg-green-400'
                              }`}
                              style={{ width: `${usagePct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em] mb-2.5 px-1">
                Quick Actions
              </p>
              <div className="space-y-0.5">
                {quickActions.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickAction(action.id)}
                      disabled={loading}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm 
                        text-gray-600 dark:text-gray-400 
                        hover:bg-gray-100/80 dark:hover:bg-gray-800/50 
                        transition-colors disabled:opacity-50"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center">
                        <ActionIcon size={15} className="text-amber-500" />
                      </div>
                      <span className="text-xs font-medium">{action.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 min-w-0">
            {!activeFeature ? (
              /* Welcome State */
              <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 
                    dark:from-amber-900/30 dark:via-amber-800/10 dark:to-amber-900/20 
                    flex items-center justify-center shadow-lg shadow-amber-200/20">
                    <FiCpu size={44} className="text-amber-500 drop-shadow-sm" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-amber-300 dark:bg-amber-600 animate-pulse" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Welcome to AI Workspace
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Select an AI tool from the sidebar to get started. 
                    Choose from <span className="font-semibold text-amber-600 dark:text-amber-400">22 powerful features</span> 
                    to enhance, analyze, and transform your notes.
                  </p>
                </div>
                {/* Premium status */}
                <div className={`px-4 py-2 rounded-full text-xs font-medium border ${
                  isPremium
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                }`}>
                  {isPremium ? '✨ Premium Active — Unlimited features unlocked' : '🔒 Free Plan — Features locked. Upgrade to access'}
                </div>
              </div>
            ) : (
              /* Feature Work Area */
              <div className="space-y-5">
                {/* Feature header with usage info */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 
                    dark:from-amber-900/30 dark:to-amber-800/10 flex items-center justify-center shadow-sm">
                    {feature && <feature.icon size={24} className="text-amber-600 dark:text-amber-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{feature?.name}</h2>
                      {/* Usage limit badge */}
                      {feature && !isPremium && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium 
                          bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 flex items-center gap-1">
                          <FiLock size={10} />
                          Locked
                        </span>
                      )}
                      {feature && isPremium && feature.limit !== Infinity && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium
                          bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          {getFeatureUsage(feature.id)?.used}/{feature.limitLabel}
                        </span>
                      )}
                      {feature && isPremium && feature.limit === Infinity && (
                        <span className="shrink-0 px-2 py-0.5 rounded-lg text-xs font-medium
                          bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                          Unlimited
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{feature?.desc}</p>
                    {/* Usage progress bar for premium */}
                    {feature && isPremium && feature.limit !== Infinity && (
                      <div className="mt-2 max-w-xs">
                        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              getUsagePercentage(feature.id) > 80 ? 'bg-red-400' 
                                : getUsagePercentage(feature.id) > 50 ? 'bg-amber-400' 
                                : 'bg-green-400'
                            }`}
                            style={{ width: `${getUsagePercentage(feature.id)}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {getFeatureUsage(feature.id)?.remaining} remaining this month
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input area */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <FiFileText size={14} className="text-gray-400" />
                      {feature?.input === 'code' ? 'Code Snippet' : feature?.input === 'prompt' ? 'Description' : 'Your Text'}
                    </label>
                  </div>
                  <div className="p-5 space-y-4">
                    {feature?.options && (
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-medium text-gray-500">Options:</span>
                        <select
                          value={selectedOption}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 
                            rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 outline-none 
                            focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400
                            transition-all duration-200"
                        >
                          {feature.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={
                        feature?.input === 'code'
                          ? 'Paste your code here...'
                          : feature?.input === 'prompt'
                            ? 'Describe what code you want generated...'
                            : feature?.input === 'chat'
                              ? 'Ask a question about your notes...'
                              : 'Paste your note content or type here...'
                      }
                      className="w-full min-h-[220px] p-4 rounded-xl bg-gray-50/80 dark:bg-gray-700/30 
                        border border-gray-200 dark:border-gray-600
                        text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 
                        outline-none resize-y focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400
                        transition-all duration-200"
                    />

                    <button
                      onClick={handleRun}
                      disabled={loading || !inputText.trim()}
                      className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm text-white
                        bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600
                        shadow-lg shadow-amber-200/40 dark:shadow-amber-900/20
                        hover:shadow-xl hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30
                        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                        active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <FiLoader size={16} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <FiZap size={16} />
                          Run {feature?.name}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Result */}
                {result && !loading && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden animate-scale-in">
                    <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-50/50 
                      dark:from-gray-800 dark:to-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <FiZap size={14} className="text-amber-500" />
                        Result
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 
                            hover:text-gray-700 dark:hover:text-gray-300 
                            bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600
                            hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
                        >
                          {copied ? <FiCheck size={13} className="text-green-500" /> : <FiCopy size={13} />}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={handleRun}
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium
                            text-amber-600 dark:text-amber-400 
                            bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/50
                            hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all"
                        >
                          <FiRefreshCw size={12} />
                          Regenerate
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {result}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {loading && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-10 
                    flex flex-col items-center gap-4">
                    <div className="relative">
                      <FiLoader size={32} className="animate-spin text-amber-500" />
                      <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/10 blur-md" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        AI is processing your request
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        This typically takes a few seconds
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
