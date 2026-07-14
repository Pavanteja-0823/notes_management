import { useState } from 'react';
import {
  FiHome,
  FiHeart,
  FiArchive,
  FiTrash2,
  FiFolder,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiBarChart2,
  FiFileText,
  FiStar,
  FiHardDrive,
  FiZap,
} from 'react-icons/fi';
import CategoryModal from './CategoryModal';
import { usePremium } from '../context/PremiumContext';
import { PremiumBadge } from './PremiumGuard';

const navItems = [
  { icon: FiHome, label: 'All Notes', filter: {} },
  { icon: FiHeart, label: 'Favorites', filter: { isFavorite: true } },
  { icon: FiArchive, label: 'Archive', filter: { isArchived: true } },
  { icon: FiTrash2, label: 'Trash', filter: { isTrashed: true } },
];

export default function Sidebar({
  activeFilter,
  onFilterChange,
  categories,
  onCategorySelect,
  selectedCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  isCollapsed,
  onToggleCollapse,
  stats,
}) {
  const { isPremium, openUpgradeModal } = usePremium();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleOpenEdit = (cat, e) => {
    e.stopPropagation();
    setEditingCategory(cat);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async (data) => {
    if (editingCategory) {
      await onUpdateCategory(editingCategory._id, data);
    } else {
      await onCreateCategory(data);
    }
  };

  const handleDeleteCategory = async (id) => {
    await onDeleteCategory(id);
  };

  return (
    <>
      <aside
        className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
          transition-all duration-300 flex flex-col ${
            isCollapsed ? 'w-16' : 'w-64'
          }`}
      >
        {/* Header with Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center shadow-sm shrink-0">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 leading-tight truncate">
                  Smart Notes
                </h2>
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                  Workspace
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors shrink-0"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              JSON.stringify(activeFilter) === JSON.stringify(item.filter);

            return (
              <button
                key={item.label}
                onClick={() => onFilterChange(item.filter)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                  }`}
                title={item.label}
              >
                <Icon size={20} className="shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {/* AI Menu Item - opens UpgradeModal (same as PRO/lock badge) */}
          <button
            onClick={openUpgradeModal}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-200 text-gray-600 hover:bg-gray-100 
              dark:text-gray-400 dark:hover:bg-gray-700/50 group`}
            title="Premium Features"
          >
            <div className="relative shrink-0">
              <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <FiZap size={12} className="text-white" />
              </div>
              {isPremium && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
              )}
            </div>
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">AI Workspace</span>
                <PremiumBadge isPremium={isPremium} size="sm" />
              </>
            )}
          </button>

          {/* Divider */}
          {!isCollapsed && (
            <div className="pt-3 pb-2">
              <div className="border-t border-gray-200 dark:border-gray-700" />
            </div>
          )}

          {/* Categories Section */}
          {!isCollapsed && (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Categories
                </span>
                <button
                  onClick={handleOpenCreate}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  title="Create category"
                >
                  <FiPlus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Category List */}
          {categories.map((category) => {
            const isSelected = selectedCategory === category._id;
            return (
              <button
                key={category._id}
                onClick={() => onCategorySelect(category._id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200 group ${
                    isSelected
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50'
                  }`}
                title={category.name}
              >
                <FiFolder
                  size={18}
                  className="shrink-0"
                  style={{ color: category.color }}
                />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{category.name}</span>
                    <span className="text-xs text-gray-400">{category.noteCount || 0}</span>
                    {/* Edit button - visible on hover */}
                    <button
                      onClick={(e) => handleOpenEdit(category, e)}
                      className="p-0.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all"
                      title="Edit category"
                    >
                      <FiEdit2 size={12} />
                    </button>
                  </>
                )}
              </button>
            );
          })}

          {/* Collapsed category indicator */}
          {isCollapsed && categories.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleOpenCreate}
                className="w-full p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors"
                title="Add category"
              >
                <FiPlus size={18} className="mx-auto" />
              </button>
            </div>
          )}

          {/* If no categories and expanded */}
          {!isCollapsed && categories.length === 0 && (
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                No categories yet
              </p>
              <button
                onClick={handleOpenCreate}
                className="mt-1 text-xs text-primary-500 hover:text-primary-600 transition-colors"
              >
                Create one
              </button>
            </div>
          )}
        </nav>

        {/* Dashboard Statistics */}
        {!isCollapsed && stats && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <div className="flex items-center gap-2 mb-2 px-1">
              <FiBarChart2 size={14} className="text-gray-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Statistics
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatItem icon={FiFileText} label="Total" value={stats.total} />
              <StatItem icon={FiStar} label="Favorites" value={stats.favorites} />
              <StatItem icon={FiArchive} label="Archived" value={stats.archived} />
              <StatItem icon={FiTrash2} label="Trash" value={stats.trashed} />
            </div>
            {stats.categories !== undefined && (
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                <StatItem icon={FiFolder} label="Categories" value={stats.categories} full />
              </div>
            )}
            {stats.storageUsed && (
              <div className="mt-1">
                <StatItem icon={FiHardDrive} label="Storage" value={stats.storageUsed} full />
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleSaveCategory}
        onDelete={handleDeleteCategory}
        category={editingCategory}
      />
    </>
  );
}

function StatItem({ icon: Icon, label, value, full = false }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/30 ${full ? 'col-span-2' : ''}`}>
      <Icon size={12} className="text-gray-400 shrink-0" />
      <span className="text-xs text-gray-500 dark:text-gray-400 flex-1">{label}</span>
      <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}
