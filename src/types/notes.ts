
export interface Note {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
  updated_at: string;
  position: number;
  folder_id: string | null;
}

export interface Folder {
  id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
}
