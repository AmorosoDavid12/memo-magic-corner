
import { FileText, Share2, Star, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteHeaderProps {
  title: string;
  noteId: string;
  onContentUpdate: (content: string) => void;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}

const NoteHeader = ({
  title,
  noteId,
  onContentUpdate,
  favorite = false,
  onToggleFavorite = () => {}
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
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleFavorite}
        >
          <Star className={`w-4 h-4 ${favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled className="opacity-50 cursor-not-allowed">
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>In development</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default NoteHeader;
