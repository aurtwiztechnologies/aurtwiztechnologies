import React from "react";
import { getProfiles, getUserDivisions, getTeamMembers } from "@/lib/actions/team";
import { getDbDivisions } from "@/lib/actions/divisions";
import { TeamClient } from "./team-client";

export const metadata = {
  title: "Team Members | Aurtwiz Business OS",
  description: "Internal corporate directory, division leadership, role assignments, and access permissions for Aurtwiz Technologies.",
};

export default async function TeamPage() {
  const [profiles, userDivisions, teamMembers, divisions] = await Promise.all([
    getProfiles(),
    getUserDivisions(),
    getTeamMembers(),
    getDbDivisions(),
  ]);

  return (
    <TeamClient
      initialProfiles={profiles}
      userDivisions={userDivisions}
      teamMembers={teamMembers}
      divisions={divisions}
    />
  );
}
