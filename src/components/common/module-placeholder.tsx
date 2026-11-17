import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, ShieldCheck, Sparkles, Layers, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ModulePlaceholderProps {
  moduleName: string;
  category: "Business" | "Divisions" | "Finance" | "Team" | "Analytics" | "System";
  description: string;
  databaseTables: string[];
  plannedFeatures: string[];
  divisionScope?: string;
  quickLinks?: { label: string; href: string }[];
}

export function ModulePlaceholder({
  moduleName,
  category,
  description,
  databaseTables,
  plannedFeatures,
  divisionScope = "Cross-Division (All 7 Divisions)",
  quickLinks,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-6">
      {/* Top Status Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Step 1 Architecture Initialized
              </span>
              <Badge variant="outline" className="text-[10px]">
                {category}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Routing, navigation shell, security bounds, and Supabase entity schemas are locked in.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-[11px] gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            Internal OS Protected
          </Badge>
          <Badge variant="default" className="text-[11px]">
            {divisionScope}
          </Badge>
        </div>
      </div>

      {/* Grid of Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Module Description & Roadmap */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Layers className="h-4 w-4" />
              <span className="text-xs uppercase tracking-wider font-medium">Module Specification</span>
            </div>
            <CardTitle>{moduleName}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                Planned Capabilities (Step 2 Integration)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {plannedFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80 text-xs text-zinc-300"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 mt-1.5 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {quickLinks && quickLinks.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Related Architecture Routes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((link, i) => (
                    <Link
                      key={i}
                      href={link.href}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3 text-zinc-500" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Database Schema Preparation */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-xs uppercase tracking-wider font-medium">Database Layer</span>
            </div>
            <CardTitle className="text-base">Supabase Prepared</CardTitle>
            <CardDescription>
              PostgreSQL schema entities mapped in <code className="text-xs text-zinc-300">src/types/database.ts</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-medium text-zinc-400">Target Tables:</span>
              <div className="mt-2 flex flex-col gap-1.5">
                {databaseTables.map((table, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-md bg-zinc-950/60 border border-zinc-800/80 text-xs font-mono"
                  >
                    <span className="text-zinc-200">{table}</span>
                    <Badge variant="outline" className="text-[10px] text-zinc-400">
                      RLS Enabled
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-400 space-y-1">
              <div className="text-zinc-300 font-medium">Security Boundary:</div>
              <p className="text-[11px] leading-relaxed">
                Row-Level Security (RLS) ensures division-scoped data isolation while granting executive roles centralized visibility.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

