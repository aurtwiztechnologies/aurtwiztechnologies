import React from "react";
import { ShellContainer } from "@/components/layout/shell-container";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ShellContainer>{children}</ShellContainer>;
}

