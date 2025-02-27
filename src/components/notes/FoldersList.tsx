
import { useState } from "react";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Folder } from "@/types/folders";
import { Note } from "@/types/notes";
import { 
  DndContext, 
  closestCenter, 
  DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor
} from "@dnd-kit/core";
import { 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

interface FoldersListProps {
  folders: Folder[];
  notes: Note[];
  selectedFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFolderCreate: (name: string) => void;
  onFolderDelete: (folderId: string) => void;
  onFolderRename: (folderId: string, newName: string) => void;
  onMoveNote: (noteId: string, folderId: string | null) => void;
  onCreateNote: (folderId: string | null) => void;
}

export const FoldersList = ({
  folders,
  notes,
  selectedFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderDelete,
  onFolderRename,
  onMoveNote,
  onCreateNote
}: FoldersListProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [deletingFolderId, setDeletingFolderId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onFolderCreate(newFolderName.trim());
      setNewFolderName("");
      setCreatingFolder(false);
    }
  };

  const handleStartEditing = (folder: Folder) => {
    setEditingFolderId(folder.id);
    setEditingFolderName(folder.name);
  };

  const handleRenameFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      onFolderRename(editingFolderId, editingFolderName.trim());
      setEditingFolderId(null);
      setEditingFolderName("");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const noteId = active.id.toString();
    const overId = over.id.toString();
    
    // Check if we're dropping on a folder or on "All Notes"
    const targetFolderId = overId === "all-notes" ? null : overId;
    
    // Move the note
    onMoveNote(noteId, targetFolderId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className={cn(
                "w-full flex items-center px-2 py-1 rounded-md hover:bg-accent",
                selectedFolderId === null && "bg-accent"
              )}
              onClick={() => onFolderSelect(null)}
              data-type="folder"
              data-id="all-notes"
            >
              <div className="flex items-center flex-1">
                <File className="h-4 w-4 mr-2" />
                <span>All Notes</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateNote(null);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="space-y-1">
            {folders.map((folder) => {
              const folderNotes = notes.filter(note => note.folder_id === folder.id);
              const isExpanded = expandedFolders.has(folder.id);

              return (
                <SidebarMenuItem key={folder.id}>
                  <SidebarMenuButton
                    className={cn(
                      "w-full flex items-center px-2 py-1 rounded-md hover:bg-accent group",
                      selectedFolderId === folder.id && "bg-accent"
                    )}
                    onClick={() => onFolderSelect(folder.id)}
                    data-type="folder"
                    data-id={folder.id}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0 mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFolder(folder.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>

                    {editingFolderId === folder.id ? (
                      <Input
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onBlur={handleRenameFolder}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameFolder();
                          }
                        }}
                        className="h-6 py-0 px-1 flex-1"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <>
                        <span className="flex-1">{folder.name}</span>
                        <div className="flex opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateNote(folder.id);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditing(folder);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingFolderId(folder.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </SidebarMenuButton>

                  {isExpanded && folderNotes.length > 0 && (
                    <div className="pl-8 space-y-1 mt-1">
                      {folderNotes.map((note) => (
                        <div
                          key={note.id}
                          className="text-sm px-2 py-1 rounded-md hover:bg-accent cursor-pointer"
                        >
                          {note.title}
                        </div>
                      ))}
                    </div>
                  )}
                </SidebarMenuItem>
              );
            })}
          </div>
        </SidebarMenu>

        {/* Create Folder Dialog */}
        <AlertDialog open={creatingFolder} onOpenChange={setCreatingFolder}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Folder</AlertDialogTitle>
              <AlertDialogDescription>
                Enter a name for your new folder.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="my-4"
              autoFocus
            />
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setNewFolderName("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateFolder}>
                Create
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Folder Dialog */}
        <AlertDialog
          open={!!deletingFolderId}
          onOpenChange={(open) => !open && setDeletingFolderId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Folder</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this folder? All notes in this folder will be moved to "All Notes".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (deletingFolderId) {
                    onFolderDelete(deletingFolderId);
                    setDeletingFolderId(null);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DndContext>
  );
};
