import { useState, useEffect } from "react";
import { Search, Plus, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider
} from "@/components/ui/sidebar";
import RichTextEditor from "@/components/rich-text-editor";
import NotesList from "@/components/notes/NotesList";
import NoteHeader from "@/components/notes/NoteHeader";
import NoteMetadata from "@/components/notes/NoteMetadata";

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setNotes(data || []);
      if (data && data.length > 0 && !selectedNote) {
        setSelectedNote(data[0]);
      } else if (data && data.length === 0) {
        setSelectedNote(null);
      }
    } catch (error: any) {
      toast.error('Error loading notes: ' + error.message);
    }
  };

  const handleAddNote = async () => {
    try {
      const newNote = {
        title: "New Note",
        content: "<p></p>", // Initialize with a proper HTML structure
        type: "Note",
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;

      setNotes(prevNotes => [data, ...prevNotes]);
      setSelectedNote(data);
      setEditingNoteId(data.id);
      toast.success('Note created successfully');
    } catch (error: any) {
      toast.error('Error creating note: ' + error.message);
    }
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setEditingNoteId(null);
    setEditingType(false);
  };

  const handleEditTitle = async (noteId: string, newTitle: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ title: newTitle })
        .eq('id', noteId);

      if (error) throw error;

      const updatedNotes = notes.map(note => 
        note.id === noteId 
          ? { ...note, title: newTitle }
          : note
      );
      setNotes(updatedNotes);
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(prev => prev ? { ...prev, title: newTitle } : null);
      }
      toast.success('Title updated successfully');
    } catch (error: any) {
      toast.error('Error updating title: ' + error.message);
    }
  };

  const handleEditType = async (newType: string) => {
    if (!selectedNote) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ type: newType })
        .eq('id', selectedNote.id);

      if (error) throw error;

      const updatedNotes = notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, type: newType }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, type: newType });
      toast.success('Type updated successfully');
    } catch (error: any) {
      toast.error('Error updating type: ' + error.message);
    }
  };

  const handleDeleteNote = async (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);
      
      if (selectedNote?.id === noteId) {
        setSelectedNote(updatedNotes[0] || null);
      }
      toast.success('Note deleted successfully');
    } catch (error: any) {
      toast.error('Error deleting note: ' + error.message);
    }
  };

  const handleContentChange = async (newContent: string) => {
    if (!selectedNote) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: newContent })
        .eq('id', selectedNote.id);

      if (error) throw error;

      const updatedNotes = notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, content: newContent }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, content: newContent });
    } catch (error: any) {
      toast.error('Error saving note: ' + error.message);
    }
  };

  const handleContentUpload = async (newContent: string) => {
    if (!selectedNote) return;
    
    try {
      const { error } = await supabase
        .from('notes')
        .update({ 
          content: selectedNote.content + (selectedNote.content ? '\n\n' : '') + newContent 
        })
        .eq('id', selectedNote.id);

      if (error) throw error;

      const updatedContent = selectedNote.content + (selectedNote.content ? '\n\n' : '') + newContent;
      const updatedNotes = notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, content: updatedContent }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, content: updatedContent });
      toast.success('Content uploaded successfully');
    } catch (error: any) {
      toast.error('Error uploading content: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
      toast.success("Logged out successfully");
    } catch (error: any) {
      toast.error("Error logging out: " + error.message);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <div className="h-full flex flex-col">
            <div className="p-4 space-y-4">
              <Input
                type="text"
                placeholder="Search"
                className="w-full"
                prefix={<Search className="w-4 h-4 text-muted-foreground" />}
              />
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleAddNote}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Note
              </Button>
            </div>
            <SidebarContent className="flex-1">
              <SidebarGroup>
                <SidebarGroupLabel>Notes</SidebarGroupLabel>
                <SidebarGroupContent>
                  <NotesList
                    notes={notes}
                    editingNoteId={editingNoteId}
                    onNoteSelect={handleNoteSelect}
                    onEditTitle={handleEditTitle}
                    onDeleteNote={handleDeleteNote}
                    onStartEditing={setEditingNoteId}
                    onStopEditing={() => setEditingNoteId(null)}
                  />
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <div className="p-4 mt-auto">
              <Button 
                className="w-full justify-start text-destructive" 
                variant="ghost"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          {selectedNote ? (
            <>
              <NoteHeader 
                title={selectedNote.title} 
                noteId={selectedNote.id}
                onContentUpdate={handleContentUpload}
              />

              <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{selectedNote.title}</h1>
                
                <NoteMetadata
                  created_at={selectedNote.created_at}
                  updated_at={selectedNote.updated_at}
                  type={selectedNote.type}
                  editingType={editingType}
                  onEditType={handleEditType}
                  onStartEditingType={() => setEditingType(true)}
                  onStopEditingType={() => setEditingType(false)}
                />

                <Separator className="my-8" />
                
                <RichTextEditor 
                  key={selectedNote.id}
                  content={selectedNote.content || ''} 
                  onChange={handleContentChange}
                />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>No note selected. Create a new note or select an existing one.</p>
            </div>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
