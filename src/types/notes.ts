
export interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  position: number;
  user_id: string;
  folder_id?: string | null;
}
