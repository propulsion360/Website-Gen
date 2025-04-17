
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GitHubConnectButtonProps {
  onConnect: () => Promise<void>;
  isConnected: boolean;
}

const GitHubConnectButton = ({ onConnect, isConnected }: GitHubConnectButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
      toast.success('Successfully connected to GitHub');
    } catch (error) {
      console.error('Failed to connect to GitHub:', error);
      toast.error('Failed to connect to GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isConnected ? "outline" : "default"}
      className={`w-full ${isConnected ? 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' : 'bg-black text-white hover:bg-gray-800'}`}
      onClick={handleConnect}
      disabled={isLoading || isConnected}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Github className="h-4 w-4 mr-2" />
      )}
      {isConnected ? 'Connected to GitHub' : 'Connect to GitHub'}
    </Button>
  );
};

export default GitHubConnectButton;
