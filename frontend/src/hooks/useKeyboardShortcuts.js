import { useEffect } from 'react';

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Map of key combos to handlers
 * @param {boolean} enabled - Whether shortcuts are active
 *
 * Example:
 * useKeyboardShortcuts({
 *   'ctrl+n': () => handleNewNote(),
 *   'ctrl+s': (e) => { e.preventDefault(); handleSave(); },
 * });
 */
export default function useKeyboardShortcuts(shortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      const key = [
        e.ctrlKey || e.metaKey ? 'ctrl' : null,
        e.shiftKey ? 'shift' : null,
        e.altKey ? 'alt' : null,
        e.key.toLowerCase(),
      ]
        .filter(Boolean)
        .join('+');

      const action = shortcuts[key];
      if (action) {
        action(e);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}
