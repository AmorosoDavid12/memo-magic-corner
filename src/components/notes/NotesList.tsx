
import { FileText, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

interface Note {
  id: string;
  title: string;
  created: string;
  lastEdited: string;
  type: string;
  participants: string;
  date: string;
  content: string;
}

interface NotesListProps {
  notes: Note[];
  editingNoteId: string | null;
  onNoteSelect: (note: Note) => void;
  onEditTitle: (noteId: string, newTitle: string) => void;
  onDeleteNote: (noteId: string, event: React.MouseEvent) => void;
  onStartEditing: (noteId: string) => void;
  onStopEditing: () => void;
}

const NotesList = ({
  notes,
  editingNoteId,
  onNoteSelect,
  onEditTitle,
  onDeleteNote,
  onStartEditing,
  onStopEditing,
}: NotesListProps) => {
  return (
    <SidebarMenu>
      {notes.map((note) => (
        <SidebarMenuItem key={note.id}>
          <SidebarMenuButton 
            onClick={() => onNoteSelect(note)}
            className="w-full flex justify-between items-center group"
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              {editingNoteId === note.id ? (
                <Input
                  type="text"
                  value={note.title}
                  onChange={(e) => onEditTitle(note.id, e.target.value)}
                  className="h-6 py-0 px-1"
                  onBlur={onStopEditing}
                  autoFocus
                />
              ) : (
                <span>{note.title}</span>
              )}
            </div>
            <div className="flex opacity-0 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartEditing(note.id);
                }}
              >
                <Pencil className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive"
                onClick={(e) => onDeleteNote(note.id, e)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default NotesList;
