
import React from 'react';
import RichTextEditor from '@/components/rich-text-editor';
import { Note } from '@/types/notes';

interface EditorProps {
  note: Note;
  onChange: (content: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ note, onChange }) => {
  return (
    <div className="h-full w-full">
      <RichTextEditor
        content={note.content || ''}
        onChange={onChange}
      />
    </div>
  );
};
