"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Stage = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setStage("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/habits");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-sm flex-1 flex-col justify-center px-6">
      <h1 className="mb-1 text-2xl font-bold" style={{ color: "var(--color-brand)" }}>
        PW Training
      </h1>
      <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
        {stage === "email"
          ? "Enter your email and we'll send you a 6-digit code."
          : `Enter the code sent to ${email}.`}
      </p>

      {stage === "email" ? (
        <form onSubmit={requestCode} className="flex flex-col gap-3">
          <input
            type="email"
            required
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[var(--radius-sm)] border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-[var(--radius-sm)] py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
          >
            {loading ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <input
            inputMode="numeric"
            required
            autoFocus
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded-[var(--radius-sm)] border px-3 py-2.5 text-center text-lg tracking-[0.5em] outline-none"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-[var(--radius-sm)] py-2.5 text-sm font-semibold disabled:opacity-50"
            style={{ background: "var(--color-brand)", color: "var(--color-brand-contrast)" }}
          >
            {loading ? "Verifying…" : "Verify & log in"}
          </button>
          <button
            type="button"
            onClick={() => setStage("email")}
            className="text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            Use a different email
          </button>
        </form>
      )}

      {error && (
        <p className="mt-3 text-xs" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
