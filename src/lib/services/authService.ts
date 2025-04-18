import { SettingsService } from './settingsService';

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
}

export class AuthService {
  private static instance: AuthService;
  private static readonly STORAGE_KEY = 'github_auth_token';
  private token: string | null = null;
  private settingsService: SettingsService;
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private readonly stateKey = 'github_oauth_state';

  private constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.settingsService = SettingsService.getInstance();
    this.redirectUri = `${window.location.origin}/auth/github/callback`;
    this.loadToken();
  }

  public static getInstance(clientId?: string, clientSecret?: string): AuthService {
    if (!AuthService.instance) {
      if (!clientId || !clientSecret) {
        throw new Error('GitHub OAuth credentials are required for initialization');
      }
      AuthService.instance = new AuthService(clientId, clientSecret);
    }
    return AuthService.instance;
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(token: string): void {
    this.token = token;
    this.saveToken(token);
    this.configureGit(token);
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public clearToken(): void {
    this.token = null;
    localStorage.removeItem(AuthService.STORAGE_KEY);
  }

  private loadToken(): void {
    try {
      const token = localStorage.getItem(AuthService.STORAGE_KEY);
      if (token) {
        this.token = token;
        this.configureGit(token);
      }
    } catch (error) {
      console.error('Failed to load GitHub token:', error);
    }
  }

  private saveToken(token: string): void {
    try {
      localStorage.setItem(AuthService.STORAGE_KEY, token);
    } catch (error) {
      console.error('Failed to save GitHub token:', error);
    }
  }

  private async configureGit(token: string): Promise<void> {
    try {
      const { username, email } = this.settingsService.getGitHubSettings();
      await Promise.all([
        this.runGitCommand(`git config --global user.name "${username}"`),
        this.runGitCommand(`git config --global user.email "${email}"`),
        this.runGitCommand(`git config --global credential.helper store`),
        // Store GitHub token in git credentials
        this.storeGitHubCredentials(token)
      ]);
    } catch (error) {
      console.error('Failed to configure git:', error);
    }
  }

  private async storeGitHubCredentials(token: string): Promise<void> {
    const { username } = this.settingsService.getGitHubSettings();
    
    try {
      // Store credentials in the git credential store
      await this.runGitCommand(`git credential approve <<EOF
protocol=https
host=github.com
username=${username}
password=${token}
EOF`);
    } catch (error) {
      console.error('Failed to store GitHub credentials:', error);
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

  public async getAuthenticatedUser(): Promise<GitHubUser> {
    if (!this.token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  public getLoginUrl(): string {
    const state = this.generateState();
    localStorage.setItem(this.stateKey, state);
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'repo admin:org',
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  public async handleCallback(code: string, state: string): Promise<string> {
    const savedState = localStorage.getItem(this.stateKey);
    if (!savedState || savedState !== state) {
      throw new Error('Invalid state parameter');
    }

    localStorage.removeItem(this.stateKey);

    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: this.redirectUri,
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error_description || 'Failed to get access token');
    }

    const token = data.access_token;
    this.setToken(token);
    return token;
  }
} 