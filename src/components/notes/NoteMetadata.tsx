
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface NoteMetadataProps {
  created_at: string;
  updated_at: string;
  type: string;
  editingType: boolean;
  onEditType: (newType: string) => void;
  onStartEditingType: () => void;
  onStopEditingType: () => void;
}

const NoteMetadata = ({
  created_at,
  updated_at,
  type,
  editingType,
  onEditType,
  onStartEditingType,
  onStopEditingType,
}: NoteMetadataProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm  dd.MM.yyyy");
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Created</p>
          <p>{formatDate(created_at)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Last Edited Time</p>
          <p>{formatDate(updated_at)}</p>
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
