import { WebsiteGeneration } from '@/types/template';
import { GeneratedSiteCard } from './GeneratedSiteCard';

interface GeneratedSitesGridProps {
  sites: WebsiteGeneration[];
  onManageSite?: (site: WebsiteGeneration) => void;
}

export function GeneratedSitesGrid({ sites, onManageSite }: GeneratedSitesGridProps) {
  if (!sites.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No generated sites found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sites.map((site) => (
        <GeneratedSiteCard
          key={site.id}
          site={site}
          onManage={onManageSite}
        />
      ))}
    </div>
  );
} 