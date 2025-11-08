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

      {/* Main Content Area - Responsive padding */}
      <div className="lg:pl-64">
        {/* Top Navigation - Responsive padding for mobile menu button */}
        <div className="pl-16 lg:pl-0">
          <TopNavbar title={title} subtitle={subtitle} />
        </div>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
