
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
        parseHTML: element => element.getAttribute('data-color'),
        renderHTML: attributes => {
          if (!attributes.color) return {};
          return {
            'data-color': attributes.color,
            style: `color: ${attributes.color} !important`,
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
            parseHTML: element => element.getAttribute('data-color'),
            renderHTML: attributes => {
              if (!attributes.color) return {};
              return {
                'data-color': attributes.color,
                style: `color: ${attributes.color} !important`,
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
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: 'list-disc ml-4',
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
          HTMLAttributes: {
            class: 'list-decimal ml-4',
          },
        },
      }),
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

        /* Override any color inheritance from prose */
        .prose [style*="color:"] {
          color: var(--tw-prose-body);
        }

        /* Override Tailwind prose styles for colored text */
        .prose [data-color] {
          color: unset !important;
        }

        /* Ensure styles are properly applied in read-only mode */
        .ProseMirror[contenteditable="false"] [style*="color:"] {
          color: unset !important;
        }

        /* Preserve color in lists */
        .ProseMirror ul li [style*="color:"],
        .ProseMirror ol li [style*="color:"] {
          color: unset !important;
        }

        /* Preserve color in highlighted text */
        .ProseMirror mark [style*="color:"] {
          color: unset !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
