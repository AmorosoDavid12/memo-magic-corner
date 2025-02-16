import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarProvider
} from "@/components/ui/sidebar";
import RichTextEditor from "@/components/RichTextEditor";
import NotesList from "@/components/notes/NotesList";
import NoteHeader from "@/components/notes/NoteHeader";
import NoteMetadata from "@/components/notes/NoteMetadata";

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

const defaultNote: Note = {
  id: "1",
  title: "Post-mortem with The Brain",
  created: "November 23, 2023 1:26 PM",
  lastEdited: "November 23, 2023 1:28 PM",
  type: "Post-mortem",
  participants: "Empty",
  date: "Empty",
  content: ""
};

const Index = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : [defaultNote];
  });

  const [selectedNote, setSelectedNote] = useState<Note>(() => {
    const savedSelectedNoteId = localStorage.getItem('selectedNoteId');
    if (savedSelectedNoteId) {
      const savedNotes = localStorage.getItem('notes');
      const parsedNotes = savedNotes ? JSON.parse(savedNotes) : [defaultNote];
      return parsedNotes.find(note => note.id === savedSelectedNoteId) || parsedNotes[0];
    }
    return notes[0];
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState(false);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    if (selectedNote) {
      localStorage.setItem('selectedNoteId', selectedNote.id);
    }
  }, [selectedNote]);

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      created: new Date().toLocaleString(),
      lastEdited: new Date().toLocaleString(),
      type: "Note",
      participants: "Empty",
      date: "Empty",
      content: ""
    };
    setNotes(prevNotes => [...prevNotes, newNote]);
    setSelectedNote(newNote);
    setEditingNoteId(newNote.id);
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setEditingNoteId(null);
    setEditingType(false);
  };

  const handleEditTitle = (noteId: string, newTitle: string) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, title: newTitle, lastEdited: new Date().toLocaleString() }
        : note
    );
    setNotes(updatedNotes);
    if (selectedNote.id === noteId) {
      setSelectedNote({ ...selectedNote, title: newTitle, lastEdited: new Date().toLocaleString() });
    }
  };

  const handleEditType = (newType: string) => {
    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id 
        ? { ...note, type: newType, lastEdited: new Date().toLocaleString() }
        : note
    );
    setNotes(updatedNotes);
    setSelectedNote({ ...selectedNote, type: newType, lastEdited: new Date().toLocaleString() });
  };

  const handleDeleteNote = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    if (selectedNote.id === noteId) {
      setSelectedNote(updatedNotes[0] || null);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!selectedNote) return;
    
    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id 
        ? { ...note, content: newContent, lastEdited: new Date().toLocaleString() }
        : note
    );
    setNotes(updatedNotes);
    
    const updatedSelectedNote = updatedNotes.find(note => note.id === selectedNote.id);
    if (updatedSelectedNote) {
      setSelectedNote(updatedSelectedNote);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
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
          <SidebarContent>
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
        </Sidebar>

        <div className="flex-1 overflow-auto">
          {selectedNote ? (
            <>
              <NoteHeader title={selectedNote.title} />

              <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{selectedNote.title}</h1>
                
                <NoteMetadata
                  created={selectedNote.created}
                  lastEdited={selectedNote.lastEdited}
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
