
import { useState } from "react";
import { 
  Search, 
  Settings, 
  FileText, 
  Plus, 
  Share2, 
  Clock, 
  Star,
  Pencil,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider
} from "@/components/ui/sidebar";
import RichTextEditor from "@/components/RichTextEditor";

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

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Post-mortem with The Brain",
      created: "November 23, 2023 1:26 PM",
      lastEdited: "November 23, 2023 1:28 PM",
      type: "Post-mortem",
      participants: "Empty",
      date: "Empty",
      content: ""
    }
  ]);
  const [selectedNote, setSelectedNote] = useState<Note>(notes[0]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState(false);

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
    setNotes([...notes, newNote]);
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
    const updatedNotes = notes.map(note => 
      note.id === selectedNote.id 
        ? { ...note, content: newContent, lastEdited: new Date().toLocaleString() }
        : note
    );
    setNotes(updatedNotes);
    setSelectedNote({ ...selectedNote, content: newContent, lastEdited: new Date().toLocaleString() });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
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
                <SidebarMenu>
                  {notes.map((note) => (
                    <SidebarMenuItem key={note.id}>
                      <SidebarMenuButton 
                        onClick={() => handleNoteSelect(note)}
                        className="w-full flex justify-between items-center group"
                      >
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {editingNoteId === note.id ? (
                            <Input
                              type="text"
                              value={note.title}
                              onChange={(e) => handleEditTitle(note.id, e.target.value)}
                              className="h-6 py-0 px-1"
                              onBlur={() => setEditingNoteId(null)}
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
                              setEditingNoteId(note.id);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={(e) => handleDeleteNote(note.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {selectedNote ? (
            <>
              {/* Header */}
              <div className="border-b p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Notes
                  </Button>
                  <span>/</span>
                  <Button variant="ghost" size="sm">
                    {selectedNote.title}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Clock className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Star className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Note Content */}
              <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">{selectedNote.title}</h1>
                
                {/* Metadata */}
                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p>{selectedNote.created}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Edited Time</p>
                      <p>{selectedNote.lastEdited}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <div className="flex items-center gap-2">
                        {editingType ? (
                          <Input
                            type="text"
                            value={selectedNote.type}
                            onChange={(e) => handleEditType(e.target.value)}
                            className="h-6 py-0 px-1"
                            onBlur={() => setEditingType(false)}
                            autoFocus
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{selectedNote.type}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setEditingType(true)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />
                
                {/* Rich Text Editor */}
                <RichTextEditor 
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
