import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiArrowLeft,
  FiCalendar,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiTrendingUp,
  FiBook,
  FiStar,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import diaryApi from '../api/diaryApi';
import RichTextEditor from '../components/RichTextEditor';
import { useTheme } from '../context/ThemeContext';

const MOODS = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'excited', emoji: '🤩', label: 'Excited' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful' },
  { value: 'neutral', emoji: '😐', label: 'Neutral' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'angry', emoji: '😡', label: 'Angry' },
];

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const toDateString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Diary() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entry, setEntry] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [showEntryList, setShowEntryList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef(null);
  const hasChangesRef = useRef(false);
  const isSavingRef = useRef(false);

  // Fetch entry for selected date
  const fetchEntry = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = toDateString(selectedDate);
      const response = await diaryApi.getEntryByDate(dateStr);
      const data = response.data.data.entry;

      if (data) {
        setEntry(data);
        setTitle(data.title || '');
        setContent(data.content || '');
        setRichContent(data.richContent || '');
        setMood(data.mood || '');
        setTags((data.tags || []).join(', '));
      } else {
        setEntry(null);
        setTitle('');
        setContent('');
        setRichContent('');
        setMood('');
        setTags('');
      }
      hasChangesRef.current = false;
      setSaveStatus('');
    } catch (error) {
      toast.error('Failed to load diary entry');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await diaryApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      // Silent fail
    }
  }, []);

  // Fetch recent entries
  const fetchEntries = useCallback(async () => {
    try {
      const params = { limit: 30 };
      if (searchQuery) params.search = searchQuery;
      const response = await diaryApi.getEntries(params);
      setEntries(response.data.data.entries);
    } catch (error) {
      // Silent fail
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  useEffect(() => {
    fetchStats();
    fetchEntries();
  }, [fetchStats, fetchEntries]);

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChangesRef.current) return;

    // Don't queue auto-save while a save is in progress
    if (isSavingRef.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveStatus('unsaved');
    saveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 2000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [title, content, richContent, mood, tags]);

  const handleSave = async (isAutoSave = false) => {
    if (isAutoSave && !hasChangesRef.current) return;
    if (isSavingRef.current && isAutoSave) return;

    isSavingRef.current = true;
    setSaving(true);
    setSaveStatus('saving');
    try {
      const data = {
        date: toDateString(selectedDate),
        title: (title || '').trim(),
        content: (content || '').trim(),
        richContent: richContent || '',
        mood,
        tags: (tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      };

      const response = await diaryApi.saveEntry(data);
      setEntry(response.data.data.entry);
      setSaveStatus('saved');
      hasChangesRef.current = false;
      if (!isAutoSave) toast.success('Diary entry saved');
      fetchStats();
      fetchEntries();
    } catch (error) {
      setSaveStatus('unsaved');
      const errMsg = error?.message || error?.response?.data?.message || 'Failed to save entry';
      if (!isAutoSave) toast.error(errMsg);
    } finally {
      setSaving(false);
      isSavingRef.current = false;
    }
  };

  const handleDelete = async () => {
    if (!entry) return;
    if (!confirm('Are you sure you want to delete this diary entry?')) return;

    try {
      await diaryApi.deleteEntry(entry._id);
      toast.success('Entry deleted');
      setEntry(null);
      setTitle('');
      setContent('');
      setRichContent('');
      setMood('');
      setTags('');
      fetchStats();
      fetchEntries();
    } catch (error) {
      toast.error('Failed to delete entry');
    }
  };

  const handleToggleFavorite = async () => {
    if (!entry) return;
    try {
      await diaryApi.toggleFavorite(entry._id);
      setEntry((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  // Date navigation
  const goToPrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (next <= today) {
      setSelectedDate(next);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = toDateString(selectedDate) === toDateString(new Date());

  // Mark changes
  const markChanged = () => {
    hasChangesRef.current = true;
    setSaveStatus('unsaved');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Panel — Entry List / Stats */}
      <aside className="hidden lg:flex w-80 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Stats Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-500 
              transition-colors mb-3"
          >
            <FiArrowLeft size={12} />
            <span>Back to Notes</span>
          </button>
          <div className="flex items-center gap-2 mb-3">
            <FiBook size={20} className="text-primary-500" />
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">My Diary</h2>
          </div>
          {stats && (
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{stats.totalEntries}</p>
                <p className="text-[10px] text-gray-500 uppercase">Entries</p>
              </div>
              <div className="text-center p-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.streak}</p>
                <p className="text-[10px] text-gray-500 uppercase">Streak 🔥</p>
              </div>
              <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{stats.totalWords}</p>
                <p className="text-[10px] text-gray-500 uppercase">Words</p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search diary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-sm
                text-gray-900 dark:text-gray-100 placeholder-gray-400
                border border-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                outline-none transition-all"
            />
          </div>
        </div>

        {/* Entry List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {entries.map((e) => {
            const isSelected = entry && entry._id === e._id;
            const moodObj = MOODS.find((m) => m.value === e.mood);
            return (
              <button
                key={e._id}
                onClick={() => setSelectedDate(new Date(e.date))}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-sm">{moodObj?.emoji || ''}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                  {e.title || 'Untitled entry'}
                </p>
                {e.content && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                    {e.content.replace(/<[^>]*>/g, '').slice(0, 80)}
                  </p>
                )}
              </button>
            );
          })}
          {entries.length === 0 && (
            <div className="text-center py-8">
              <FiBook size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">No diary entries yet</p>
              <p className="text-xs text-gray-400 mt-1">Start writing today!</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content — Editor */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Date Navigation Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                title="Back to Dashboard"
              >
                <FiArrowLeft size={20} />
              </button>
              <button
                onClick={goToPrevDay}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
              >
                <FiChevronLeft size={20} />
              </button>
              <div className="text-center">
                <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {formatDate(selectedDate)}
                </h1>
                {isToday && (
                  <span className="text-xs text-primary-500 font-medium">Today</span>
                )}
              </div>
              <button
                onClick={goToNextDay}
                disabled={isToday}
                className={`p-2 rounded-xl transition-colors ${
                  isToday
                    ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
                }`}
              >
                <FiChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Save status */}
              {saveStatus && (
                <span className={`text-xs font-medium ${
                  saveStatus === 'saving' ? 'text-amber-500' :
                  saveStatus === 'saved' ? 'text-green-500' :
                  'text-gray-400'
                }`}>
                  {saveStatus === 'saving' ? 'Saving...' :
                   saveStatus === 'saved' ? '✓ Saved' :
                   '• Unsaved'}
                </span>
              )}

              {!isToday && (
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-xs font-medium bg-primary-50 text-primary-600 
                    dark:bg-primary-900/30 dark:text-primary-400 rounded-lg hover:bg-primary-100 
                    dark:hover:bg-primary-900/50 transition-colors"
                >
                  Today
                </button>
              )}

              {entry && (
                <>
                  <button
                    onClick={handleToggleFavorite}
                    className={`p-2 rounded-xl transition-colors ${
                      entry.isFavorite
                        ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title="Favorite"
                  >
                    <FiHeart size={18} fill={entry.isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 
                      dark:hover:bg-red-900/20 transition-colors"
                    title="Delete entry"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </>
              )}

              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium 
                  rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="animate-pulse space-y-4 max-w-3xl mx-auto">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Mood Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setMood(mood === m.value ? '' : m.value);
                        markChanged();
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                        mood === m.value
                          ? 'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 ring-2 ring-primary-300 dark:ring-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span className="text-xs font-medium">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <input
                type="text"
                placeholder="Give this day a title... (optional)"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markChanged();
                }}
                className="w-full text-2xl font-bold text-gray-800 dark:text-gray-100 
                  placeholder-gray-300 dark:placeholder-gray-600
                  bg-transparent border-none outline-none"
              />

              {/* Rich Text Editor */}
              <div className="min-h-[400px] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <RichTextEditor
                  content={richContent}
                  onChange={(html, text) => {
                    setRichContent(html);
                    setContent(text);
                    markChanged();
                  }}
                  placeholder="Dear diary... Write about your day, your feelings, your thoughts..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1 block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="work, family, travel, gratitude..."
                  value={tags}
                  onChange={(e) => {
                    setTags(e.target.value);
                    markChanged();
                  }}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700/50 rounded-xl text-sm
                    text-gray-900 dark:text-gray-100 placeholder-gray-400
                    border border-transparent focus:border-primary-500 focus:ring-1 focus:ring-primary-500
                    outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
