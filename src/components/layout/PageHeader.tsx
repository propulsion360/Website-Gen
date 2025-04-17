
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

const PageHeader = ({ title, description, actionButton }: PageHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actionButton && (
          <Button onClick={actionButton.onClick} className="min-w-32">
            {actionButton.icon && <span className="mr-2">{actionButton.icon}</span>}
            {actionButton.label}
          </Button>
        )}
      </div>
      <Separator />
    </div>
  );
};

export default PageHeader;
