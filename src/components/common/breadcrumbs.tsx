import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@/types/navigation";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-zinc-400 select-none">
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Dashboard</span>
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-zinc-200 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-zinc-200 font-medium" : ""}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

