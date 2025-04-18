import { GitHubError, GitHubRepo } from '@/types/github';
import { Industry, Template, TemplateGroup, TemplateMetadata } from '@/types/template';

const TEMPLATE_REPO = 'propulsion-templates';
const METADATA_FILE = 'template.json';

export interface TemplatePlaceholder {
  name: string;
  description: string;
  defaultValue?: string;
  required?: boolean;
  type?: 'text' | 'color' | 'email' | 'phone' | 'textarea';
  occurrences: number;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  placeholders: TemplatePlaceholder[];
  previewImage?: string;
  category?: string;
  lastUpdated: Date;
}

export class TemplateService {
  constructor(
    private githubToken: string,
    private organization: string
  ) {}

  private async githubRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://api.github.com';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${this.githubToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new GitHubError(
        data.message || 'GitHub API error',
        response.status,
        data
      );
    }

    return data;
  }

  private async getTemplateContent(repo: GitHubRepo, path: string): Promise<string> {
    const response = await this.githubRequest(
      `/repos/${this.organization}/${TEMPLATE_REPO}/contents/${path}`
    );
    
    // GitHub API returns content as base64
    return Buffer.from(response.content, 'base64').toString('utf-8');
  }

  private async getTemplateMetadata(repo: GitHubRepo, path: string): Promise<TemplateMetadata> {
    try {
      const content = await this.getTemplateContent(repo, `${path}/${METADATA_FILE}`);
      return JSON.parse(content) as TemplateMetadata;
    } catch (error) {
      console.error(`Failed to get metadata for template at ${path}:`, error);
      throw new Error(`Invalid template metadata at ${path}`);
    }
  }

  async fetchTemplates(): Promise<TemplateGroup[]> {
    try {
      // Get the repository contents
      const contents = await this.githubRequest(
        `/repos/${this.organization}/${TEMPLATE_REPO}/contents`
      );

      // Filter directories (they represent industries)
      const industries = contents.filter((item: any) => item.type === 'dir');

      // Process each industry
      const templateGroups = await Promise.all(
        industries.map(async (industry: any) => {
          // Get templates within this industry
          const templates = await this.githubRequest(
            `/repos/${this.organization}/${TEMPLATE_REPO}/contents/${industry.name}`
          );

          // Filter template directories (they start with template-)
          const templateDirs = templates.filter((item: any) => 
            item.type === 'dir' && item.name.startsWith('template-')
          );

          // Get metadata for each template
          const processedTemplates = await Promise.all(
            templateDirs.map(async (dir: any) => {
              const metadata = await this.getTemplateMetadata(
                { name: TEMPLATE_REPO } as GitHubRepo,
                `${industry.name}/${dir.name}`
              );

              return {
                id: `${industry.name}-${dir.name}`,
                repo: { name: TEMPLATE_REPO } as GitHubRepo,
                metadata,
                path: `${industry.name}/${dir.name}`,
                lastUpdated: new Date().toISOString(), // We'll update this with actual data later
              } as Template;
            })
          );

          return {
            industry: industry.name as Industry,
            templates: processedTemplates,
          } as TemplateGroup;
        })
      );

      return templateGroups;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  }

  async validateTemplate(templatePath: string): Promise<boolean> {
    try {
      // Check if template.json exists and is valid
      await this.getTemplateMetadata(
        { name: TEMPLATE_REPO } as GitHubRepo,
        templatePath
      );

      // Check for required files (you can add more validation here)
      const requiredFiles = ['index.html', 'styles.css'];
      const contents = await this.githubRequest(
        `/repos/${this.organization}/${TEMPLATE_REPO}/contents/${templatePath}`
      );

      const files = contents.map((item: any) => item.name);
      return requiredFiles.every(file => files.includes(file));
    } catch (error) {
      console.error(`Template validation failed for ${templatePath}:`, error);
      return false;
    }
  }

  private static PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g;

  static async scanTemplateContent(content: string): Promise<TemplatePlaceholder[]> {
    const matches = new Map<string, number>();
    let match;

    // Find all placeholders and count occurrences
    while ((match = this.PLACEHOLDER_REGEX.exec(content)) !== null) {
      const placeholder = match[1].trim();
      matches.set(placeholder, (matches.get(placeholder) || 0) + 1);
    }

    // Convert to placeholder objects with default configurations
    return Array.from(matches.entries()).map(([name, occurrences]) => ({
      name,
      description: `Value for ${name.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}`,
      type: this.inferPlaceholderType(name),
      required: true,
      occurrences,
    }));
  }

  static inferPlaceholderType(name: string): TemplatePlaceholder['type'] {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('color')) return 'color';
    if (lowercaseName.includes('email')) return 'email';
    if (lowercaseName.includes('phone')) return 'phone';
    if (lowercaseName.includes('description') || lowercaseName.includes('about')) return 'textarea';
    return 'text';
  }

  static async getTemplateMetadata(repo: GitHubRepo, githubFetch: Function): Promise<TemplateMetadata> {
    try {
      // Try to get template.json first
      const response = await githubFetch(`/repos/${repo.full_name}/contents/${this.METADATA_FILE}`);
      const content = JSON.parse(Buffer.from(response.content, 'base64').toString('utf-8'));
      
      return {
        id: repo.id.toString(),
        name: repo.name,
        description: content.description || repo.description || '',
        placeholders: content.placeholders || [],
        previewImage: content.previewImage,
        category: content.category,
        lastUpdated: new Date(repo.updated_at)
      };
    } catch {
      // If no template.json, scan repository contents
      const placeholders = await this.scanRepositoryForPlaceholders(repo, githubFetch);
      
      return {
        id: repo.id.toString(),
        name: repo.name,
        description: repo.description || '',
        placeholders,
        lastUpdated: new Date(repo.updated_at)
      };
    }
  }

  static async scanRepositoryForPlaceholders(repo: GitHubRepo, githubFetch: Function): Promise<TemplatePlaceholder[]> {
    try {
      // Get all files in the repository
      const contents = await githubFetch(`/repos/${repo.full_name}/contents`);
      const placeholderMap = new Map<string, TemplatePlaceholder>();

      // Scan each file for placeholders
      for (const file of contents) {
        if (file.type === 'file' && this.isTextFile(file.name)) {
          const fileContent = await githubFetch(file.url);
          const content = Buffer.from(fileContent.content, 'base64').toString('utf-8');
          const filePlaceholders = await this.scanTemplateContent(content);

          // Merge placeholders and sum occurrences
          filePlaceholders.forEach(placeholder => {
            const existing = placeholderMap.get(placeholder.name);
            if (existing) {
              existing.occurrences += placeholder.occurrences;
            } else {
              placeholderMap.set(placeholder.name, placeholder);
            }
          });
        }
      }

      return Array.from(placeholderMap.values());
    } catch (error) {
      console.error('Failed to scan repository for placeholders:', error);
      return [];
    }
  }

  private static isTextFile(filename: string): boolean {
    const textExtensions = [
      '.txt', '.md', '.json', '.html', '.css', '.js', '.jsx', '.ts', '.tsx',
      '.yml', '.yaml', '.xml', '.svg', '.env', '.config', '.template'
    ];
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }
}

// Example template.json structure for reference
const templateMetadataExample = {
  name: "Modern Roofing Template",
  industry: "roofing",
  description: "A professional template for roofing companies with modern design",
  preview: "https://example.com/preview.jpg",
  features: [
    "Responsive design",
    "Service showcase",
    "Contact form",
    "Gallery",
    "Testimonials"
  ],
  version: "1.0.0"
}; 