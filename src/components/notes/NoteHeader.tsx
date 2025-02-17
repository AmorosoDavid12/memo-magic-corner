
import { FileText, Share2, Clock, Star, Settings, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import mammoth from "mammoth";

interface NoteHeaderProps {
  title: string;
  noteId: string;
  onContentUpdate: (content: string) => void;
}

const NoteHeader = ({
  title,
  noteId,
  onContentUpdate
}: NoteHeaderProps) => {
  const handleShareNote = () => {
    const shareableLink = `${window.location.origin}/shared/${noteId}`;
    navigator.clipboard.writeText(shareableLink);
    toast.success("Link copied to clipboard!");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    let combinedContent = '';
    
    for (const file of files) {
      try {
        let content = '';
        
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

        // Add a separator between files if there's already content
        combinedContent += (combinedContent ? '\n\n' : '') + content;
      } catch (error: any) {
        toast.error(`Error reading file ${file.name}: ${error.message}`);
      }
    }
    
    if (combinedContent) {
      onContentUpdate(combinedContent);
      toast.success("Files uploaded successfully!");
    }
  };

  return (
    <div className="border-b p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Notes
        </Button>
        <span>/</span>
        <Button variant="ghost" size="sm">
          {title}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Upload className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Files</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  multiple
                  accept=".txt,.md,.doc,.docx"
                  onChange={handleFileUpload}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={handleShareNote}
        >
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
  );
};

export default NoteHeader;
