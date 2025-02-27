
import { FileText, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  position: number;
}

interface NotesListProps {
  notes: Note[];
  editingNoteId: string | null;
  onNoteSelect: (note: Note) => void;
  onEditTitle: (noteId: string, newTitle: string) => void;
  onDeleteNote: (noteId: string, event: React.MouseEvent) => void;
  onStartEditing: (noteId: string) => void;
  onStopEditing: () => void;
  onReorder: (notes: Note[]) => void;
}

interface SortableNoteItemProps {
  note: Note;
  isEditing: boolean;
  isSelected: boolean;
  onSelect: (noteId: string, event: React.MouseEvent) => void;
  onEdit: (noteId: string, newTitle: string) => void;
  onDelete: (noteId: string, event: React.MouseEvent) => void;
  onStartEdit: (noteId: string) => void;
  onStopEdit: () => void;
  onClick: () => void;
}

const SortableNoteItem = ({
  note,
  isEditing,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onStartEdit,
  onStopEdit,
  onClick,
}: SortableNoteItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <SidebarMenuItem ref={setNodeRef} style={style}>
      <SidebarMenuButton
        onClick={onClick}
        className={cn(
          "w-full flex justify-between items-center group",
          isSelected && "bg-accent",
          isDragging && "opacity-50"
        )}
      >
        <div className="flex items-center flex-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-6 w-6 mr-2", isSelected && "bg-primary text-primary-foreground")}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(note.id, e);
            }}
          >
            <FileText className="w-4 h-4" />
          </Button>
          {isEditing ? (
            <Input
              type="text"
              value={note.title}
              onChange={(e) => onEdit(note.id, e.target.value)}
              className="h-6 py-0 px-1"
              onBlur={onStopEdit}
              autoFocus
            />
          ) : (
            <span className="truncate">{note.title}</span>
          )}
        </div>
        <div className="flex opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(note.id);
            }}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={(e) => onDelete(note.id, e)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NotesList = ({
  notes,
  editingNoteId,
  onNoteSelect,
  onEditTitle,
  onDeleteNote,
  onStartEditing,
  onStopEditing,
  onReorder,
}: NotesListProps) => {
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((note) => note.id === active.id);
      const newIndex = notes.findIndex((note) => note.id === over.id);
      const newNotes = arrayMove(notes, oldIndex, newIndex);
      onReorder(newNotes);
    }
  };

  const handleNoteSelect = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      const newSelected = new Set(selectedNotes);
      if (newSelected.has(noteId)) {
        newSelected.delete(noteId);
      } else {
        newSelected.add(noteId);
      }
      setSelectedNotes(newSelected);
    } else if (event.shiftKey && selectedNotes.size > 0) {
      const lastSelectedId = Array.from(selectedNotes).pop() as string;
      const lastSelectedIndex = notes.findIndex(note => note.id === lastSelectedId);
      const currentIndex = notes.findIndex(note => note.id === noteId);
      
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      
      const selectedIds = notes
        .slice(start, end + 1)
        .map(note => note.id);
      
      setSelectedNotes(new Set(selectedIds));
    } else {
      setSelectedNotes(new Set([noteId]));
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[
        // Restrict horizontal movement
        {
          name: 'restrictToParentElement',
          options: {},
          fn: ({ transform }) => {
            return {
              ...transform,
              x: 0 // Lock x-axis movement
            };
          }
        }
      ]}
    >
      <SortableContext
        items={notes.map((note) => note.id)}
        strategy={verticalListSortingStrategy}
      >
        <SidebarMenu className="overflow-hidden">
          {notes.length > 0 ? (
            notes.map((note) => (
              <SortableNoteItem
                key={note.id}
                note={note}
                isEditing={editingNoteId === note.id}
                isSelected={selectedNotes.has(note.id)}
                onSelect={handleNoteSelect}
                onEdit={onEditTitle}
                onDelete={onDeleteNote}
                onStartEdit={onStartEditing}
                onStopEdit={onStopEditing}
                onClick={() => onNoteSelect(note)}
              />
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No notes found.
            </div>
          )}
        </SidebarMenu>
      </SortableContext>
    </DndContext>
  );
};

export default NotesList;
