import { Editor } from '@tiptap/react';
import { Button } from '../ui/button';
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
import { colors, fontSizes } from './constants';

interface EditorToolbarProps {
  editor: Editor | null;
  onImageAdd: () => void;
}

const EditorToolbar = ({ editor, onImageAdd }: EditorToolbarProps) => {
  if (!editor) {
    return null;
  }

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark('fontSize', { size }).run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  return (
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
        onClick={onImageAdd}
      >
        <ImageIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default EditorToolbar;
