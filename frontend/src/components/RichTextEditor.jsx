import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiCode,
  FiLink,
  FiLink2,
  FiType,
  FiChevronDown,
} from 'react-icons/fi';
import { BiListOl } from 'react-icons/bi';
import { RiDoubleQuotesL } from 'react-icons/ri';

const MenuButton = ({ onClick, active, children, title, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg transition-all duration-150 text-sm
      ${active
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400'
      }
      disabled:opacity-30 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-5 bg-gray-200 dark:bg-gray-600 mx-0.5" />
);

export default function RichTextEditor({ content, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary-600 dark:text-primary-400 underline underline-offset-2' },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start writing...',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[180px] px-4 py-3',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
        {/* Text style */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <FiBold size={15} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <FiItalic size={15} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <FiUnderline size={15} />
        </MenuButton>

        <Divider />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <span className="font-bold text-xs">H1</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <span className="font-bold text-xs">H2</span>
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <span className="font-bold text-xs">H3</span>
        </MenuButton>

        <Divider />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <FiList size={15} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <BiListOl size={15} />
        </MenuButton>

        <Divider />

        {/* Block elements */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <RiDoubleQuotesL size={15} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code block"
        >
          <FiCode size={15} />
        </MenuButton>

        <Divider />

        {/* Link */}
        <MenuButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Insert link"
        >
          <FiLink size={15} />
        </MenuButton>
        {editor.isActive('link') && (
          <button
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Remove link"
          >
            <FiLink2 size={15} />
          </button>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}
