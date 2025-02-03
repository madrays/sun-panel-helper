export interface User {
  username: string;
  password: string;
  note?: string;
}

export interface MarkdownEditorParams {
  users: Array<{
    username: string;
    password: string;
    note: string;
  }>;
  apiPrefix: string;  // 添加 API 前缀配置
}

export interface Note {
  id: string;
  title: string;
  content: string;
  created: string;
  updated?: string;
  username?: string;  // 添加用户标识
} 