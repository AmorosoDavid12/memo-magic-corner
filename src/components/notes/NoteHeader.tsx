import { FileText, Share2, Clock, Star, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
interface NoteHeaderProps {
  title: string;
}
const NoteHeader = ({
  title
}: NoteHeaderProps) => {
  return <div className="border-b p-4 flex justify-between items-center">
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
        <Button variant="ghost" size="icon" className="The share button should allow the user to share the speccific note to different platforms, in private convos or through a link.\nThe link will open a page with only the notes page, uneditable by anyone else but the user">
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
    </div>;
};
export default NoteHeader;