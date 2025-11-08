/**
 * Main Layout Component
 * 
 * Wrapper component that provides consistent layout structure
 * with sidebar navigation and top navbar across all pages.
 */

'use client';

import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function MainLayout({ children, title, subtitle }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="pl-64">
        {/* Top Navigation */}
        <TopNavbar title={title} subtitle={subtitle} />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
