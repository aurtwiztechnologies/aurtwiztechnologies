"use client";

import React, { useState } from "react";
import { DIVISIONS, type BusinessDivision } from "@/config/divisions";
import { ChevronDown, Check, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface DivisionSwitcherProps {
  currentDivisionSlug?: string;
  onSelectDivision?: (division: BusinessDivision | null) => void;
}

export function DivisionSwitcher({
  currentDivisionSlug,
  onSelectDivision,
}: DivisionSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    currentDivisionSlug || null
  );

  const selectedDivision = DIVISIONS.find((d) => d.slug === selectedSlug);

  const handleSelect = (division: BusinessDivision | null) => {
    setSelectedSlug(division ? division.slug : null);
    setIsOpen(false);
    if (onSelectDivision) {
      onSelectDivision(division);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-xs font-medium text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-700"
      >
        <Layers className="h-3.5 w-3.5 text-zinc-400" />
        <span className="max-w-[130px] sm:max-w-[160px] truncate">
          {selectedDivision ? selectedDivision.shortName : "All 7 Divisions"}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-zinc-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-64 rounded-xl border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-xl backdrop-blur-md z-50 animate-in fade-in-50 zoom-in-95">
            <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800/60 mb-1">
              Filter Division Context
            </div>

            <button
              onClick={() => handleSelect(null)}
              className={cn(
                "flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-xs text-left transition-colors",
                selectedSlug === null
                  ? "bg-zinc-800 text-zinc-100 font-medium"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-400" />
                <span>All Divisions (Global OS)</span>
              </div>
              {selectedSlug === null && <Check className="h-3.5 w-3.5 text-zinc-200" />}
            </button>

            <div className="my-1 border-t border-zinc-800/60" />

            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {DIVISIONS.map((division) => {
                const isSelected = selectedSlug === division.slug;
                return (
                  <button
                    key={division.id}
                    onClick={() => handleSelect(division)}
                    className={cn(
                      "flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors",
                      isSelected
                        ? "bg-zinc-800 text-zinc-100 font-medium"
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: division.color }}
                      />
                      <span className="truncate">{division.shortName}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-zinc-200 shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

