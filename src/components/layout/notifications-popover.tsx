"use client";

import React, { useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "system" | "task" | "finance" | "division";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "System Architecture Deployed",
    description: "AURTWIZ BUSINESS OS initial shell and RBAC foundation initialized.",
    time: "Just now",
    type: "system",
    read: false,
  },
  {
    id: "notif-2",
    title: "Technology Division Sync",
    description: "New AI automation workflow blueprint added to services catalog.",
    time: "25m ago",
    type: "division",
    read: false,
  },
  {
    id: "notif-3",
    title: "Financial Ledger Audit",
    description: "Q4 cross-division expense categories and invoicing ready for Supabase.",
    time: "1h ago",
    type: "finance",
    read: true,
  },
];

export function NotificationsPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-700"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-800 bg-zinc-900/95 shadow-xl backdrop-blur-md z-50 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between p-3.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <Badge variant="default" className="text-[10px] py-0 px-1.5 h-4">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Mark read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/50">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "p-3.5 text-xs transition-colors hover:bg-zinc-800/40",
                    !item.read ? "bg-zinc-800/20" : ""
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-zinc-200">{item.title}</span>
                    <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                      {item.time}
                    </span>
                  </div>
                  <p className="mt-1 text-zinc-400 text-[11px] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-2.5 border-t border-zinc-800 text-center bg-zinc-950/40">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
              >
                View all notifications
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
