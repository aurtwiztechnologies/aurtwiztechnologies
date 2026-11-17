"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./top-header";
import { MobileNav } from "./mobile-nav";

interface ShellContainerProps {
  children: React.ReactNode;
}

export function ShellContainer({ children }: ShellContainerProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Desktop Left Sidebar (Fixed 64 / 256px) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:shrink-0">
        <Sidebar className="w-64" />
      </div>

      {/* Mobile Nav Slide-over Drawer */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopHeader onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

