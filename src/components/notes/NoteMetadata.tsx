
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NoteMetadataProps {
  created: string;
  lastEdited: string;
  type: string;
  editingType: boolean;
  onEditType: (newType: string) => void;
  onStartEditingType: () => void;
  onStopEditingType: () => void;
}

const NoteMetadata = ({
  created,
  lastEdited,
  type,
  editingType,
  onEditType,
  onStartEditingType,
  onStopEditingType,
}: NoteMetadataProps) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Created</p>
          <p>{created}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Last Edited Time</p>
          <p>{lastEdited}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Type</p>
          <div className="flex items-center gap-2">
            {editingType ? (
              <Input
                type="text"
                value={type}
                onChange={(e) => onEditType(e.target.value)}
                className="h-6 py-0 px-1"
                onBlur={onStopEditingType}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <span>{type}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onStartEditingType}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteMetadata;
