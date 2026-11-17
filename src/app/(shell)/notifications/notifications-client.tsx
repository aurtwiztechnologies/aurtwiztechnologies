"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Check,
  CheckCheck,
  Calendar,
  Layers,
  Shield,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationRow,
} from "@/lib/actions/notifications";

interface NotificationsClientProps {
  initialNotifications: NotificationRow[];
}

export function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<NotificationRow[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isPending, startTransition] = useTransition();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications Center"
        description="System alerts, division announcements, project milestones, and audit notifications."
        breadcrumbs={[{ label: "System" }, { label: "Notifications", current: true }]}
        badge={
          <Badge variant="outline" className="font-mono text-xs">
            {unreadCount} Unread
          </Badge>
        }
        actions={
          unreadCount > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="gap-1.5 text-xs"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark All as Read
            </Button>
          ) : undefined
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className="text-xs"
        >
          All Notifications ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
          className="text-xs"
        >
          Unread Only ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">User Activity & Alerts</CardTitle>
          <CardDescription className="text-xs">
            Broadcast messages, task updates, and automated notifications recorded in <code className="text-zinc-300">public.notifications</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title={filter === "unread" ? "No Unread Notifications" : "Your Inbox is Clean"}
              description={
                filter === "unread"
                  ? "You have acknowledged all system notifications and task assignment alerts."
                  : "Notifications triggered by project updates, task deadlines, and invoice clearances will appear here."
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                    n.is_read
                      ? "border-zinc-800/60 bg-zinc-950/40 text-zinc-400"
                      : "border-zinc-700 bg-zinc-900/60 text-zinc-100 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 shrink-0 mt-0.5">
                      <Bell className={`h-4 w-4 ${n.is_read ? "text-zinc-500" : "text-blue-400"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-100">{n.title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {n.type || "System"}
                        </Badge>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0 text-right">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(n.created_at).toLocaleDateString()}
                    </span>
                    {!n.is_read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(n.id)}
                        disabled={isPending}
                        className="h-7 text-xs text-blue-400 hover:text-blue-300 gap-1 px-2"
                      >
                        <Check className="h-3 w-3" />
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
