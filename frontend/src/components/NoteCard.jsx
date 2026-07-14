import { useState } from 'react';
import {
  FiMapPin,
  FiHeart,
  FiArchive,
  FiTrash2,
  FiClock,
  FiPaperclip,
  FiRotateCcw,
  FiStar,
} from 'react-icons/fi';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export default function NoteCard({
  note,
  onPin,
  onFavorite,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
  onClick,
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isTrashed = note.isTrashed;
  const isArchived = note.isArchived;

  return (
    <div
      className={`group relative card-hover animate-scale-in overflow-hidden`}
      style={{
        backgroundColor: note.color || '#ffffff',
        borderColor: isHovered ? undefined : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color bar */}
      {note.color && note.color !== '#ffffff' && (
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ backgroundColor: note.color }}
        />
      )}

      {/* Main content (clickable) */}
      <button
        onClick={() => onClick(note)}
        className="w-full text-left p-4 pb-2"
      >
        {/* Title */}
        {note.title && (
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1.5 line-clamp-2">
            {note.title}
          </h3>
        )}

        {/* Content preview */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 whitespace-pre-wrap">
          {note.content || 'No content'}
        </p>
      </button>

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium 
                bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="text-[11px] text-gray-400">
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>{formatDate(note.createdAt)}</span>
            {note.reminder && (
              <FiClock size={12} className="text-amber-500" />
            )}
            {note.attachments && note.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <FiPaperclip size={12} />
                <span>{note.attachments.length}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div
            className={`flex items-center gap-1 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {!isTrashed && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(note._id);
                  }}
                  className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                    note.isPinned
                      ? 'text-primary-500'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                  <FiMapPin size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(note._id);
                  }}
                  className={`p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
                    note.isFavorite
                      ? 'text-red-500'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={note.isFavorite ? 'Unfavorite' : 'Favorite'}
                >
                  <FiHeart size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(note._id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 transition-colors"
                  title={isArchived ? 'Unarchive' : 'Archive'}
                >
                  <FiArchive size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTrash(note._id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-red-500 transition-colors"
                  title="Trash"
                >
                  <FiTrash2 size={14} />
                </button>
              </>
            )}

            {isTrashed && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(note._id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-green-500 transition-colors"
                  title="Restore"
                >
                  <FiRotateCcw size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(note._id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete permanently"
                >
                  <FiTrash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2 text-primary-500 opacity-60">
          <FiPin size={14} />
        </div>
      )}

      {/* Favorite indicator */}
      {note.isFavorite && !isTrashed && (
        <div className="absolute top-2 left-2 text-red-400 opacity-60">
          <FiStar size={14} fill="currentColor" />
        </div>
      )}
    </div>
  );
}
