
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import RichTextEditor from "@/components/rich-text-editor";
import NoteMetadata from "@/components/notes/NoteMetadata";

interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
}

const Shared = () => {
  const { noteId } = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNote();
  }, [noteId]);

  const fetchNote = async () => {
    try {
      if (!noteId) return;

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) throw error;
      
      if (!data) {
        setNote(null);
        return;
      }

      setNote(data);
    } catch (error: any) {
      toast.error('Error loading note: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading note...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-4">Note not found</p>
          <a href="/" className="text-blue-500 hover:text-blue-700">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">{note.title}</h1>
      
      <NoteMetadata
        created_at={note.created_at}
        updated_at={note.updated_at}
        type={note.type}
        editingType={false}
        onEditType={() => {}}
        onStartEditingType={() => {}}
        onStopEditingType={() => {}}
      />

      <Separator className="my-8" />
      
      <div className="prose prose-sm max-w-none">
        <RichTextEditor 
          content={note.content || ''} 
          onChange={() => {}}
          readOnly
        />
      </div>
    </div>
  );
};

export default Shared;
