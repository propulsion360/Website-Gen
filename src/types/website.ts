
export interface Website {
  id: string;
  name: string;
  client: string;
  template: string;
  status: 'draft' | 'ready' | 'published';
  description?: string;
  createdAt: string;
  githubUrl?: string;
  preview?: string;
}
