import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import WebsiteList from './WebsiteList';
import { Website } from '@/types/website';

interface WebsiteTabsContentProps {
  tabValue: string;
  websites: Website[];
  onPushToGithub: (website: Website) => void;
  onViewDetails: (website: Website) => void;
  onEditWebsite: (website: Website) => void;
}

const WebsiteTabsContent = ({ 
  tabValue, 
  websites, 
  onPushToGithub, 
  onViewDetails, 
  onEditWebsite 
}: WebsiteTabsContentProps) => {
  const filteredWebsites = React.useMemo(() => {
    switch (tabValue) {
      case 'published':
        return websites.filter(website => website.status === 'published');
      case 'draft':
        return websites.filter(website => website.status === 'draft');
      default:
        return websites;
    }
  }, [websites, tabValue]);

  return (
    <TabsContent value={tabValue}>
      <WebsiteList 
        websites={filteredWebsites} 
        onPushToGithub={onPushToGithub}
        onViewDetails={onViewDetails}
        onEditWebsite={onEditWebsite}
      />
    </TabsContent>
  );
};

export default WebsiteTabsContent;
