
import { useState } from "react";
import { ChevronRight, Folder as FolderIcon, Pencil, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Folder, Note } from "@/types/notes";
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FoldersListProps {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreate: (name: string) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onMoveNote: (noteId: string, folderId: string | null) => void;
}

const SortableNote = ({ note, onClick }: { note: Note; onClick: () => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="text-sm px-2 py-1 rounded-md hover:bg-accent cursor-pointer"
      onClick={onClick}
    >
      {note.title}
    </div>
  );
};

export const FoldersList = ({
  folders,
  notes,
  selectedFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderDelete,
  onFolderRename,
  onMoveNote
}: FoldersListProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleFolder = (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim());
      setNewFolderName("");
      setCreatingFolder(false);
    }
  };

  const handleRenameFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      onFolderRename(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  const handleDeleteFolder = () => {
    if (deletingFolderId) {
      onFolderDelete(deletingFolderId);
      setDeletingFolderId(null);
    }
  };

  const getFolderNotes = (folderId: string) => {
    return notes.filter(note => note.folder_id === folderId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-medium">Folders</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setCreatingFolder(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Folders list */}
      <div className="space-y-1">
        {folders.map((folder) => {
          const folderNotes = getFolderNotes(folder.id);
          const isExpanded = expandedFolders.has(folder.id);

          return (
            <div key={folder.id} className="relative">
              <div
                className={cn(
                  "flex items-center px-2 py-1 rounded-md hover:bg-accent group",
                  selectedFolderId === folder.id && "bg-accent"
                )}
              >
                <div className="flex-1 flex items-center" onClick={() => onFolderSelect(folder.id)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    onClick={(e) => toggleFolder(e, folder.id)}
                  >
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isExpanded && "transform rotate-90"
                      )}
                    />
                  </Button>
                  <FolderIcon className="h-4 w-4 mx-2" />
                  {editingFolderId === folder.id ? (
                    <Input
                      value={editingFolderName}
                      onChange={(e) => setEditingFolderName(e.target.value)}
                      onBlur={handleRenameFolder}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameFolder();
                        if (e.key === 'Escape') setEditingFolderId(null);
                      }}
                      className="h-6 py-1 px-1"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-sm">{folder.name}</span>
                  )}
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingFolderId(folder.id);
                      setEditingFolderName(folder.name);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingFolderId(folder.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Trigger note creation within this folder
                      // TODO: Implement note creation within folder
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {isExpanded && folderNotes.length > 0 && (
                <div className="pl-8 space-y-1 mt-1">
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                      const { active, over } = event;
                      if (over && active.id !== over.id) {
                        // Handle note reordering within folder
                        // TODO: Implement note reordering
                      }
                    }}
                  >
                    <SortableContext
                      items={folderNotes.map(note => note.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {folderNotes.map((note) => (
                        <SortableNote
                          key={note.id}
                          note={note}
                          onClick={() => {/* TODO: Handle note selection */}}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create folder dialog */}
      <AlertDialog open={creatingFolder} onOpenChange={setCreatingFolder}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create new folder</AlertDialogTitle>
            <AlertDialogDescription>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="mt-2"
                autoFocus
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCreatingFolder(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateFolder}>
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete folder confirmation dialog */}
      <AlertDialog
        open={deletingFolderId !== null}
        onOpenChange={() => setDeletingFolderId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete folder</AlertDialogTitle>
            <AlertDialogDescription>
              This folder contains notes. Are you sure you want to delete it? All notes inside will be deleted as well.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingFolderId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFolder} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
