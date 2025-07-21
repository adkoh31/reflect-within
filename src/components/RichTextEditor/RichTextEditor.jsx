import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Quote, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react';

const RichTextEditor = ({ 
  content = '', 
  onChange, 
  placeholder = 'Start writing your thoughts...',
  readOnly = false,
  className = '',
  autoFocus = false
}) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable unused features to reduce bundle size
        heading: {
          levels: [1, 2, 3] // Only allow h1, h2, h3
        },
        codeBlock: false, // Disable code blocks
        horizontalRule: false, // Disable horizontal rules
        strike: false, // Disable strikethrough
        code: false, // Disable inline code
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-cyan-400 hover:text-cyan-300 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (autoFocus && editor) {
      // Add a small delay to ensure the editor view is fully mounted
      const timer = setTimeout(() => {
        if (editor.isDestroyed) return;
        try {
          editor.commands.focus();
        } catch (error) {
          console.warn('Editor focus failed:', error);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [editor, autoFocus]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon, 
    title, 
    disabled = false 
  }) => (
    <button
      onClick={() => {
        if (editor && !editor.isDestroyed) {
          try {
            onClick();
          } catch (error) {
            console.warn('Editor command failed:', error);
          }
        }
      }}
      disabled={disabled || !editor || editor.isDestroyed}
      title={title}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
      } ${disabled || !editor || editor.isDestroyed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  const ToolbarDivider = () => (
    <div className="w-px h-6 bg-slate-600/50 mx-1" />
  );

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-3 bg-slate-800/50 border border-slate-700/50 rounded-t-xl">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive('bold') : false}
              icon={Bold}
              title="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive('italic') : false}
              icon={Italic}
              title="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive('underline') : false}
              icon={UnderlineIcon}
              title="Underline"
            />
          </div>

          <ToolbarDivider />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive('bulletList') : false}
              icon={List}
              title="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive('orderedList') : false}
              icon={ListOrdered}
              title="Numbered List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive('blockquote') : false}
              icon={Quote}
              title="Quote"
            />
          </div>

          <ToolbarDivider />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive({ textAlign: 'left' }) : false}
              icon={AlignLeft}
              title="Align Left"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive({ textAlign: 'center' }) : false}
              icon={AlignCenter}
              title="Align Center"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor && !editor.isDestroyed ? editor.isActive({ textAlign: 'right' }) : false}
              icon={AlignRight}
              title="Align Right"
            />
          </div>

          <ToolbarDivider />

          {/* Links */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={setLink}
              isActive={editor && !editor.isDestroyed ? editor.isActive('link') : false}
              icon={LinkIcon}
              title="Add Link"
            />
          </div>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor || editor.isDestroyed || !editor.can().undo()}
              icon={Undo}
              title="Undo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor || editor.isDestroyed || !editor.can().redo()}
              icon={Redo}
              title="Redo"
            />
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className={`border border-slate-700/50 rounded-b-xl overflow-hidden ${
        readOnly ? 'rounded-xl' : ''
      }`}>
        <EditorContent 
          editor={editor} 
          className="prose prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
        />
      </div>

      {/* Link Input Modal */}
      {showLinkInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add Link</h3>
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={addLink}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Add Link
              </button>
              <button
                onClick={() => setShowLinkInput(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor; 