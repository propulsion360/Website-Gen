
import React from 'react';
import WebsiteCard from './WebsiteCard';
import { Website } from '@/types/website';

interface WebsiteListProps {
  websites: Website[];
  onPushToGithub: (website: Website) => void;
  onViewDetails: (website: Website) => void;
}

const WebsiteList = ({ websites, onPushToGithub, onViewDetails }: WebsiteListProps) => {
  if (!websites || websites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500 mb-4">No websites generated yet</p>
        <p className="text-sm text-gray-400">Generate a website from a template to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {websites.map((website) => (
        <WebsiteCard 
          key={website.id} 
          website={website} 
          onPushToGithub={onPushToGithub}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default WebsiteList;
