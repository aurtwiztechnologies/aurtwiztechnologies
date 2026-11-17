"use client";

import React, { Suspense, useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/actions/auth";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/dashboard";
  const errorParam = searchParams.get("error");

  const [errorMessage, setErrorMessage] = useState<string | null>(errorParam);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    formData.set("redirectTo", redirectedFrom);

    startTransition(async () => {
      const res = await signIn(null, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-md shadow-2xl">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
          Staff Sign In
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Enter your company email and password to access the business platform.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300" htmlFor="email">
              Work Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@aurtwiz.com"
                required
                className="pl-9 bg-zinc-950/70 border-zinc-800 text-xs text-zinc-100 focus-visible:ring-indigo-500"
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300" htmlFor="password">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                required
                className="pl-9 bg-zinc-950/70 border-zinc-800 text-xs text-zinc-100 focus-visible:ring-indigo-500"
                disabled={isPending}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all mt-2"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In to Platform"
            )}
          </Button>
        </form>

        <div className="mt-5 border-t border-zinc-800/80 pt-4 text-center">
          <p className="text-[11px] text-zinc-500">
            Internal staff access only • Authorized personnel of Aurtwiz Technologies
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <Card className="border-zinc-800 bg-zinc-900/80 p-8 text-center text-xs text-zinc-400">
          Loading sign in...
        </Card>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
