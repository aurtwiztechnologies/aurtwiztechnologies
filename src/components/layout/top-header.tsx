"use client";

import React, { useState } from "react";
import { Search, Menu, Plus } from "lucide-react";
import { DivisionSwitcher } from "./division-switcher";
import { NotificationsPopover } from "./notifications-popover";
import { UserMenu } from "./user-menu";
import { GlobalSearchModal } from "./global-search-modal";
import { Button } from "@/components/ui/button";

interface TopHeaderProps {
  onMobileMenuToggle: () => void;
}

export function TopHeader({ onMobileMenuToggle }: TopHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-zinc-850 bg-zinc-950/80 px-4 sm:px-6 backdrop-blur-md">
        {/* Left Section: Mobile Menu Toggle & Division Context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors focus:outline-none"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:block">
            <DivisionSwitcher />
          </div>
        </div>

        {/* Center / Search Placeholder Section */}
        <div className="flex-1 max-w-md mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 text-xs text-zinc-400 transition-all select-none group"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-300" />
              <span className="truncate">Search Aurtwiz OS modules, divisions, tasks...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-700/80 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section: Quick Action, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className="hidden lg:flex items-center gap-1.5 text-xs h-8 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            <span>Quick Action</span>
          </Button>

          <NotificationsPopover />

          <div className="h-5 w-[1px] bg-zinc-800 hidden sm:block" />

          <UserMenu />
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
