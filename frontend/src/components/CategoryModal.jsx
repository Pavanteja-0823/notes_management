import { useState, useEffect, useRef } from 'react';
import {
  FiX,
  FiSave,
  FiTrash2,
  FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = [
  '#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
];

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  category,
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6b7280');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const inputRef = useRef(null);
  const isEditing = !!category;

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setColor(category.color || '#6b7280');
        setDescription(category.description || '');
      } else {
        setName('');
        setColor('#6b7280');
        setDescription('');
      }
      setShowDeleteConfirm(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, category]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (name.trim().length > 50) {
      toast.error('Name cannot exceed 50 characters');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        color,
        description: description.trim(),
      });
      toast.success(isEditing ? 'Category updated' : 'Category created');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category) return;
    setIsSaving(true);
    try {
      await onDelete(category._id);
      toast.success('Category deleted');
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl shadow-2xl bg-white dark:bg-gray-800 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEditing ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input w-full"
              placeholder="e.g., Work, Personal, Ideas"
              maxLength={50}
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                    color === c
                      ? 'border-gray-900 dark:border-white scale-110 ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input w-full"
              placeholder="Brief description..."
              maxLength={200}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {isEditing && !showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400
                    bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              ) : showDeleteConfirm ? (
                <div className="flex items-center gap-2">
                  <FiAlertTriangle size={14} className="text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">Delete this category?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {isSaving ? '...' : 'Yes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    No
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                  bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary flex items-center gap-1.5"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <FiSave size={14} />
                )}
                {isEditing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
