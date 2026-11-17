"use client";

import React, { useState, useEffect } from "react";
import { Search, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { DIVISIONS } from "@/config/divisions";
import { NAVIGATION_SECTIONS } from "@/config/navigation";
import Link from "next/link";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDivisions = DIVISIONS.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.services.some((s) => s.name.toLowerCase().includes(query.toLowerCase()))
  );

  const allNavItems = NAVIGATION_SECTIONS.flatMap((s) => s.items);
  const filteredNavItems = allNavItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden z-10 animate-in fade-in-50 zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-zinc-800">
          <Search className="h-4 w-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Search divisions, services, clients, tasks, or settings... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent px-3 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-zinc-400 hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Modules */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              System Modules
            </div>
            <div className="space-y-0.5 mt-1">
              {filteredNavItems.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="p-1 rounded bg-zinc-800 group-hover:bg-zinc-700 text-zinc-400 group-hover:text-zinc-200">
                      <LayoutDashboard className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <span className="font-medium">{item.title}</span>
                      {item.description && (
                        <p className="text-[11px] text-zinc-500 truncate max-w-md">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-3 w-3 text-zinc-600 group-hover:text-zinc-400 shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>

          {/* Business Divisions & Services */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
              Business Divisions & Capabilities
            </div>
            <div className="space-y-0.5 mt-1">
              {filteredDivisions.map((div) => (
                <Link
                  key={div.id}
                  href={`/divisions/${div.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: div.color }}
                    />
                    <div>
                      <span className="font-medium">{div.name}</span>
                      <p className="text-[11px] text-zinc-500 truncate max-w-md">
                        {div.services.map((s) => s.name).join(" • ")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-750">
                    {div.code}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800/80 bg-zinc-950/60 text-[11px] text-zinc-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">↵</kbd> Select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">ESC</kbd> Close</span>
          </div>
          <span className="font-mono text-zinc-600">AURTWIZ OS Search</span>
        </div>
      </div>
    </div>
  );
}
