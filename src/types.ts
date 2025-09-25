export type ItemType = 'file' | 'folder';
export type ItemStatus = 'active' | 'trashed';

export interface FileSystemItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  status: ItemStatus;
  size?: string;
  modified: string;
  owner: string;
}
