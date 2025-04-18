import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PreviewModalProps {
  url: string;
  title: string;
  trigger?: React.ReactNode;
}

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

const viewportSizes = {
  mobile: { width: '375px', height: '667px' },
  tablet: { width: '768px', height: '1024px' },
  desktop: { width: '100%', height: '800px' },
};

export function PreviewModal({ url, title, trigger }: PreviewModalProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <div className="flex items-center gap-4">
            <ToggleGroup
              type="single"
              value={viewport}
              onValueChange={(value) => value && setViewport(value as ViewportSize)}
            >
              <ToggleGroupItem value="mobile" aria-label="Mobile view">
                <Smartphone className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="tablet" aria-label="Tablet view">
                <Tablet className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="desktop" aria-label="Desktop view">
                <Monitor className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.open(url, '_blank')}
            >
              Open in new tab
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden p-6 flex items-center justify-center bg-gray-100 rounded-lg">
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
            style={{
              width: viewportSizes[viewport].width,
              height: viewportSizes[viewport].height,
            }}
          >
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={`Preview of ${title}`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 