import { useState, useEffect } from "react";
import { Search, Plus, LogOut, Pencil, Filter, Upload, X } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import mammoth from "mammoth";

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  position: number;
  favorite?: boolean;
}

const MAX_FILTERS = 3;

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState(false);
  const [editingMainTitle, setEditingMainTitle] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [typePopoverOpen, setTypePopoverOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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
        .order('position', { ascending: true });

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
      const maxPosition = notes.reduce((max, note) => Math.max(max, note.position), 0);
      
      const newNote = {
        title: "New Note",
        content: "<p></p>",
        type: "Note",
        user_id: user?.id,
        position: maxPosition + 1,
        favorite: false
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

  const handleReorderNotes = async (reorderedNotes: Note[]) => {
    try {
      // Update local state immediately for better UX
      setNotes(reorderedNotes);

      // Update notes one by one to avoid type issues with bulk update
      for (const [index, note] of reorderedNotes.entries()) {
        const { error } = await supabase
          .from('notes')
          .update({ position: index + 1 })
          .eq('id', note.id);

        if (error) throw error;
      }
    } catch (error: any) {
      toast.error('Error updating note positions: ' + error.message);
      // Revert to original order on error by re-fetching
      await fetchNotes();
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

  const handleToggleFavorite = async () => {
    if (!selectedNote) return;
    
    try {
      const newFavoriteState = !selectedNote.favorite;
      
      const { error } = await supabase
        .from('notes')
        .update({ favorite: newFavoriteState })
        .eq('id', selectedNote.id);

      if (error) throw error;

      const updatedNotes = notes.map(note => 
        note.id === selectedNote.id 
          ? { ...note, favorite: newFavoriteState }
          : note
      );
      setNotes(updatedNotes);
      setSelectedNote({ ...selectedNote, favorite: newFavoriteState });
      
      toast.success(newFavoriteState ? 'Added to favorites' : 'Removed from favorites');
    } catch (error: any) {
      toast.error('Error updating favorite status: ' + error.message);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    for (const file of files) {
      try {
        let content = '';
        let fileName = file.name.split('.')[0] || 'Uploaded Note';
        
        if (file.name.endsWith('.docx')) {
          // Handle .docx files using mammoth
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
        } else if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          // Handle .txt and .md files
          const text = await file.text();
          content = text;
        } else {
          toast.error(`Unsupported file type: ${file.name}`);
          continue;
        }
        
        // Create a new note with the file content
        const maxPosition = notes.reduce((max, note) => Math.max(max, note.position), 0);
        
        const newNote = {
          title: `${fileName}`,
          content: content,
          type: "Upload",
          user_id: user?.id,
          position: maxPosition + 1,
          favorite: false
        };

        const { data, error } = await supabase
          .from('notes')
          .insert([newNote])
          .select()
          .single();

        if (error) throw error;

        // Add the new note to the notes array and select it
        setNotes(prevNotes => [data, ...prevNotes]);
        setSelectedNote(data);
        toast.success(`File "${fileName}" uploaded successfully`);
      } catch (error: any) {
        toast.error(`Error uploading file ${file.name}: ${error.message}`);
      }
    }
    
    // Close the dialog and reset the input
    setUploadDialogOpen(false);
    e.target.value = '';
    
    // Refresh notes to ensure they're displayed
    await fetchNotes();
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

  const handleToggleTypeFilter = (type: string) => {
    setTypeFilters(currentFilters => {
      // If the filter is already selected, remove it
      if (currentFilters.includes(type)) {
        return currentFilters.filter(t => t !== type);
      }
      
      // If adding would exceed the max, show an error and don't add
      if (currentFilters.length >= MAX_FILTERS) {
        toast.error(`Maximum ${MAX_FILTERS} filters allowed. Please unselect a filter before adding a new one.`, {
          style: {
            background: '#FFDEE2',
            color: '#ea384c',
            border: '1px solid #ea384c',
          }
        });
        return currentFilters;
      }
      
      // Otherwise, add the new filter
      return [...currentFilters, type];
    });
  };

  // Get all unique types from notes
  const uniqueTypes = Array.from(new Set(notes.map(note => note.type || "Uncategorized"))).sort();
  const hasSearchInTypes = uniqueTypes.length > 10;

  // Filter notes based on search query and type filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilters.length === 0 || typeFilters.includes(note.type);
    
    return matchesSearch && matchesType;
  });

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <div className="h-full flex flex-col">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Search"
                  className="w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<Search className="w-4 h-4 text-muted-foreground" />}
                />
                {searchQuery && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-12 top-1/2 -translate-y-1/2 h-6 w-6" 
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="relative flex-shrink-0"
                    >
                      <Filter className="h-4 w-4" />
                      {typeFilters.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[10px] text-primary-foreground">
                          {typeFilters.length}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0" align="end">
                    <Command>
                      {hasSearchInTypes && (
                        <CommandInput placeholder="Search types..." />
                      )}
                      <CommandList>
                        <CommandEmpty>No types found.</CommandEmpty>
                        <CommandGroup>
                          {uniqueTypes.map((type) => (
                            <CommandItem 
                              key={type} 
                              onSelect={() => {
                                handleToggleTypeFilter(type);
                                if (typeFilters.length >= MAX_FILTERS && !typeFilters.includes(type)) {
                                  // Keep the popover open if showing an error
                                } else {
                                  setTypePopoverOpen(false);
                                }
                              }}
                              className="flex items-center justify-between"
                            >
                              <span>{type}</span>
                              {typeFilters.includes(type) && <span className="text-primary">✓</span>}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {typeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {typeFilters.map(filter => (
                    <Badge 
                      key={filter}
                      variant="secondary" 
                      className="flex items-center gap-1"
                    >
                      {filter}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-4 w-4 p-0 hover:bg-transparent" 
                        onClick={() => setTypeFilters(current => current.filter(t => t !== filter))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {typeFilters.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs" 
                      onClick={() => setTypeFilters([])}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 px-0">
                <Button 
                  className="w-1/2" 
                  variant="outline"
                  onClick={handleAddNote}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
                
                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="w-1/2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Files</DialogTitle>
                      <DialogDescription>
                        Upload .txt, .md, or .docx files to create new notes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          multiple
                          accept=".txt,.md,.docx"
                          onChange={handleFileUpload}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <SidebarContent className="flex-1">
              <SidebarGroup>
                <SidebarGroupLabel>Notes</SidebarGroupLabel>
                <SidebarGroupContent>
                  <NotesList
                    notes={filteredNotes}
                    editingNoteId={editingNoteId}
                    onNoteSelect={handleNoteSelect}
                    onEditTitle={handleEditTitle}
                    onDeleteNote={handleDeleteNote}
                    onStartEditing={setEditingNoteId}
                    onStopEditing={() => setEditingNoteId(null)}
                    onReorder={handleReorderNotes}
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
                favorite={selectedNote.favorite}
                onToggleFavorite={handleToggleFavorite}
              />

              <div className="p-8 max-w-4xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                  {editingMainTitle ? (
                    <Input
                      type="text"
                      value={selectedNote.title}
                      onChange={(e) => handleEditTitle(selectedNote.id, e.target.value)}
                      className="text-3xl font-bold h-auto py-1"
                      onBlur={() => setEditingMainTitle(false)}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold">{selectedNote.title}</h1>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setEditingMainTitle(true)}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
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
