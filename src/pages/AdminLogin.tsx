import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router";
import { Loader2, Lock } from "lucide-react";
import Logo from "../components/Logo";
import { Field } from "../components/Field";
import { isSignedIn, signIn } from "../lib/api";

export default function AdminLogin() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (isSignedIn()) return <Navigate to="/admin" replace />;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const ok = await signIn(String(f.get("email")), String(f.get("password")));
    setBusy(false);
    if (ok) nav("/admin", { replace: true });
    else setError("الإيميل أو كلمة السر غلط.");
  }

  return (
    <div className="grid-lines-ink grid min-h-dvh place-items-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-ink/10 shadow-[0_30px_60px_-30px_rgba(14,24,48,.5)]">
          <div className="mb-2 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-ink text-paper">
              <Lock className="size-4" />
            </span>
            <div>
              <h1 className="text-xl font-black">لوحة الإدارة</h1>
              <p className="text-xs text-muted">سجّل دخولك لتكمل</p>
            </div>
          </div>
          <Field label="الإيميل" name="email" type="email" required dir="ltr" className="[&_input]:text-right" autoComplete="username" />
          <Field label="كلمة السر" name="password" type="password" required dir="ltr" className="[&_input]:text-right" autoComplete="current-password" />
          {error && <p className="text-sm text-accent-deep">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-display font-bold text-paper transition-colors hover:bg-ink-2 disabled:opacity-70"
          >
            {busy && <Loader2 className="size-4 animate-spin" />} دخول
          </button>
        </form>
      </div>
    </div>
  );
}
