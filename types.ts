
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
  user: string; // 'You' or 'Bot' or other user's identifier
  text: string;
  timestamp: number;
  isAIMessage?: boolean; // True for AI system messages or AI Q&A intro/summary in chat
  isSystemMessage?: boolean; // True for connection status, join/leave notifications
  isOwnMessage?: boolean; // True if the message was sent by the current user
  roomId?: string; // To associate message with a specific repo room
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