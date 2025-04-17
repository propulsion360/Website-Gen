
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
  content?: {
    sections: {
      id: string;
      type: 'text' | 'image';
      content: string;
      label: string;
    }[];
  };
  styles?: {
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
  };
}
