import React from "react";
import { Breadcrumbs } from "./breadcrumbs";
import type { BreadcrumbItem } from "@/types/navigation";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-6 border-b border-zinc-850">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-zinc-400 max-w-2xl">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 pt-2 sm:pt-0">{actions}</div>}
      </div>
    </div>
  );
}

