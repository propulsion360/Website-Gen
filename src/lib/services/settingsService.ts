import settings from '@/config/settings.json';

interface GitHubSettings {
  username: string;
  email: string;
  organization: string;
}

interface TemplateSettings {
  defaultName: string;
  defaultBranch: string;
  categories: string[];
}

interface Settings {
  github: GitHubSettings;
  templates: TemplateSettings;
}

export class SettingsService {
  private static instance: SettingsService;
  private settings: Settings;

  private constructor() {
    this.settings = settings;
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public getGitHubSettings(): GitHubSettings {
    return this.settings.github;
  }

  public getTemplateSettings(): TemplateSettings {
    return this.settings.templates;
  }

  public async configureGit(): Promise<void> {
    const { username, email } = this.settings.github;
    try {
      await Promise.all([
        this.runGitCommand(`git config --global user.name "${username}"`),
        this.runGitCommand(`git config --global user.email "${email}"`)
      ]);
    } catch (error) {
      console.error('Failed to configure git:', error);
      throw error;
    }
  }

  private async runGitCommand(command: string): Promise<void> {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
      exec(command, (error: Error | null) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }
} 