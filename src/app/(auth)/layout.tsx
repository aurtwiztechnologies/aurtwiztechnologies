import React from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 p-4 relative overflow-hidden select-none">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center mb-8 z-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white font-black tracking-wider text-lg shadow-lg shadow-indigo-600/30 mb-3">
          AW
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold tracking-wider text-xl text-zinc-100 font-mono">
            {BRAND_CONFIG.name}
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/80">
            OS
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          {BRAND_CONFIG.companyName} • Internal Platform
        </p>
      </div>

      {/* Main Auth Form Container */}
      <div className="w-full max-w-md z-10">
        {children}
      </div>

      {/* Footer Security Badge */}
      <div className="mt-8 flex items-center gap-1.5 text-xs text-zinc-400 z-10">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span>Enterprise Single-Company Authentication</span>
      </div>
    </div>
  );
}
