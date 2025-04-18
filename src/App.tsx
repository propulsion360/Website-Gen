import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import TemplatesPage from "./pages/TemplatesPage";
import WebsitesPage from "./pages/WebsitesPage";
import ClientsPage from "./pages/ClientsPage";
import GenerateWebsitePage from "./pages/GenerateWebsitePage";
import SettingsPage from "./pages/SettingsPage";
import GitHubCallbackPage from "./pages/GitHubCallbackPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><TemplatesPage /></AppLayout>} />
          <Route path="/templates" element={<AppLayout><TemplatesPage /></AppLayout>} />
          <Route path="/websites" element={<AppLayout><WebsitesPage /></AppLayout>} />
          <Route path="/clients" element={<AppLayout><ClientsPage /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
          <Route path="/generate/:templateId" element={<AppLayout><GenerateWebsitePage /></AppLayout>} />
          <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
