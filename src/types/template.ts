import { GitHubRepo } from './github';

export type Industry = 
  | 'roofing'
  | 'plumbing'
  | 'electrical'
  | 'landscaping'
  | 'construction'
  | 'cleaning'
  | 'other';

export interface TemplateMetadata {
  name: string;
  industry: Industry;
  description: string;
  preview: string;
  features: string[];
  version: string;
}

export interface TemplatePlaceholder {
  name: string;
  type: 'text' | 'email' | 'tel' | 'color' | 'textarea' | 'url' | 'date' | 'select';
  description: string;
  required: boolean;
  occurrences: number;
  files: string[];
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[]; // For select type
  };
  category?: 'business' | 'design' | 'content' | 'contact' | 'social';
  displayOrder?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  previewImage?: string;
  category: string;
  placeholders: TemplatePlaceholder[];
  repoUrl: string;
  path: string;
  lastUpdated: Date;
}

export interface TemplateGroup {
  industry: Industry;
  templates: Template[];
}

export interface ClientInfo {
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  address?: string;
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface WebsiteGeneration {
  id: string;
  templateId: string;
  clientInfo: ClientInfo;
  status: 'pending' | 'generating' | 'deploying' | 'completed' | 'failed';
  githubRepo?: string;
  deploymentUrl?: string;
  strapiEnabled: boolean;
  strapiWebhookUrl?: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface GeneratedForm {
  id: string;
  templateId: string;
  url: string;
  expiresAt: Date;
  placeholders: TemplatePlaceholder[];
  status: 'active' | 'expired' | 'completed';
  createdAt: Date;
}
