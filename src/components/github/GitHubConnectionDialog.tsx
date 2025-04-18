import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Loader2, LogOut } from 'lucide-react';
import { GitHubCredentials } from '@/types/github';
import { toast } from 'sonner';

interface GitHubConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials: GitHubCredentials) => Promise<boolean>;
  onDisconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  credentials: GitHubCredentials | null;
}

const GitHubConnectionDialog = ({
  isOpen,
  onClose,
  onConnect,
  onDisconnect,
  isConnecting,
  isConnected,
  credentials
}: GitHubConnectionDialogProps) => {
  const [token, setToken] = useState('');

  const handleConnect = async () => {
    if (!token.trim()) {
      toast.error('Please enter a GitHub personal access token');
      return;
    }

    try {
      // Test the token by making a request to get user info
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid token or insufficient permissions');
      }

      const user = await response.json();
      await onConnect({
        accessToken: token,
        username: user.login
      });

      setToken('');
      toast.success('Successfully connected to GitHub');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect to GitHub');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>GitHub Integration</DialogTitle>
          <DialogDescription>
            Connect your GitHub account to manage templates and push generated websites
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isConnected ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 font-medium">Connected to GitHub</p>
                <p className="text-sm text-green-600 mt-1">Username: {credentials?.username}</p>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={onDisconnect}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Disconnect from GitHub
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token">GitHub Personal Access Token</Label>
                <Input
                  id="token"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <p className="text-xs text-gray-500">
                  Create a token with 'repo' scope at{' '}
                  <a 
                    href="https://github.com/settings/tokens/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    GitHub Settings
                  </a>
                </p>
              </div>
              
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-black text-white hover:bg-gray-800"
              >
                {isConnecting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                Connect with GitHub
              </Button>
              
              <div className="text-xs text-gray-500 mt-4">
                <p className="mb-2">The token needs these permissions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>repo (Full control of private repositories)</li>
                  <li>read:org (Read organization data)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubConnectionDialog;
