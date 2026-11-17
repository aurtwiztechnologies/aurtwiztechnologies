import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  description?: string;
  divisionCode?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  trend = "neutral",
  icon,
  description,
  divisionCode,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("hover:border-zinc-700/80 transition-all", className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            {divisionCode && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-750">
                {divisionCode}
              </span>
            )}
            {icon && <div className="text-zinc-400">{icon}</div>}
          </div>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <div className="text-2xl font-bold tracking-tight text-zinc-100">
            {value}
          </div>
          {change && (
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-emerald-400",
                trend === "down" && "text-rose-400",
                trend === "neutral" && "text-zinc-400"
              )}
            >
              {change}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-xs text-zinc-500 leading-normal">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

