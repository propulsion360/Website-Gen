
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github, Loader2, LogOut } from 'lucide-react';

interface GitHubConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (token: string, username: string) => Promise<boolean>;
  onDisconnect: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  credentials: { accessToken: string; username: string } | null;
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
  const [username, setUsername] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleConnect = async () => {
    const success = await onConnect(token, username);
    if (success) {
      setToken('');
      setUsername('');
      onClose();
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    onClose();
  };

  const handleDemoConnect = async () => {
    await onConnect();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>GitHub Integration</DialogTitle>
          <DialogDescription>
            Connect your GitHub account to push generated websites
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
                onClick={handleDisconnect}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect from GitHub
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">GitHub Username</Label>
                <Input
                  id="username"
                  placeholder="Your GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token">Personal Access Token</Label>
                <div className="relative">
                  <Input
                    id="token"
                    type={showToken ? "text" : "password"}
                    placeholder="Your GitHub personal access token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Your token needs <code>repo</code> scope permissions. <a href="https://github.com/settings/tokens/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Create one here</a>.
                </p>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting || !token || !username}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Github className="h-4 w-4 mr-2" />
                  )}
                  Connect with Token
                </Button>
                
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleDemoConnect}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Github className="h-4 w-4 mr-2" />
                  )}
                  Demo Mode (No Real GitHub)
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GitHubConnectionDialog;
