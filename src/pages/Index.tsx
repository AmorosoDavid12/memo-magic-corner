
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
import NotesList from "@/components/notes/NotesList";
import { Note } from "@/types/notes";

const Index = () => {
  const { supabase } = useSupabase();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

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

  const handleAddNote = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const position = notes.length + 1;

    const newNote = {
      title: "Untitled",
      content: "",
      type: "doc",
      user_id: userData.user.id,
      position
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
