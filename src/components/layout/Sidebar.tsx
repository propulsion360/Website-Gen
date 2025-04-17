
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FileText, Globe, Users, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { 
      title: 'Templates', 
      path: '/templates', 
      icon: <FileText className="w-5 h-5" /> 
    },
    { 
      title: 'Generated Websites', 
      path: '/websites', 
      icon: <Globe className="w-5 h-5" /> 
    },
    { 
      title: 'Client Management', 
      path: '/clients', 
      icon: <Users className="w-5 h-5" /> 
    },
  ];

  return (
    <div className="w-64 bg-dashboard-dark text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center">
          <Github className="h-6 w-6 mr-2 text-dashboard-purple" />
          <h1 className="text-xl font-bold">WebForge Studio</h1>
        </div>
      </div>
      <nav className="flex-1 pt-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => cn(
                  "flex items-center px-4 py-2.5 rounded-md transition-colors group hover:bg-gray-700",
                  isActive ? "bg-dashboard-purple text-white" : "text-gray-300"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center text-sm text-gray-400">
          <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
          <span>Connected to GitHub</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
