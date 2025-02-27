
import { FileText, Share2, Clock, Star, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

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
