import { Website } from './website';

export interface GitHubCredentials {
  accessToken: string;
  username: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  default_branch: string;
  // Extended properties for our app
  type?: 'template' | 'website';
  lastUpdated?: Date;
  stars?: number;
}

export interface CreateRepoParams {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

export interface GitHubCommitFile {
  path: string;
  content: string;
  message: string;
  encoding?: string;
}

export interface WebsiteToRepoMapping {
  websiteId: string;
  repoName: string;
  repoUrl: string;
}

export class GitHubError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'GitHubError';
  }
} 