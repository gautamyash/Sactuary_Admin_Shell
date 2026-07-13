"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Spinner } from "@/components/common/spinner";
import { Button } from "@/components/ui/button";
import { HOME_ROUTE } from "@/config/site";
import { useAuth } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/errors";

/**
 * Login screen. Authenticates against the Django JWT endpoint via the shared
 * auth hook and redirects home on success. This wires the auth flow end-to-end;
 * visual polish and richer validation are layered in later phases.
 */
export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login.mutateAsync({ email, password });
      router.replace(HOME_ROUTE);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-6 space-y-1">
        <h1 className="text-xl font-bold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">Access the hospital administration portal.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
            placeholder="admin@sanctuaryhealth.com"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-ring"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending && <Spinner className="text-primary-foreground" />}
          Sign in
        </Button>
      </form>
    </div>
  );
}
