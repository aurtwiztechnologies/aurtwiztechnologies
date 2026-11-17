"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/actions/auth";
import { Lock, AlertCircle, Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updatePassword(null, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-md shadow-2xl">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
          Create New Password
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Set a secure, strong password for your staff account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                className="pl-9 bg-zinc-950/70 border-zinc-800 text-xs text-zinc-100 focus-visible:ring-indigo-500"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                required
                minLength={8}
                className="pl-9 bg-zinc-950/70 border-zinc-800 text-xs text-zinc-100 focus-visible:ring-indigo-500"
                disabled={isPending}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Save New Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
