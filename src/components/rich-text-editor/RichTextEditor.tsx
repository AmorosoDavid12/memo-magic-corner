
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { Extension } from '@tiptap/core';
import FontSize from './extensions/FontSize';
import ResizableImage from './extensions/ResizableImage';
import EditorToolbar from './EditorToolbar';

// Custom color extension
const ColorExtension = Extension.create({
  name: 'textColor',
  
  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: element => element.dataset.color,
        renderHTML: attributes => {
          if (!attributes.color) return {};
          return {
            'data-color': attributes.color,
            class: `text-color-${attributes.color.replace('#', '')}`,
          };
        },
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          color: {
            default: null,
            parseHTML: element => element.dataset.color,
            renderHTML: attributes => {
              if (!attributes.color) return {};
              return {
                'data-color': attributes.color,
                class: `text-color-${attributes.color.replace('#', '')}`,
              };
            },
          },
        },
      },
    ];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

const RichTextEditor = ({ content, onChange, readOnly = false }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      ColorExtension,
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
    content: content || '<p></p>',
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

        [data-color="#FF0000"] { color: #FF0000 !important; }
        [data-color="#0000FF"] { color: #0000FF !important; }
        [data-color="#00FF00"] { color: #00FF00 !important; }
        [data-color="#000000"] { color: #000000 !important; }
        [data-color="#6B7280"] { color: #6B7280 !important; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
