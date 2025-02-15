
import { useState } from "react";
import { 
  Search, 
  Settings, 
  FileText, 
  Plus, 
  Share2, 
  Clock, 
  Star,
  MessageSquare,
  Pencil
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

interface Note {
  id: string;
  title: string;
  created: string;
  lastEdited: string;
  type: string;
  createdBy: string;
  participants: string;
  date: string;
  content: {
    discussionPoints: string[];
    actionItems: string[];
  };
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Post-mortem with The Brain",
      created: "November 23, 2023 1:26 PM",
      lastEdited: "November 23, 2023 1:28 PM",
      type: "Post-mortem",
      createdBy: "Harry Guinness",
      participants: "Empty",
      date: "Empty",
      content: {
        discussionPoints: [
          "The Brain's goal to take over the world",
          "Pinky's interference with The Brain's plans",
          "Analysis of Pinky's behavior and its impact on The Brain's strategies",
          "Brainstorming potential solutions to prevent Pinky from derailing world domination plans"
        ],
        actionItems: [
          "Conduct further research on Pinky's psychology and motivations",
          "Develop contingency plans to mitigate Pinky's influence on The Brain's operations"
        ]
      }
    }
  ]);
  const [selectedNote, setSelectedNote] = useState<Note>(notes[0]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const handleAddNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      created: new Date().toLocaleString(),
      lastEdited: new Date().toLocaleString(),
      type: "Note",
      createdBy: "User",
      participants: "Empty",
      date: "Empty",
      content: {
        discussionPoints: [],
        actionItems: []
      }
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
    setEditingNoteId(newNote.id);
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
    setEditingNoteId(null);
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
                        {editingNoteId !== note.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNoteId(note.id);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
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
                  <p>{selectedNote.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p>{selectedNote.createdBy}</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Discussion Points */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Discussion Points</h2>
              <ul className="space-y-2">
                {selectedNote.content.discussionPoints.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Action Items</h2>
              <ul className="space-y-2">
                {selectedNote.content.actionItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Comment Section */}
            <div className="mt-8">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>Add a comment...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
