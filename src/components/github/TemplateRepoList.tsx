
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ExternalLink, GitBranch, RefreshCw } from 'lucide-react';

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  default_branch: string;
  updated_at: string;
}

interface TemplateRepoListProps {
  templates: GitHubRepo[];
  isLoading: boolean;
  onRefresh: () => void;
}

const TemplateRepoList = ({ templates, isLoading, onRefresh }: TemplateRepoListProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>GitHub Templates</CardTitle>
          <CardDescription>Template repositories found in your GitHub account</CardDescription>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          className={isLoading ? 'animate-spin' : ''}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
              <p>No template repositories found.</p>
              <p className="mt-1">Create repositories starting with &apos;template-&apos; to see them here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((repo) => (
                <Card key={repo.id}>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">
                          {repo.name.replace('template-', '')}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {repo.description || 'No description'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(repo.html_url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center mt-4 text-xs text-muted-foreground">
                      <GitBranch className="h-3 w-3 mr-1" />
                      <span>{repo.default_branch}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TemplateRepoList;
