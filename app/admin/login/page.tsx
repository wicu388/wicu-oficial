"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function iniciarSesion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050914] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-3xl border border-blue-400/20 bg-[#0d1729] p-7 shadow-2xl shadow-blue-950/40 sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/10 text-3xl font-black text-blue-300">
            W
          </div>

          <h1 className="text-3xl font-black tracking-widest">
            WICU
          </h1>

          <p className="mt-2 text-sm text-blue-300">
            CENTRO DE CONTROL
          </p>

          <p className="mt-5 text-sm text-slate-400">
            Acceso exclusivo para administración
          </p>
        </div>

        <form onSubmit={iniciarSesion} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Correo electrónico
            </label>

            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo administrativo"
              className="w-full rounded-xl border border-white/10 bg-[#080f1d] px-4 py-3 text-white outline-none transition focus:border-blue-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Contraseña
            </label>

            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              className="w-full rounded-xl border border-white/10 bg-[#080f1d] px-4 py-3 text-white outline-none transition focus:border-blue-400"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Verificando acceso..." : "INGRESAR A WICU"}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-slate-500">
          WICU Oficial 2.0 · Acceso protegido
        </p>
      </section>
    </main>
  );
}
