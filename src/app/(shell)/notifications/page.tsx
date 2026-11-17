import React from "react";
import { getNotifications } from "@/lib/actions/notifications";
import { NotificationsClient } from "./notifications-client";

export const metadata = {
  title: "Notifications Center | Aurtwiz Business OS",
  description: "System alerts, division announcements, project milestones, and audit notifications.",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return <NotificationsClient initialNotifications={notifications} />;
}
