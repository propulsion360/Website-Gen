
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Github, Globe, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Website } from '@/types/website';
import { Badge } from '@/components/ui/badge';

interface WebsiteCardProps {
  website: Website;
  onPushToGithub: (website: Website) => void;
  onViewDetails: (website: Website) => void;
}

const WebsiteCard = ({ website, onPushToGithub, onViewDetails }: WebsiteCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-500';
      case 'ready':
        return 'bg-green-500';
      case 'published':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow relative">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold">{website.name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {website.client}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(website)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPushToGithub(website)} disabled={website.status !== 'ready'}>
                Push to GitHub
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-4">
        <div className="h-32 rounded bg-gray-100 mb-4 overflow-hidden">
          {website.preview ? (
            <img 
              src={website.preview} 
              alt={website.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <Globe className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex items-center mb-2">
          <Badge className="mr-2" variant={website.status === 'published' ? 'default' : 'outline'}>
            {website.status.charAt(0).toUpperCase() + website.status.slice(1)}
          </Badge>
          <span className="text-xs text-gray-500">
            {website.template}
          </span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {website.description || 'No description provided'}
        </p>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <span className={`inline-block h-2 w-2 rounded-full mr-2 ${getStatusColor(website.status)}`}></span>
          <span>Created {website.createdAt}</span>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center p-2"
            onClick={() => onViewDetails(website)}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          {website.status === 'ready' && (
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs flex items-center bg-dashboard-indigo hover:bg-indigo-700"
              onClick={() => onPushToGithub(website)}
            >
              <Github className="h-3.5 w-3.5 mr-1" /> Push
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default WebsiteCard;
