
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import WebsiteList from './WebsiteList';
import { Website } from '@/types/website';

interface WebsiteTabsContentProps {
  tabValue: string;
  websites: Website[];
  filteredWebsites?: Website[];
  onPushToGithub: (website: Website) => void;
  onViewDetails: (website: Website) => void;
  onEditWebsite: (website: Website) => void;
}

const WebsiteTabsContent = ({ 
  tabValue, 
  websites, 
  filteredWebsites, 
  onPushToGithub, 
  onViewDetails, 
  onEditWebsite 
}: WebsiteTabsContentProps) => {
  // Use filtered websites if provided, otherwise use all websites
  const displayWebsites = filteredWebsites || websites;

  return (
    <TabsContent value={tabValue}>
      <WebsiteList 
        websites={displayWebsites} 
        onPushToGithub={onPushToGithub}
        onViewDetails={onViewDetails}
        onEditWebsite={onEditWebsite}
      />
    </TabsContent>
  );
};

export default WebsiteTabsContent;
