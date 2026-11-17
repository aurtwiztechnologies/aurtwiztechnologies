"use client";

import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { SYSTEM_ROLES } from "@/config/roles";
import {
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  Building,
  KeyRound,
  User,
} from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, role, signOut, isLoading } = useAuth();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Staff Member";
  const displayEmail = profile?.email || user?.email || "staff@aurtwiz.com";
  const displayRole = SYSTEM_ROLES[role]?.name || "Team Member";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "AW";

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-zinc-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-700"
      >
        <Avatar
          fallback={initials}
          size="sm"
          className="bg-indigo-600/30 text-indigo-300 border-indigo-500/30 font-semibold"
        />
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-zinc-200 leading-none truncate max-w-[120px]">
            {displayName}
          </span>
          <span className="text-[10px] text-zinc-400 leading-none mt-1">
            {displayRole}
          </span>
        </div>
        <ChevronDown className="hidden md:block h-3.5 w-3.5 text-zinc-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900/95 shadow-xl backdrop-blur-md z-50 animate-in fade-in-50 zoom-in-95">
            {/* User Header Details */}
            <div className="p-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Avatar
                  fallback={initials}
                  size="md"
                  className="bg-indigo-600/30 text-indigo-300 border-indigo-500/30 font-bold"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-zinc-200 truncate">
                    {displayName}
                  </span>
                  <span className="text-[11px] text-zinc-400 truncate">
                    {displayEmail}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <Badge
                  variant={role === "super_admin" ? "success" : "outline"}
                  className="text-[10px] px-2 py-0"
                >
                  {displayRole}
                </Badge>
                <span className="text-[10px] font-mono text-zinc-500">
                  Aurtwiz OS
                </span>
              </div>
            </div>

            {/* Menu Links */}
            <div className="p-1.5 space-y-0.5 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Organization Context
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-zinc-400 text-xs">
                <Building className="h-3.5 w-3.5 text-zinc-500" />
                <span className="truncate">Aurtwiz Technologies</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-zinc-400 text-xs">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>{role === "super_admin" ? "Cross-Division Authority" : "Division Scoped"}</span>
              </div>

              <div className="my-1 border-t border-zinc-800" />

              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <User className="h-3.5 w-3.5 text-zinc-400" />
                <span>My Profile</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <Settings className="h-3.5 w-3.5 text-zinc-400" />
                <span>Platform Settings</span>
              </Link>
            </div>

            {/* Sign Out Action */}
            <div className="p-1.5 border-t border-zinc-800">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
