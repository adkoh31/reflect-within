import React, { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
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
  Image as ImageIcon,
  Palette,
  Highlighter,
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
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const linkInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-cyan-400 hover:text-cyan-300 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
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
      editor.commands.focus();
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

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const setImage = () => {
    setShowImageInput(true);
  };

  const setColor = (color) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };

  const setHighlight = (color) => {
    editor.chain().focus().setHighlight({ color }).run();
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    icon: Icon, 
    title, 
    disabled = false 
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
              isActive={editor.isActive('bold')}
              icon={Bold}
              title="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              icon={Italic}
              title="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              icon={UnderlineIcon}
              title="Underline"
            />
          </div>

          <ToolbarDivider />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              icon={List}
              title="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              icon={ListOrdered}
              title="Numbered List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              icon={Quote}
              title="Quote"
            />
          </div>

          <ToolbarDivider />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              icon={AlignLeft}
              title="Align Left"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              icon={AlignCenter}
              title="Align Center"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              icon={AlignRight}
              title="Align Right"
            />
          </div>

          <ToolbarDivider />

          {/* Links and Images */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={setLink}
              isActive={editor.isActive('link')}
              icon={LinkIcon}
              title="Add Link"
            />
            <ToolbarButton
              onClick={setImage}
              icon={ImageIcon}
              title="Add Image"
            />
          </div>

          <ToolbarDivider />

          {/* Colors */}
          <div className="flex items-center gap-1 relative">
            <ToolbarButton
              onClick={() => setShowColorPicker(!showColorPicker)}
              icon={Palette}
              title="Text Color"
            />
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-10">
                <div className="grid grid-cols-6 gap-1">
                  {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080', '#008000', '#ffc0cb'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setColor(color)}
                      className="w-6 h-6 rounded border border-slate-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            <ToolbarButton
              onClick={() => setHighlight('#fef3c7')}
              icon={Highlighter}
              title="Highlight"
            />
          </div>

          <ToolbarDivider />

          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              icon={Undo}
              title="Undo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLinkInput(false)} />
          <div className="relative bg-slate-900/95 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Add Link</h3>
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={addLink}
                className="px-4 py-2 bg-cyan-500 text-slate-900 rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Add Link
              </button>
              <button
                onClick={() => setShowLinkInput(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Input Modal */}
      {showImageInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowImageInput(false)} />
          <div className="relative bg-slate-900/95 backdrop-blur-md rounded-xl p-6 border border-slate-700/50 shadow-2xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Add Image</h3>
            <input
              ref={imageInputRef}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              onKeyPress={(e) => e.key === 'Enter' && addImage()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={addImage}
                className="px-4 py-2 bg-cyan-500 text-slate-900 rounded-lg hover:bg-cyan-400 transition-colors"
              >
                Add Image
              </button>
              <button
                onClick={() => setShowImageInput(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
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