import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIVISIONS } from "@/config/divisions";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

export default function DivisionsOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Divisions"
        description="Aurtwiz Technologies operates 7 specialized business divisions under one unified corporate structure."
        breadcrumbs={[{ label: "Divisions", current: true }]}
        badge={
          <Badge variant="success" className="font-mono text-xs">
            7 Divisions Active
          </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DIVISIONS.map((division) => (
          <Card key={division.id} className="flex flex-col justify-between hover:border-zinc-700 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: division.color }}
                />
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-750">
                  {division.code}
                </span>
              </div>
              <CardTitle className="text-lg font-bold mt-2">
                {division.name}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed mt-1">
                {division.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  Core Offerings ({division.services.length})
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {division.services.map((service) => (
                    <span
                      key={service.id}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-300"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-zinc-500" />
                  <span className="truncate">{division.leadRole}</span>
                </div>
                <Link href={`/divisions/${division.slug}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    Enter Hub
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
