import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PedidosPanel from "@/components/admin/PedidosPanel";

export default async function PedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.WICU_ADMIN_USER_ID) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#050914] p-5 text-white sm:p-10">
      <header className="border-b border-white/10 pb-6">
        <p className="text-sm font-semibold tracking-widest text-blue-400">
          WICU OFICIAL 2.0
        </p>

        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          Gestión de pedidos
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Consulta los pedidos registrados en WICU.
        </p>

        <Link
          href="/admin"
          className="mt-5 inline-block rounded-xl border border-blue-400/30 px-5 py-3 text-sm font-semibold text-blue-300 transition hover:bg-blue-400/10"
        >
          ← Volver al Centro de Control
        </Link>
      </header>

      <PedidosPanel />
    </main>
  );
}
