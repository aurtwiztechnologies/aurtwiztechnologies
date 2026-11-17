"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Building2,
  GitBranch,
  Layers,
  FolderKanban,
  CheckSquare,
  Code2,
  Palette,
  TrendingUp,
  Film,
  Trophy,
  Gamepad2,
  Briefcase,
  CreditCard,
  FileText,
  Receipt,
  Users,
  BarChart3,
  Bell,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/config/navigation";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  UserPlus,
  Building2,
  GitBranch,
  Layers,
  FolderKanban,
  CheckSquare,
  Code2,
  Palette,
  TrendingUp,
  Film,
  Trophy,
  Gamepad2,
  Briefcase,
  CreditCard,
  FileText,
  Receipt,
  Users,
  BarChart3,
  Bell,
  Settings,
};

interface SidebarItemProps {
  item: NavItem;
  onClick?: () => void;
}

export function SidebarItem({ item, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const IconComponent = ICON_MAP[item.icon] || HelpCircle;

  // Active check: Exact match for /dashboard, startsWith for subroutes
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-all select-none",
        isActive
          ? "bg-zinc-800/90 text-white shadow-sm font-semibold border-l-2 border-indigo-500 pl-[9px]"
          : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <IconComponent
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isActive
              ? "text-indigo-400"
              : "text-zinc-500 group-hover:text-zinc-300"
          )}
        />
        <span className="truncate">{item.title}</span>
      </div>

      {item.badge && (
        <Badge
          variant={item.badgeVariant || "outline"}
          className={cn(
            "text-[10px] py-0 px-1.5 h-4 ml-1.5 shrink-0",
            isActive ? "border-zinc-700 bg-zinc-750 text-zinc-200" : ""
          )}
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

