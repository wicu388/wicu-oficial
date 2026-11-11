import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.id !== process.env.WICU_ADMIN_USER_ID) {
    redirect("/admin/login");
  }

  const secciones = [
    {
      titulo: "Pedidos",
      descripcion: "Consulta y administra las solicitudes de compra.",
      href: "/admin/pedidos",
    },
    {
      titulo: "Productos",
      descripcion: "Gestiona el catálogo y el inventario.",
        href: "/admin/productos",
    },
    {
      titulo: "Ventas",
      descripcion: "Supervisa el movimiento comercial.",
    },
    {
      titulo: "Seguridad",
      descripcion: "Controla el acceso administrativo.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050914] p-5 text-white sm:p-10">
      <header className="mb-10 border-b border-white/10 pb-6">
        <p className="text-sm font-semibold tracking-widest text-blue-400">
          WICU OFICIAL 2.0
        </p>
        <h1 className="mt-3 text-3xl font-black sm:text-4xl">
          Centro de Control
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Administración protegida de WICU
        </p>

        <form action="/api/admin/logout" method="post" className="mt-5">
          <button
            type="submit"
            className="rounded-xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {secciones.map(({ titulo, descripcion, href }) =>
          href ? (
            <Link
              key={titulo}
              href={href}
              className="rounded-2xl border border-blue-400/30 bg-[#0d1729] p-6 transition hover:border-blue-400 hover:bg-[#12213a]"
            >
              <h2 className="text-xl font-bold text-blue-300">{titulo}</h2>
              <p className="mt-3 text-sm text-slate-400">{descripcion}</p>
              <p className="mt-5 text-sm font-semibold text-blue-400">
                Abrir sección →
              </p>
            </Link>
          ) : (
            <article
              key={titulo}
              className="rounded-2xl border border-blue-400/20 bg-[#0d1729] p-6"
            >
              <h2 className="text-xl font-bold text-blue-300">{titulo}</h2>
              <p className="mt-3 text-sm text-slate-400">{descripcion}</p>
            </article>
          )
        )}
      </section>

      <p className="mt-10 text-xs text-slate-500">
        Sesión administrativa: {user.email}
      </p>
    </main>
  );
}
