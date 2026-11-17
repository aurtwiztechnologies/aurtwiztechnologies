"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowRight, Search, Sparkles, Layers } from "lucide-react";
import Link from "next/link";
import { DIVISIONS } from "@/config/divisions";
import type { ServiceRow } from "@/lib/actions/services";

interface ServicesClientProps {
  dbServices: ServiceRow[];
}

export function ServicesClient({ dbServices }: ServicesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivisionSlug, setSelectedDivisionSlug] = useState("all");

  const totalCatalogServices = DIVISIONS.reduce((acc, d) => acc + d.services.length, 0);

  // Filter divisions and services
  const filteredDivisions = DIVISIONS.filter((division) => {
    if (selectedDivisionSlug !== "all" && division.slug !== selectedDivisionSlug) {
      return false;
    }
    return true;
  }).map((division) => {
    const filteredServices = division.services.filter((service) => {
      if (!searchTerm) return true;
      return (
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        division.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    return {
      ...division,
      services: filteredServices,
    };
  }).filter((div) => div.services.length > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Services Catalog"
        description="Comprehensive directory of the 31 standardized service offerings across Aurtwiz Technologies' 7 business divisions."
        breadcrumbs={[{ label: "Business" }, { label: "Services", current: true }]}
        badge={
          <Badge variant="default" className="font-mono text-xs">
            {totalCatalogServices} Standardized Services
          </Badge>
        }
      />

      {/* Search and Division Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search across all 31 service offerings and capabilities..."
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedDivisionSlug}
            onChange={(e) => setSelectedDivisionSlug(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All 7 Divisions</option>
            {DIVISIONS.map((div) => (
              <option key={div.slug} value={div.slug}>
                {div.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Services List by Division */}
      <div className="space-y-6">
        {filteredDivisions.length === 0 ? (
          <div className="text-center py-12 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400">
            No services matching &ldquo;{searchTerm}&rdquo;
          </div>
        ) : (
          filteredDivisions.map((division) => (
            <Card key={division.id} className="border-zinc-800/80">
              <CardHeader className="pb-3 border-b border-zinc-800/60 bg-zinc-950/40">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: division.color }}
                    />
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {division.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {division.description}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {division.code}
                    </span>
                    <Link
                      href={`/divisions/${division.slug}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
                    >
                      Division Hub <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {division.services.map((service) => (
                    <div
                      key={service.id}
                      className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between hover:border-zinc-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-zinc-200">
                            {service.name}
                          </span>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {service.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-800/50 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                        <span>Status: Active</span>
                        <span className="text-zinc-400">{division.code}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
