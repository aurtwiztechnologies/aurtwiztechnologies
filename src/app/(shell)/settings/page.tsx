import React from "react";
import { getCurrentUserProfile } from "@/lib/actions/auth";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Settings | Aurtwiz Business OS",
  description: "User profile management, role credentials, security parameters, and single-company architecture.",
};

export default async function SettingsPage() {
  const { user, profile } = await getCurrentUserProfile();

  return (
    <SettingsClient
      initialProfile={profile}
      userEmail={user?.email || ""}
    />
  );
}
