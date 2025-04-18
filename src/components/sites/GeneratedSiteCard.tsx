import { WebsiteGeneration } from '@/types/template';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PreviewModal } from '@/components/ui/PreviewModal';
import { PreviewButton } from '@/components/ui/PreviewButton';
import { Eye, Github, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface GeneratedSiteCardProps {
  site: WebsiteGeneration;
  onManage?: (site: WebsiteGeneration) => void;
}

export function GeneratedSiteCard({ site, onManage }: GeneratedSiteCardProps) {
  const statusColors = {
    pending: 'bg-yellow-500',
    generating: 'bg-blue-500 animate-pulse',
    deploying: 'bg-purple-500 animate-pulse',
    completed: 'bg-green-500',
    failed: 'bg-red-500',
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{site.clientInfo.businessName}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${statusColors[site.status]}`} />
                {site.status}
              </Badge>
              {site.strapiEnabled && (
                <Badge variant="secondary">CMS Enabled</Badge>
              )}
            </div>
          </div>
          {site.deploymentUrl && (
            <PreviewButton url={site.deploymentUrl} size="sm" />
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm text-gray-500">
          <p><strong>Contact:</strong> {site.clientInfo.contactName}</p>
          <p><strong>Email:</strong> {site.clientInfo.email}</p>
          <p><strong>Phone:</strong> {site.clientInfo.phone}</p>
          {site.clientInfo.address && (
            <p><strong>Address:</strong> {site.clientInfo.address}</p>
          )}
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Created: {format(new Date(site.createdAt), 'PPP')}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        {site.deploymentUrl && (
          <PreviewModal
            url={site.deploymentUrl}
            title={site.clientInfo.businessName}
            trigger={
              <Button variant="ghost" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </Button>
            }
          />
        )}
        <div className="flex items-center gap-2">
          {site.githubRepo && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.open(site.githubRepo, '_blank')}
            >
              <Github className="h-4 w-4" />
              Repository
            </Button>
          )}
          {onManage && (
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onManage(site)}
            >
              <ExternalLink className="h-4 w-4" />
              Manage
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 