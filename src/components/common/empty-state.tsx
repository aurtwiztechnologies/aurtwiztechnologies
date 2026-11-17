import * as React from "react";
import { Button } from "@/components/ui/button";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className = "",
}: EmptyStateProps) {
  const finalActionLabel = action?.label || actionLabel;
  const finalOnAction = action?.onClick || onAction;

  const renderIcon = () => {
    if (!Icon) return <FolderOpen className="h-6 w-6 text-zinc-500" />;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === "function") {
      const Component = Icon as React.ComponentType<{ className?: string }>;
      return <Component className="h-6 w-6 text-zinc-400" />;
    }
    return null;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-xs text-zinc-400 max-w-sm mb-5">{description}</p>
      {finalActionLabel && finalOnAction && (
        <Button onClick={finalOnAction} size="sm" variant="default">
          {finalActionLabel}
        </Button>
      )}
    </div>
  );
}
