import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { setSession } from "@/lib/session";
import { createAdminSession } from "@/lib/auth.functions";
import { STUDENT_PIN } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "College Resource Portal — Sign in" },
      {
        name: "description",
        content: "Enter your PIN to access class notes, homework, PPTs and overviews.",
      },
      { property: "og:title", content: "College Resource Portal" },
      {
        property: "og:description",
        content: "Notes, homework, PPTs and class overviews for every year and batch.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const verifyAdmin = useServerFn(createAdminSession);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (pin === STUDENT_PIN) {
      setSession("student");
      navigate({ to: "/resources" });
      return;
    }

    setBusy(true);
    try {
     const res = await verifyAdmin({ data: { pin } });
    if (res?.ok) {
      setSession("admin");
      sessionStorage.setItem("admin_token", "admin");
      localStorage.setItem("admin_token", "admin");
      window.location.href = "/admin";
      return;
    }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect PIN. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
          College Resource Portal
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Notes, homework, PPTs and class overviews.
        </p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError("");
            }}
            placeholder="Enter your PIN"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {busy ? "Checking…" : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
