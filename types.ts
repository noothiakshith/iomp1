export interface Commit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface Issue {
  id: number;
  title: string;
  user: string;
  date: string;
  url: string;
  state: 'open' | 'closed';
  number: number;
  labels: { name: string; color: string }[];
}

export interface PullRequest {
  id: number;
  title: string;
  user: string;
  date: string;
  url: string;
  state: 'open' | 'closed' | 'merged';
  number: number;
}

export interface Contributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  htmlUrl: string;
}

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: RepoFile[];
  sha?: string; 
  size?: number;
  content?: string; // Added field for file content
}

export interface RepoData {
  fullName: string; // e.g. "owner/repo"
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  openIssuesCount: number;
  defaultBranch: string;
  url: string;
  files: RepoFile[];
  commits: Commit[];
  issues: Issue[];
  pullRequests: PullRequest[];
  contributors: Contributor[];
  language?: string;
  license?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  user: string;
  timestamp: number;
  roomId: string;
  isAIMessage?: boolean;
  isSystemMessage?: boolean;
  isOwnMessage?: boolean;
  reactions?: string[];
  codeSnippets?: CodeSnippet[];
  parentMessageId?: string; // For threaded replies
  threadCount?: number; // Number of replies in thread
  isEdited?: boolean;
  editHistory?: {
    text: string;
    timestamp: number;
  }[];
  mentions?: string[]; // For @mentions
  attachments?: {
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
    size?: number;
  }[];
}

export interface CodeSnippet {
  code: string;
  language: string;
  timestamp: number;
}

export interface AIConversation {
  id: string;
  question: string;
  answer: string | null;
  timestamp: number;
  isLoading: boolean;
  error?: string | null;
  repoFullName: string; // To associate with a specific repo
  user?: string; // User who asked the question (e.g., MOCK_USER_ID or other identifier)
}

export interface CodeAnalysis {
  suggestions: string[];
  complexity: number;
  issues: string[];
  improvements: string[];
  explanation: string;
}

export enum ActiveView {
  OVERVIEW = 'Overview',
  FILES = 'Files',
  COMMITS = 'Commits',
  ISSUES = 'Issues',
  PULL_REQUESTS = 'Pull Requests',
  CONTRIBUTORS = 'Contributors',
}

export enum ChatMode {
  CHAT = 'Chat',
  AI_QA = 'AI Q&A',
}

export enum SocketStatus {
  IDLE = 'Idle',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  DISCONNECTED = 'Disconnected',
  ERROR = 'Error',
}