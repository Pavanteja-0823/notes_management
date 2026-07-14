import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiX,
  FiClock,
  FiTag,
  FiFolder,
  FiDroplet,
  FiPaperclip,
  FiDownload,
  FiCheck,
  FiEdit3,
  FiTrash2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import notesApi from '../api/notesApi';

const NOTE_COLORS = [
  '#ffffff',
  '#f28b82',
  '#fbbc04',
  '#fff475',
  '#ccff90',
  '#a7ffeb',
  '#cbf0f8',
  '#aecbfa',
  '#d7aefb',
  '#fdcfe8',
];

export default function NoteEditor({
  note,
  categories,
  onSave,
  onClose,
  isOpen,
  defaultColor,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [richContent, setRichContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(defaultColor || '#ffffff');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tags, setTags] = useState('');
  const [reminder, setReminder] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'unsaved'
  const [hasChanges, setHasChanges] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const titleRef = useRef(null);
  const modalRef = useRef(null);
  const tagInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const pendingReminderRef = useRef(null);
  const saveTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Format a Date to 'YYYY-MM-DDTHH:MM' in local timezone for datetime-local input
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Initialize form with note data
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setRichContent(note.richContent || '');
      setSelectedColor(note.color || '#ffffff');
      setSelectedCategory(note.category?._id || note.category || '');
      setTags((note.tags || []).join(', '));
      setReminder(note.reminder ? formatDateForInput(note.reminder) : '');
      setAttachments(note.attachments || []);
    } else {
      setTitle('');
      setContent('');
      setRichContent('');
      setSelectedColor(defaultColor || '#ffffff');
      setSelectedCategory('');
      setTags('');
      setReminder('');
      setAttachments([]);
    }
    setSaveStatus('');
    setHasChanges(false);
    isFirstRender.current = true;
  }, [note, isOpen, defaultColor]);

  // Focus title on open
  useEffect(() => {
    if (isOpen && titleRef.current) {
      setTimeout(() => titleRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // We need a saved note to upload attachments
    if (!note) {
      toast.error('Save the note first before attaching files');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File too large. Max 10MB');
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await notesApi.uploadAttachment(note._id, formData);
      const updatedNote = response.data.data.note;
      setAttachments(updatedNote.attachments || []);
      toast.success('File attached');
      setHasChanges(true);
      setSaveStatus('unsaved');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle remove attachment
  const handleRemoveAttachment = async (attachmentId) => {
    if (!note) return;
    try {
      await notesApi.removeAttachment(note._id, attachmentId);
      setAttachments((prev) => prev.filter((a) => a._id !== attachmentId));
      toast.success('Attachment removed');
    } catch (error) {
      toast.error('Failed to remove attachment');
    }
  };

  // Focus tag input when it opens
  useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      setTimeout(() => tagInputRef.current?.focus(), 50);
    }
  }, [showTagInput]);

  // Track changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isOpen) {
      setHasChanges(true);
      setSaveStatus('unsaved');
    }
  }, [title, content, richContent, selectedColor, selectedCategory, tags, reminder]);

  // Auto-save on debounce
  useEffect(() => {
    if (!isOpen || !note || !hasChanges) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 2000);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [title, content, richContent, selectedColor, selectedCategory, tags, reminder, hasChanges]);

  const handleSave = async (isAutoSave = false) => {
    if (isAutoSave && !hasChanges) return;

    setIsSaving(true);
    setSaveStatus('saving');
    try {
      // Convert reminder to full ISO8601 format (with seconds) so backend validation passes
      const formattedReminder = reminder
        ? reminder.includes('T')
          ? `${reminder}:00`
          : reminder
        : '';

      const noteData = {
        title: title.trim() || 'Untitled',
        content: content.trim(),
        richContent: richContent || '',
        color: selectedColor,
        category: selectedCategory || null,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        ...(formattedReminder ? { reminder: formattedReminder } : {}),
      };

      await onSave(noteData);
      setSaveStatus('saved');
      setHasChanges(false);
    } catch (error) {
      setSaveStatus('unsaved');
      const errMsg = typeof error === 'object' && error !== null
        ? (error.message || error.response?.data?.message || 'Failed to save note')
        : 'Failed to save note';
      if (!isAutoSave) toast.error(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  // Export note
  const handleExport = useCallback((format) => {
    const noteTitle = title.trim() || 'Untitled';
    const noteContent = content || richContent?.replace(/<[^>]*>/g, '') || '';
    let data, mime, ext;

    switch (format) {
      case 'txt':
        data = `${noteTitle}\n\n${noteContent}`;
        mime = 'text/plain';
        ext = 'txt';
        break;
      case 'markdown':
        data = `# ${noteTitle}\n\n${noteContent}`;
        mime = 'text/markdown';
        ext = 'md';
        break;
      case 'json':
        data = JSON.stringify({
          title: noteTitle,
          content: noteContent,
          richContent,
          color: selectedColor,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          exportedAt: new Date().toISOString(),
        }, null, 2);
        mime = 'application/json';
        ext = 'json';
        break;
      default:
        return;
    }

    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${noteTitle.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Note exported as ${format.toUpperCase()}`);
  }, [title, content, richContent, selectedColor, tags]);

  // Keyboard shortcuts
  useKeyboardShortcuts(isOpen ? {
    'ctrl+s': (e) => { e.preventDefault(); handleSave(); },
  } : {}, isOpen);

  // Clear save status after showing "Saved"
  useEffect(() => {
    if (saveStatus === 'saved') {
      const timer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl 
          bg-white dark:bg-gray-800 animate-scale-in flex flex-col"
        style={{ backgroundColor: selectedColor === '#ffffff' ? undefined : selectedColor }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {note ? 'Editing note' : 'New note'}
            </span>
            {/* Save Status Indicator */}
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg">
                <span className="w-3 h-3 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                Saving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg animate-fade-in">
                <FiCheck size={12} />
                Saved
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg">
                <FiEdit3 size={12} />
                Unsaved
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Export button */}
            {note && (
              <div className="relative group">
                <button
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 transition-colors"
                  title="Export note"
                >
                  <FiDownload size={18} />
                </button>
                <div className="absolute right-0 top-full mt-1 w-36 py-1 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 hidden group-hover:block z-50">
                  <button
                    onClick={() => handleExport('txt')}
                    className="w-full px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Export as TXT
                  </button>
                  <button
                    onClick={() => handleExport('markdown')}
                    className="w-full px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Export as Markdown
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="btn-primary text-sm py-1.5 px-4"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : note ? (
                'Save'
              ) : (
                'Create'
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-semibold bg-transparent border-none outline-none
              placeholder-gray-400 text-gray-900 dark:text-gray-100"
          />

          {/* Rich Text Editor */}
          <RichTextEditor
            content={richContent || content}
            onChange={(html) => {
              setRichContent(html);
              // Also keep plain text content in sync
              const temp = document.createElement('div');
              temp.innerHTML = html;
              setContent(temp.textContent || temp.innerText || '');
            }}
            placeholder="Start writing..."
          />              {/* Reminder Display */}
          {reminder && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-2">
              <FiClock size={14} />
              <span>Reminder: {new Date(reminder).toLocaleString()}</span>
              <button
                onClick={() => setReminder('')}
                className="ml-1 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Remove reminder"
              >
                <FiX size={14} />
              </button>
            </div>
          )}

          {/* Attachments preview */}
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((att) => (
                <div
                  key={att._id}
                  className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-gray-700/30 rounded-xl px-3 py-2"
                >
                  <FiPaperclip size={14} className="text-gray-400 shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                    {att.originalName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {att.size ? `${(att.size / 1024).toFixed(1)} KB` : ''}
                  </span>
                  <button
                    onClick={() => handleRemoveAttachment(att._id)}
                    className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove attachment"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1">
              {/* Color picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-colors"
                  title="Change color"
                >
                  <FiDroplet size={18} />
                </button>
                {showColorPicker && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 flex gap-1 animate-scale-in">
                    {NOTE_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedColor(color);
                          setShowColorPicker(false);
                        }}
                        className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                          selectedColor === color
                            ? 'border-primary-500 scale-110'
                            : 'border-gray-300 dark:border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="relative">
               <button
                className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                  selectedCategory ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500'
                }`}
                title="Category"
              >
                <FiFolder size={18} />
              </button>
              <select
                id="note-category-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                style={{ zIndex: 1 }}
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
                {/* Show selected category indicator */}
                {selectedCategory && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] text-primary-500 dark:text-primary-400 font-medium whitespace-nowrap">
                    {categories.find((c) => c._id === selectedCategory)?.name || ''}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="relative">
                <button
                  onClick={() => setShowTagInput(!showTagInput)}
                  className={`p-2 rounded-xl transition-colors ${
                    showTagInput || tags
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-500'
                  }`}
                  title="Tags"
                >
                  <FiTag size={18} />
                </button>
                {showTagInput && (
                  <div className="absolute bottom-full left-0 mb-2 w-56 p-2.5 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600 z-50 animate-scale-in">
                    <p className="text-[10px] text-gray-400 mb-1 font-medium">Separate tags with commas</p>
                    <input
                      ref={tagInputRef}
                      type="text"
                      placeholder="e.g., work, urgent, ideas"
                      value={tags}
                      onChange={(e) => {
                        setTags(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-600 border-none outline-none text-gray-800 dark:text-gray-200 placeholder-gray-400"
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setShowTagInput(false);
                        if (e.key === 'Enter') setShowTagInput(false);
                      }}
                      onBlur={() => setTimeout(() => setShowTagInput(false), 200)}
                      autoFocus
                    />
                    {tags && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {tags.split(',').map(t => t.trim()).filter(Boolean).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reminder */}
              <button
                onClick={() => {
                  // Remove any previous pending input to avoid DOM leaks
                  if (pendingReminderRef.current && document.body.contains(pendingReminderRef.current)) {
                    document.body.removeChild(pendingReminderRef.current);
                  }
                  const input = document.createElement('input');
                  input.type = 'datetime-local';
                  input.style.position = 'fixed';
                  input.style.opacity = '0';
                  input.style.pointerEvents = 'none';
                  input.onchange = (e) => {
                    if (e.target.value) setReminder(e.target.value);
                    if (document.body.contains(input)) document.body.removeChild(input);
                    pendingReminderRef.current = null;
                  };
                  document.body.appendChild(input);
                  pendingReminderRef.current = input;
                  // Use showPicker() for modern browsers; input is in DOM as fallback
                  if (input.showPicker) {
                    input.showPicker();
                  }
                  // Clean up if user cancels (no 'change' event fired)
                  setTimeout(() => {
                    if (document.body.contains(input)) {
                      document.body.removeChild(input);
                      pendingReminderRef.current = null;
                    }
                  }, 60000);
                }}
                className={`p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                  reminder ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'
                }`}
                title={reminder ? 'Change reminder' : 'Set reminder'}
              >
                <FiClock size={18} />
              </button>

              {/* Attachment */}
              <div className="relative">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile || !note}
                  className={`p-2 rounded-xl transition-colors ${
                    uploadingFile
                      ? 'opacity-50 cursor-wait'
                      : 'hover:bg-black/5 dark:hover:bg-white/10'
                  } text-gray-500`}
                  title={note ? 'Attach file' : 'Save note first to attach files'}
                >
                  {uploadingFile ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin block" />
                  ) : (
                    <FiPaperclip size={18} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.gif,.svg,.zip"
                />
              </div>
            </div>

            {/* Tags display */}
            {tags && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                        bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
