
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { Editor } from "@/components/editor";
import NotesList from "@/components/notes/NotesList";
import { Note } from "@/types/notes";
import { Folder } from "@/types/folders";
import { FoldersList } from "@/components/notes/FoldersList";

const Index = () => {
  const { supabase } = useSupabase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchNotes(), fetchFolders()]);
  };

  const fetchNotes = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      toast.error("Error getting user: " + userError.message);
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq('user_id', userData.user.id);
    if (error) {
      toast.error("Error fetching notes: " + error.message);
      return;
    }
    setNotes(data);
  };

  const fetchFolders = async () => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      toast.error("Error getting user: " + userError.message);
      return;
    }

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq('user_id', userData.user.id)
      .order('position', { ascending: true });
    if (error) {
      toast.error("Error fetching folders: " + error.message);
      return;
    }
    setFolders(data || []);
  };

  const handleAddNote = async (folderId: string | null = selectedFolderId) => {
    const { data: userData } = await supabase.auth.getUser();
    const position = notes.length + 1;

    const newNote = {
      title: "Untitled",
      content: "",
      type: "doc",
      user_id: userData.user.id,
      position,
      folder_id: folderId
    };

    const { data, error } = await supabase
      .from("notes")
      .insert([newNote])
      .select()
      .single();

    if (error) {
      toast.error("Error creating note: " + error.message);
      return;
    }

    setNotes((prev) => [...prev, data]);
    setSelectedNote(data);
    setEditingNoteId(data.id);
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setEditingNoteId(null);
  };

  const handleEditNoteTitle = async (noteId: string, newTitle: string) => {
    const { error } = await supabase
      .from("notes")
      .update({ title: newTitle })
      .eq("id", noteId);

    if (error) {
      toast.error("Error updating note title: " + error.message);
      return;
    }

    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, title: newTitle } : note
      )
    );

    if (selectedNote?.id === noteId) {
      setSelectedNote((prev) =>
        prev ? { ...prev, title: newTitle } : null
      );
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      toast.error("Error deleting note: " + error.message);
      return;
    }

    setNotes((prev) => prev.filter((note) => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  const handleStartEditing = (noteId: string) => {
    setEditingNoteId(noteId);
  };

  const handleStopEditing = () => {
    setEditingNoteId(null);
  };

  const handleReorderNotes = async (reorderedNotes: Note[]) => {
    setNotes(reorderedNotes);
  };

  const handleCreateFolder = async (name: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const position = folders.length + 1;

    const { data, error } = await supabase
      .from("folders")
      .insert([{
        name,
        user_id: userData.user.id,
        position
      }])
      .select()
      .single();

    if (error) {
      toast.error("Error creating folder: " + error.message);
      return;
    }

    setFolders((prev) => [...prev, data]);
  };

  const handleDeleteFolder = async (folderId: string) => {
    // First, update all notes in this folder to have no folder
    const { error: updateError } = await supabase
      .from("notes")
      .update({ folder_id: null })
      .eq("folder_id", folderId);

    if (updateError) {
      toast.error("Error updating notes: " + updateError.message);
      return;
    }

    // Then delete the folder
    const { error } = await supabase
      .from("folders")
      .delete()
      .eq("id", folderId);

    if (error) {
      toast.error("Error deleting folder: " + error.message);
      return;
    }

    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }

    // Update notes state to reflect the changes
    setNotes((prev) =>
      prev.map((note) =>
        note.folder_id === folderId ? { ...note, folder_id: null } : note
      )
    );
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    const { error } = await supabase
      .from("folders")
      .update({ name: newName })
      .eq("id", folderId);

    if (error) {
      toast.error("Error renaming folder: " + error.message);
      return;
    }

    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === folderId ? { ...folder, name: newName } : folder
      )
    );
  };

  const handleMoveNote = async (noteId: string, folderId: string | null) => {
    const { error } = await supabase
      .from("notes")
      .update({ folder_id: folderId })
      .eq("id", noteId);

    if (error) {
      toast.error("Error moving note: " + error.message);
      return;
    }

    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, folder_id: folderId } : note
      )
    );

    if (selectedNote?.id === noteId) {
      setSelectedNote((prev) =>
        prev ? { ...prev, folder_id: folderId } : null
      );
    }

    toast.success("Note moved successfully");
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
  };

  const filteredNotes = notes.filter((note) => {
    // First filter by search query
    if (!note.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Then filter by selected folder
    if (selectedFolderId === null) {
      return true; // Show all notes when no folder is selected
    }
    
    return note.folder_id === selectedFolderId;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <div className="h-full flex flex-col">
            <SidebarHeader>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">Notes</h2>
              </div>
            </SidebarHeader>
            <SidebarContent className="flex-1">
              <SidebarGroup>
                <SidebarGroupContent>
                  <div className="flex items-center px-2">
                    <Input
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2"
                      onClick={() => handleAddNote()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <FoldersList
                    folders={folders}
                    notes={notes}
                    selectedFolderId={selectedFolderId}
                    onFolderSelect={handleFolderSelect}
                    onFolderCreate={handleCreateFolder}
                    onFolderDelete={handleDeleteFolder}
                    onFolderRename={handleRenameFolder}
                    onMoveNote={handleMoveNote}
                    onCreateNote={handleAddNote}
                  />
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium px-2 mb-2">
                      {selectedFolderId 
                        ? `Notes in ${folders.find(f => f.id === selectedFolderId)?.name || 'Folder'}` 
                        : 'All Notes'}
                    </h3>
                    <NotesList
                      notes={filteredNotes}
                      editingNoteId={editingNoteId}
                      onNoteSelect={handleNoteSelect}
                      onEditTitle={handleEditNoteTitle}
                      onDeleteNote={handleDeleteNote}
                      onStartEditing={handleStartEditing}
                      onStopEditing={handleStopEditing}
                      onReorder={handleReorderNotes}
                      onMoveNoteToFolder={handleMoveNote}
                    />
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </div>
        </Sidebar>
        <main className="flex-1 overflow-hidden">
          {selectedNote && (
            <Editor
              note={selectedNote}
              onChange={async (content) => {
                const { error } = await supabase
                  .from("notes")
                  .update({ content })
                  .eq("id", selectedNote.id);

                if (error) {
                  toast.error("Error saving note: " + error.message);
                }
              }}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
