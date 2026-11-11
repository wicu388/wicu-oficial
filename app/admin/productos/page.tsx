import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductosPanel from "@/components/admin/ProductosPanel";

export default async function ProductosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.WICU_ADMIN_USER_ID) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[#050914] p-5 text-white sm:p-10">
      <header className="border-b border-white/10 pb-6">
        <Link
          href="/admin"
          className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
        >
          ← Volver al Centro de Control
        </Link>

        <h1 className="mt-4 text-3xl font-black sm:text-4xl">
          Gestión de productos
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Consulta el catálogo completo y el estado de inventario de WICU.
        </p>
      </header>

      <ProductosPanel />
    </main>
  );
}
