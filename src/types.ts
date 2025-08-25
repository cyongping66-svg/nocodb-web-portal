export interface Column {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
}

export interface Row {
  id: string;
  [key: string]: any;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  rows: Row[];
}

export type ViewMode = 'grid' | 'card';