import { GitHubError, GitHubRepo, GitHubCommitFile } from '@/types/github';
import { ClientInfo, Template, WebsiteGeneration } from '@/types/template';
import { nanoid } from 'nanoid';
import { SettingsService } from './settingsService';

interface VercelDeployment {
  id: string;
  url: string;
  status: string;
}

interface VercelDomainConfig {
  name: string;
  domain: string;
}

export class WebsiteGenerationService {
  private readonly settingsService: SettingsService;
  private readonly TEMPLATE_DOMAIN = 'template.propulsion360.com';
  private readonly SITE_DOMAIN = 'site.propulsion360.com';

  constructor(
    private githubToken: string,
    private organization: string,
    private vercelToken: string,
    private vercelTeamId: string,
    private strapiWebhookUrl?: string
  ) {
    this.settingsService = SettingsService.getInstance();
    // Initialize git configuration
    this.settingsService.configureGit().catch(console.error);
  }

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

  private async vercelRequest(endpoint: string, options: RequestInit = {}) {
    const baseUrl = 'https://api.vercel.com';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.vercelToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Vercel API error: ${data.message || 'Unknown error'}`);
    }

    return data;
  }

  private generateRepoName(clientInfo: ClientInfo): string {
    const sanitizedName = clientInfo.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    return `site-${sanitizedName}-${nanoid(6)}`;
  }

  private async createGitHubRepo(name: string, description: string): Promise<GitHubRepo> {
    return await this.githubRequest(
      `/orgs/${this.organization}/repos`,
      {
        method: 'POST',
        body: JSON.stringify({
          name,
          description,
          private: true,
          auto_init: true,
        }),
      }
    );
  }

  private async copyTemplateContents(
    templatePath: string,
    targetRepo: string,
    clientInfo: ClientInfo
  ): Promise<void> {
    // Get template contents
    const contents = await this.githubRequest(
      `/repos/${this.organization}/propulsion-templates/contents/${templatePath}`
    );

    // Process and copy each file
    for (const item of contents) {
      if (item.type === 'file') {
        const content = await this.githubRequest(item.url);
        const fileContent = Buffer.from(content.content, 'base64').toString('utf-8');
        
        // Replace placeholders with client info
        const processedContent = this.processTemplateContent(fileContent, clientInfo);

        await this.githubRequest(
          `/repos/${this.organization}/${targetRepo}/contents/${item.path}`,
          {
            method: 'PUT',
            body: JSON.stringify({
              message: `Add ${item.path}`,
              content: Buffer.from(processedContent).toString('base64'),
            }),
          }
        );
      }
    }
  }

  private processTemplateContent(content: string, clientInfo: ClientInfo): string {
    // Replace placeholders with actual client info
    const replacements = {
      '{{businessName}}': clientInfo.businessName,
      '{{contactName}}': clientInfo.contactName,
      '{{email}}': clientInfo.email,
      '{{phone}}': clientInfo.phone,
      '{{address}}': clientInfo.address || '',
      '{{primaryColor}}': clientInfo.colors?.primary || '#000000',
      '{{secondaryColor}}': clientInfo.colors?.secondary || '#ffffff',
      '{{accentColor}}': clientInfo.colors?.accent || '#cccccc',
    };

    let processedContent = content;
    for (const [placeholder, value] of Object.entries(replacements)) {
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
    }

    return processedContent;
  }

  private async deployToVercel(
    repoName: string,
    isTemplate: boolean = false
  ): Promise<VercelDeployment> {
    // Create new project in Vercel
    const project = await this.vercelRequest('/v9/projects', {
      method: 'POST',
      body: JSON.stringify({
        name: repoName,
        gitRepository: {
          repo: `${this.organization}/${repoName}`,
          type: 'github',
        },
        framework: 'other',
      }),
    });

    // Set up custom domain
    const domain = isTemplate ? this.TEMPLATE_DOMAIN : this.SITE_DOMAIN;
    const subdomain = repoName.replace(/^(template-|site-)/, '');
    
    await this.vercelRequest(`/v9/projects/${project.id}/domains`, {
      method: 'POST',
      body: JSON.stringify({
        name: `${subdomain}.${domain}`,
      }),
    });

    // Trigger deployment
    const deployment = await this.vercelRequest('/v13/deployments', {
      method: 'POST',
      body: JSON.stringify({
        name: repoName,
        project: project.id,
        target: 'production',
        teamId: this.vercelTeamId,
      }),
    });

    return {
      id: deployment.id,
      url: `https://${subdomain}.${domain}`,
      status: deployment.status,
    };
  }

  async deployTemplate(template: Template): Promise<string> {
    try {
      const deployment = await this.deployToVercel(template.id, true);
      return deployment.url;
    } catch (error) {
      console.error('Failed to deploy template:', error);
      throw error;
    }
  }

  private async notifyStrapi(websiteGeneration: WebsiteGeneration): Promise<void> {
    if (!this.strapiWebhookUrl) return;

    try {
      await fetch(this.strapiWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'website.generated',
          data: websiteGeneration,
        }),
      });
    } catch (error) {
      console.error('Failed to notify Strapi:', error);
      // Don't throw error as this is optional
    }
  }

  async generateWebsite(
    template: Template,
    clientInfo: ClientInfo,
    enableStrapi: boolean = false
  ): Promise<WebsiteGeneration> {
    const generation: WebsiteGeneration = {
      id: nanoid(),
      templateId: template.id,
      clientInfo,
      status: 'pending',
      strapiEnabled: enableStrapi,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Update status
      generation.status = 'generating';
      generation.updatedAt = new Date().toISOString();

      // Create GitHub repository
      const repoName = this.generateRepoName(clientInfo);
      const repo = await this.createGitHubRepo(
        repoName,
        `Website for ${clientInfo.businessName}`
      );

      // Copy and process template contents
      await this.copyTemplateContents(template.path, repoName, clientInfo);

      // Update generation with GitHub info
      generation.githubRepo = repo.html_url;
      generation.status = 'deploying';
      generation.updatedAt = new Date().toISOString();

      // Deploy to Vercel with custom domain
      const deployment = await this.deployToVercel(repoName, false);
      generation.deploymentUrl = deployment.url;
      generation.status = 'completed';
      generation.updatedAt = new Date().toISOString();

      // Notify Strapi if enabled
      if (enableStrapi) {
        await this.notifyStrapi(generation);
      }

      return generation;
    } catch (error) {
      generation.status = 'failed';
      generation.error = error instanceof Error ? error.message : 'Unknown error';
      generation.updatedAt = new Date().toISOString();
      throw error;
    }
  }
} 