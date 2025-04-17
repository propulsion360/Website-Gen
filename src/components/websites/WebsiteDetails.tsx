
import React from 'react';
import { Website } from '@/types/website';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface WebsiteDetailsProps {
  website: Website | null;
  isOpen: boolean;
  onClose: () => void;
}

const WebsiteDetails = ({ website, isOpen, onClose }: WebsiteDetailsProps) => {
  if (!website) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{website.name}</DialogTitle>
          <DialogDescription>
            Website details and preview
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="aspect-video bg-gray-100 rounded-md overflow-hidden mb-4">
              {website.preview ? (
                <img 
                  src={website.preview} 
                  alt={website.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-400">No preview available</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Client</h4>
              <p>{website.client}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Template</h4>
              <p>{website.template}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <p className="capitalize">{website.status}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p>{website.description || 'No description provided'}</p>
            </div>
            
            {website.githubUrl && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">GitHub Repository</h4>
                <a 
                  href={website.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {website.githubUrl}
                </a>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteDetails;
