import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSupabase } from "@/lib/supabase/supabase-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
import { FoldersList } from "@/components/notes/FoldersList";
import NotesList from "@/components/notes/NotesList";
import { Note, Folder } from "@/types/notes";

const Index = () => {
  const { supabase } = useSupabase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotes();
    fetchFolders();
  }, []);

  const fetchNotes = async () => {
    const { data, error } = await supabase.from("notes").select("*");
    if (error) {
      toast.error("Error fetching notes: " + error.message);
      return;
    }
    setNotes(data);
  };

  const fetchFolders = async () => {
    const { data, error } = await supabase.from("folders").select("*");
    if (error) {
      toast.error("Error fetching folders: " + error.message);
      return;
    }
    setFolders(data);
  };

  const handleAddNote = async () => {
    const newNote = {
      title: "Untitled",
      content: "",
      type: "doc",
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

  const handleAddNoteToFolder = async (folderId: string) => {
    const newNote = {
      title: "Untitled",
      content: "",
      type: "doc",
      folder_id: folderId,
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

  const handleAddFolder = async (name: string) => {
    const { data, error } = await supabase
      .from("folders")
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      toast.error("Error creating folder: " + error.message);
      return;
    }

    setFolders((prev) => [...prev, data]);
  };

  const handleDeleteFolder = async (folderId: string) => {
    const { error } = await supabase.from("folders").delete().eq("id", folderId);

    if (error) {
      toast.error("Error deleting folder: " + error.message);
      return;
    }

    setFolders((prev) => prev.filter((folder) => folder.id !== folderId));
    if (selectedFolderId === folderId) {
      setSelectedFolderId(null);
    }
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

  const handleMoveNoteToFolder = async (noteId: string, folderId: string | null) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ folder_id: folderId })
        .eq('id', noteId);

      if (error) throw error;

      setNotes(prevNotes => prevNotes.map(note => 
        note.id === noteId ? { ...note, folder_id: folderId } : note
      ));

      toast.success('Note moved successfully');
    } catch (error: any) {
      toast.error('Error moving note: ' + error.message);
    }
  };

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <FoldersList
                  folders={folders}
                  notes={notes}
                  selectedFolderId={selectedFolderId}
                  onFolderSelect={setSelectedFolderId}
                  onFolderCreate={handleAddFolder}
                  onFolderDelete={handleDeleteFolder}
                  onFolderRename={handleRenameFolder}
                  onMoveNote={handleMoveNoteToFolder}
                  onCreateNote={handleAddNoteToFolder}
                />
              </SidebarGroup>
              <Separator />
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
                      onClick={handleAddNote}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <NotesList
                    notes={filteredNotes}
                    editingNoteId={editingNoteId}
                    onNoteSelect={handleNoteSelect}
                    onEditTitle={handleEditNoteTitle}
                    onDeleteNote={handleDeleteNote}
                    onStartEditing={handleStartEditing}
                    onStopEditing={handleStopEditing}
                    onReorder={handleReorderNotes}
                    onMoveNoteToFolder={handleMoveNoteToFolder}
                  />
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
