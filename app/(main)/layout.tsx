"use client";

import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import BottomNav from "@/components/layout/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Desktop/Tablet: Sidebar */}
      <aside className="hidden md:block md:w-[72px] lg:w-[244px] border-r border-gray-200 bg-white">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-[#FAFAFA]">
        {/* Mobile: Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
          <MobileHeader />
        </header>

        {/* Content Container */}
        <div className="max-w-[630px] mx-auto pt-[60px] md:pt-0 pb-[70px] md:pb-0">
          {children}
        </div>

        {/* Mobile: Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
          <BottomNav />
        </nav>
      </main>
    </div>
  );
}
