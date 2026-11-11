"use client";

import { useEffect, useMemo, useState } from "react";
import ProductoEditor from "./ProductoEditor";
import ProductoNuevoForm from "./ProductoNuevoForm";

type Producto = {
  id: number;
  nombre: string | null;
  precio: string | number | null;
  categoria: string | null;
  activo: boolean | null;
  destacado: boolean | null;
  stock: number | null;
  imagen: string | null;
  imagenes?: string[] | string | null;
  descripcion: string | null;
  origen?: string | null;
  proveedor?: string | null;
};

const moneda = (valor: string | number | null) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

function obtenerImagen(producto: Producto): string {
  if (Array.isArray(producto.imagenes)) {
    const primera = producto.imagenes.find(
      (imagen) => typeof imagen === "string" && imagen.trim()
    );
    if (primera) return primera;
  }

  if (typeof producto.imagenes === "string") {
    try {
      const lista = JSON.parse(producto.imagenes);
      if (Array.isArray(lista) && typeof lista[0] === "string") {
        return lista[0];
      }
    } catch {
      if (producto.imagenes.startsWith("http")) {
        return producto.imagenes;
      }
    }
  }

  return producto.imagen || "";
}

export default function ProductosPanel() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [creandoProducto, setCreandoProducto] = useState(false);

  useEffect(() => {
    async function cargarProductos() {
      try {
        const respuesta = await fetch("/api/admin/productos", {
          cache: "no-store",
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok) {
          throw new Error(
            resultado.error || "No se pudieron cargar los productos."
          );
        }

        setProductos(resultado.productos || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al consultar los productos."
        );
      } finally {
        setCargando(false);
      }
    }

    void cargarProductos();
  }, []);

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLocaleLowerCase("es");

    if (!termino) return productos;

    return productos.filter((producto) =>
      [producto.nombre, producto.categoria, String(producto.id)]
        .filter(Boolean)
        .some((dato) =>
          String(dato).toLocaleLowerCase("es").includes(termino)
        )
    );
  }, [productos, busqueda]);

  return (
    <section className="mt-8">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-400/20 bg-[#0d1729] p-5">
          <p className="text-sm text-slate-400">Productos registrados</p>
          <p className="mt-2 text-3xl font-black text-white">
            {productos.length}
          </p>
        </div>

        <div className="rounded-2xl border border-green-400/20 bg-[#0d1729] p-5">
          <p className="text-sm text-slate-400">Productos activos</p>
          <p className="mt-2 text-3xl font-black text-green-300">
            {productos.filter((producto) => producto.activo).length}
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-400/20 bg-[#0d1729] p-5">
          <p className="text-sm text-slate-400">Productos inactivos</p>
          <p className="mt-2 text-3xl font-black text-yellow-300">
            {productos.filter((producto) => producto.activo === false).length}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Inventario WICU</h2>
          <p className="mt-1 text-sm text-slate-400">Administra y registra tus productos.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreandoProducto(true)}
          className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          + Crear producto
        </button>
      </div>

      <div className="mb-5">
        <label
          htmlFor="buscar-producto"
          className="mb-2 block text-sm font-semibold text-slate-300"
        >
          Buscar productos
        </label>
        <input
          id="buscar-producto"
          type="search"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          placeholder="Nombre, categoría o código..."
          className="w-full rounded-xl border border-white/10 bg-[#0d1729] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-400"
        />
      </div>

      {cargando ? (
        <p className="rounded-xl bg-[#0d1729] p-6 text-slate-300">
          Cargando productos...
        </p>
      ) : error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
          {error}
        </p>
      ) : productosFiltrados.length === 0 ? (
        <p className="rounded-xl bg-[#0d1729] p-6 text-slate-300">
          No encontramos productos con esa búsqueda.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {productosFiltrados.map((producto) => {
            const imagen = obtenerImagen(producto);

            return (
              <article
                key={producto.id}
                className="overflow-hidden rounded-2xl border border-blue-400/20 bg-[#0d1729]"
              >
                <div className="flex h-52 items-center justify-center bg-slate-900 p-4">
                  {imagen ? (
                    <img
                      src={imagen}
                      alt={producto.nombre || "Producto WICU"}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm text-slate-500">
                      Imagen no disponible
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
                      Código #{producto.id}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        producto.activo
                          ? "bg-green-400/10 text-green-300"
                          : "bg-yellow-400/10 text-yellow-300"
                      }`}
                    >
                      {producto.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-white">
                    {producto.nombre || "Producto sin nombre"}
                  </h2>

                  <p className="text-xl font-black text-blue-300">
                    {moneda(producto.precio)}
                  </p>

                  <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-sm">
                    <div>
                      <p className="text-slate-500">Categoría</p>
                      <p className="mt-1 text-slate-200">
                        {producto.categoria || "Sin categoría"}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Existencias</p>
                      <p className="mt-1 text-slate-200">
                        {producto.stock ?? "Sin definir"}
                      </p>
                    </div>
                  </div>

                  <p className="border-t border-white/10 pt-3 text-xs text-slate-400">
                    {producto.destacado
                      ? "Producto destacado"
                      : "Sin destacar"}
                  </p>

                  <button
                    type="button"
                    onClick={() => setProductoEditando(producto)}
                    className="w-full rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 font-bold text-blue-200 transition hover:bg-blue-500/20"
                  >
                    Editar producto
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {creandoProducto && (
        <ProductoNuevoForm
          onClose={() => setCreandoProducto(false)}
          onSaved={(nuevo) => {
            setProductos((actuales) => [nuevo, ...actuales]);
            setCreandoProducto(false);
            setBusqueda("");
          }}
        />
      )}

      {productoEditando && (
        <ProductoEditor
          producto={productoEditando}
          onClose={() => setProductoEditando(null)}
          onSaved={(actualizado) => {
            setProductos((actuales) =>
              actuales.map((producto) =>
                producto.id === productoEditando.id
                  ? { ...producto, ...actualizado }
                  : producto
              )
            );
            setProductoEditando(null);
          }}
        />
      )}
    </section>
  );
}
