export interface User {
  username: string;
  password: string;
  note?: string;
}

export interface MarkdownEditorParams {
  users: User[];
  apiPrefix: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created: string;
  updated?: string;
  username?: string;
}

export interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
} 