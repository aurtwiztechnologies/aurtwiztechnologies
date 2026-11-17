"use client";

import React, { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/actions/auth";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await requestPasswordReset(null, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSubmitted(true);
      }
    });
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-md shadow-2xl">
      <CardHeader className="space-y-1 text-center pb-4">
        <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs text-zinc-400">
          Enter your company email and we will send you a password recovery link.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-zinc-100">Recovery Link Sent</h4>
              <p className="text-xs text-zinc-400">
                If an account exists for that email, you will receive password reset instructions.
              </p>
            </div>
            <Link href="/login" className="inline-block mt-2">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

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

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Recovery Link"
              )}
            </Button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
