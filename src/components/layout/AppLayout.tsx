
import React from 'react';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <Toaster position="top-right" />
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
