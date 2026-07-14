import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import NoteCard from '../components/NoteCard';
import NoteEditor from '../components/NoteEditor';
import { useAuth } from '../context/AuthContext';
import notesApi from '../api/notesApi';
import categoriesApi from '../api/categoriesApi';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts';
import {
  FiPlus,
  FiGrid,
  FiList,
  FiRefreshCw,
  FiInbox,
  FiDownload,
  FiSearch,
  FiEdit3,
  FiTrash2,
  FiArchive,
  FiStar,
} from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // ─── State ───────────────────────────────────────────────────
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // ─── Data Fetching ──────────────────────────────────────────

  const fetchNotes = useCallback(async () => {
    try {
      const params = {
        sortBy,
        sortOrder,
        ...activeFilter,
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      };
      const response = await notesApi.getNotes(params);
      setNotes(response.data.data.notes);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [activeFilter, selectedCategory, searchQuery, sortBy, sortOrder]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getCategories();
      setCategories(response.data.data.categories);
    } catch (error) {
      // Silently fail for categories
    }
  }, []);

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [fetchNotes, fetchCategories]);

  // ─── Search Debounce ─────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery) return;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchNotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchNotes]);

  // ─── Keyboard Shortcuts ───────────────────────────────────────
  const shortcuts = useMemo(() => ({
    'ctrl+n': (e) => {
      e.preventDefault();
      handleCreateNote();
    },
    'ctrl+f': (e) => {
      e.preventDefault();
      const searchInput = document.querySelector('input[placeholder="Search notes..."]');
      searchInput?.focus();
    },
    'ctrl+d': (e) => {
      e.preventDefault();
      toast('Use Delete key on a selected note card to trash it.', { icon: '⌨️' });
    },
  }), []);

  useKeyboardShortcuts(shortcuts);

  // ─── Dashboard Stats ──────────────────────────────────────────
  const stats = useMemo(() => {
    const allNotes = notes;
    return {
      total: allNotes.length,
      favorites: allNotes.filter((n) => n.isFavorite).length,
      archived: allNotes.filter((n) => n.isArchived).length,
      trashed: allNotes.filter((n) => n.isTrashed).length,
      categories: categories.length,
      storageUsed: '—',
    };
  }, [notes, categories]);

  // ─── Note Actions ────────────────────────────────────────────

  const handleCreateNote = () => {
    setSelectedNote(null);
    setShowEditor(true);
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowEditor(true);
  };

  const handleSaveNote = async (noteData) => {
    try {
      if (selectedNote) {
        await notesApi.updateNote(selectedNote._id, noteData);
        toast.success('Note updated');
      } else {
        await notesApi.createNote(noteData);
        toast.success('Note created');
      }
      setShowEditor(false);
      setSelectedNote(null);
      fetchNotes();
      fetchCategories();
    } catch (error) {
      throw error;
    }
  };

  const handlePinNote = async (noteId) => {
    try {
      await notesApi.togglePin(noteId);
      setNotes((prev) =>
        prev.map((n) =>
          n._id === noteId ? { ...n, isPinned: !n.isPinned } : n
        )
      );
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleFavoriteNote = async (noteId) => {
    try {
      await notesApi.toggleFavorite(noteId);
      setNotes((prev) =>
        prev.map((n) =>
          n._id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
        )
      );
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleArchiveNote = async (noteId) => {
    try {
      const note = notes.find((n) => n._id === noteId);
      if (note?.isArchived) {
        await notesApi.updateNote(noteId, { isArchived: false });
        toast.success('Note unarchived');
      } else {
        await notesApi.updateNote(noteId, { isArchived: true });
        toast.success('Note archived');
      }
      fetchNotes();
    } catch (error) {
      toast.error('Failed to archive note');
    }
  };

  const handleTrashNote = async (noteId) => {
    try {
      await notesApi.trashNote(noteId);
      toast.success('Note moved to trash');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to trash note');
    }
  };

  const handleRestoreNote = async (noteId) => {
    try {
      await notesApi.restoreNote(noteId);
      toast.success('Note restored');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to restore note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await notesApi.deleteNote(noteId);
      toast.success('Note permanently deleted');
      fetchNotes();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSelectedCategory(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setActiveFilter({});
  };

  // ─── Category CRUD ────────────────────────────────────────────
  const handleCreateCategory = async (data) => {
    try {
      await categoriesApi.createCategory(data);
      toast.success('Category created');
      fetchCategories();
    } catch (error) {
      throw error;
    }
  };

  const handleUpdateCategory = async (id, data) => {
    try {
      await categoriesApi.updateCategory(id, data);
      toast.success('Category updated');
      fetchCategories();
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await categoriesApi.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
      fetchNotes();
    } catch (error) {
      throw error;
    }
  };

  // ─── Export All Notes ─────────────────────────────────────────
  const handleExportAll = () => {
    if (notes.length === 0) {
      toast.error('No notes to export');
      return;
    }
    try {
      const data = notes.map((note) => ({
        title: note.title || 'Untitled',
        content: note.content || '',
        color: note.color,
        tags: note.tags || [],
        category: note.category?.name || null,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      }));
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all_notes_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${notes.length} notes exported`);
    } catch (error) {
      toast.error('Failed to export notes');
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        categories={categories}
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        stats={stats}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-2">
              {/* New note button */}
              <button
                onClick={handleCreateNote}
                className="btn-primary text-sm py-2 px-4"
                title="New Note (Ctrl+N)"
              >
                <FiPlus size={16} />
                <span className="hidden sm:inline">New Note</span>
              </button>

              {/* View mode toggle */}
              <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  } transition-colors`}
                  title="Grid view"
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-gray-100 dark:bg-gray-700 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  } transition-colors`}
                  title="List view"
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Export All */}
              {notes.length > 0 && (
                <button
                  onClick={handleExportAll}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                  title="Export all notes"
                >
                  <FiDownload size={16} />
                </button>
              )}

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by);
                  setSortOrder(order);
                }}
                className="text-sm bg-gray-100 dark:bg-gray-700 border-none rounded-xl px-3 py-2 
                  text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
              >
                <option value="createdAt-desc">Newest first</option>
                <option value="createdAt-asc">Oldest first</option>
                <option value="updatedAt-desc">Recently updated</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="isPinned-desc">Pinned first</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchNotes}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                title="Refresh"
              >
                <FiRefreshCw size={16} className="hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <DashboardSkeleton viewMode={viewMode} />
          ) : notes.length === 0 ? (
            /* Empty States */
            <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
              <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                {searchQuery ? (
                  <FiSearch size={40} className="text-gray-300 dark:text-gray-600" />
                ) : activeFilter.isTrashed ? (
                  <FiTrash2 size={40} className="text-gray-300 dark:text-gray-600" />
                ) : activeFilter.isArchived ? (
                  <FiArchive size={40} className="text-gray-300 dark:text-gray-600" />
                ) : activeFilter.isFavorite ? (
                  <FiStar size={40} className="text-gray-300 dark:text-gray-600" />
                ) : (
                  <FiInbox size={40} className="text-gray-300 dark:text-gray-600" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {searchQuery
                    ? 'No matching notes'
                    : activeFilter.isTrashed
                      ? 'Trash is empty'
                      : activeFilter.isArchived
                        ? 'No archived notes'
                        : activeFilter.isFavorite
                          ? 'No favorite notes'
                          : 'No notes yet'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  {searchQuery
                    ? `No notes match "${searchQuery}". Try a different search term or clear filters.`
                    : activeFilter.isTrashed
                      ? 'Deleted notes appear here. They can be restored within 30 days.'
                      : activeFilter.isArchived
                        ? 'Archived notes are hidden from the main view.'
                        : activeFilter.isFavorite
                          ? 'Mark notes as favorite to see them here.'
                          : 'Create your first note to get started!'}
                </p>
              </div>
              {!searchQuery && !activeFilter.isTrashed && !activeFilter.isArchived && (
                <button onClick={handleCreateNote} className="btn-primary mt-2">
                  <FiPlus size={16} />
                  Create your first note
                </button>
              )}
              {activeFilter.isTrashed && notes.length === 0 && (
                <button
                  onClick={() => setActiveFilter({})}
                  className="btn-secondary mt-2"
                >
                  Back to All Notes
                </button>
              )}
            </div>
          ) : (
            /* Notes Grid/List */
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max'
                  : 'flex flex-col gap-3'
              }
            >
              {notes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onPin={handlePinNote}
                  onFavorite={handleFavoriteNote}
                  onArchive={handleArchiveNote}
                  onTrash={handleTrashNote}
                  onRestore={handleRestoreNote}
                  onDelete={handleDeleteNote}
                  onClick={handleEditNote}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Modal */}
      <NoteEditor
        note={selectedNote}
        categories={categories}
        onSave={handleSaveNote}
        onClose={() => {
          setShowEditor(false);
          setSelectedNote(null);
        }}
        isOpen={showEditor}
        defaultColor={user?.preferences?.defaultNoteColor}
      />

      {/* Keyboard shortcut hints */}
      <div className="fixed bottom-4 right-4 z-40 hidden lg:block">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 px-3 py-2">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px]">Ctrl+N</kbd> New</span>
            <span><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px]">Ctrl+F</kbd> Search</span>
            <span><kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-mono text-[10px]">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}


