"use client";

import React from "react";
import Link from "next/link";
import { NAVIGATION_SECTIONS } from "@/config/navigation";
import { BRAND_CONFIG } from "@/config/brand";
import { SidebarItem } from "./sidebar-item";
import { ShieldCheck } from "lucide-react";

interface SidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export function Sidebar({ onItemClick, className }: SidebarProps) {
  return (
    <aside
      className={`flex flex-col h-full bg-zinc-950 border-r border-zinc-850 select-none ${
        className || ""
      }`}
    >
      {/* Brand Header */}
      <div className="flex flex-col px-5 py-4 border-b border-zinc-850">
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-2.5 group"
        >
          {/* Logo Placeholder: Geometric stylized mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black tracking-wider text-sm shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition-colors">
            AW
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-sm text-zinc-100 font-mono">
                {BRAND_CONFIG.name}
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/80">
                OS
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 truncate -mt-0.5">
              {BRAND_CONFIG.companyName}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800">
        {NAVIGATION_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  onClick={onItemClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Company Status Area */}
      <div className="p-3 border-t border-zinc-850 bg-zinc-950/80">
        <div className="p-2.5 rounded-lg border border-zinc-800/80 bg-zinc-900/50 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
                Single-Company OS
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-400">
              {BRAND_CONFIG.version}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 truncate">
            {BRAND_CONFIG.companyName}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 pt-0.5">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>Internal Platform • Secure</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
