import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import { Button } from './ui/button';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Underline as UnderlineIcon,
  Highlighter,
  Strikethrough,
  Image as ImageIcon,
  Type,
  Palette
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FontSize = Extension.create({
  name: 'fontSize',
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) return {}
          return {
            style: `font-size: ${attributes.fontSize}`
          }
        }
      }
    }
  }
});

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}`,
        }),
      },
    }
  },
});

const fontSizes = [
  { label: '10', value: '10px' },
  { label: '12', value: '12px' },
  { label: '14', value: '14px' },
  { label: '16', value: '16px' },
  { label: '18', value: '18px' },
  { label: '20', value: '20px' },
  { label: '24', value: '24px' },
  { label: '30', value: '30px' },
];

const colors = [
  { label: 'Black', value: '#000000' },
  { label: 'Gray', value: '#666666' },
  { label: 'Red', value: '#ff0000' },
  { label: 'Blue', value: '#0000ff' },
  { label: 'Green', value: '#00ff00' },
];

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
      }),
      TextStyle,
      FontSize,
      Color,
      Underline,
      Highlight,
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
        class: 'prose prose-sm max-w-none',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (typeof e.target?.result === 'string') {
                editor?.chain().focus().setImage({ src: e.target.result }).run();
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        const image = items.find(item => item.type.startsWith('image/'));
        
        if (image) {
          event.preventDefault();
          const file = image.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (typeof e.target?.result === 'string') {
                editor?.chain().focus().setImage({ src: e.target.result }).run();
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark('fontSize', { fontSize: size }).run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

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
            editor.chain().focus().setImage({ src: e.target.result }).run();
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="rounded-lg overflow-hidden bg-background">
      {!readOnly && (
        <div className="p-2 border-b bg-muted/50 flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-muted' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-muted' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-muted' : ''}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive('strike') ? 'bg-muted' : ''}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={editor.isActive('highlight') ? 'bg-muted' : ''}
          >
            <Highlighter className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={editor.isActive('fontSize') ? 'bg-muted' : ''}
              >
                <Type className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-1">
                {fontSizes.map((size) => (
                  <Button
                    key={size.value}
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal"
                    onClick={() => setFontSize(size.value)}
                  >
                    {size.label}px
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={editor.isActive('textStyle') ? 'bg-muted' : ''}
              >
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2">
              <div className="flex flex-col gap-1">
                {colors.map((color) => (
                  <Button
                    key={color.value}
                    variant="ghost"
                    size="sm"
                    className="justify-start font-normal"
                    style={{ color: color.value }}
                    onClick={() => setColor(color.value)}
                  >
                    <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color.value }} />
                    {color.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-muted' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-muted' : ''}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      <EditorContent 
        editor={editor} 
        className="p-4 min-h-[200px] focus:outline-none prose-img:max-w-full prose-img:resize prose-img:cursor-col-resize"
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
      `}</style>
    </div>
  );
};

export default RichTextEditor;
