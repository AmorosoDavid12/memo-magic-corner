
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import FontSize from './extensions/FontSize';
import ResizableImage from './extensions/ResizableImage';
import EditorToolbar from './EditorToolbar';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const RichTextEditor = ({ content, onChange, readOnly = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-disc ml-4',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: 'list-decimal ml-4',
          },
        },
        strike: {
          HTMLAttributes: {
            class: 'line-through',
          },
        },
      }),
      TextStyle.configure({
        HTMLAttributes: {
          class: 'styled-text',
        },
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      FontSize,
      Underline,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'relative',
        },
      }),
      ResizableImage.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg hover:shadow-lg transition-shadow',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            editor?.chain().focus().setImage({ src: e.target.result }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-lg overflow-hidden bg-background">
      {!readOnly && <EditorToolbar editor={editor} onImageAdd={addImage} />}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[200px] prose-img:max-w-full prose-img:resize prose-img:cursor-col-resize"
      />
      <style>{`
        .ProseMirror {
          > * + * {
            margin-top: 0.75em;
          }
        }
        
        [style*="font-size:"] {
          display: inline-block;
        }
        
        img {
          resize: both;
          overflow: auto;
          max-width: 100%;
          height: auto;
        }

        img::after {
          content: '';
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 8px;
          height: 8px;
          cursor: nwse-resize;
        }

        .prose * {
          color: currentColor;
        }

        .styled-text[style] {
          color: var(--tw-prose-body);
        }

        .styled-text[style*="color:"] {
          color: unset !important;
        }

        .ProseMirror .styled-text[style*="color:"] {
          display: inline;
          color: var(--color, currentColor) !important;
        }

        .ProseMirror [data-type="textStyle"] {
          color: currentColor;
        }

        .ProseMirror [data-type="textStyle"][style*="color:"] {
          color: unset !important;
        }

        mark {
          color: inherit !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
