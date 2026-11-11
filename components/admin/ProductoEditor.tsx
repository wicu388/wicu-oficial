"use client";

import { useState } from "react";

type Producto = {
  id: number;
  nombre: string | null;
  precio: string | number | null;
  categoria: string | null;
  descripcion: string | null;
  stock: number | null;
  activo: boolean | null;
  destacado: boolean | null;
};

type Props = {
  producto: Producto;
  onClose: () => void;
  onSaved: (producto: Partial<Producto>) => void;
};

export default function ProductoEditor({
  producto,
  onClose,
  onSaved,
}: Props) {
  const [nombre, setNombre] = useState(producto.nombre || "");
  const [precio, setPrecio] = useState(String(producto.precio ?? ""));
  const [categoria, setCategoria] = useState(producto.categoria || "");
  const [descripcion, setDescripcion] = useState(producto.descripcion || "");
  const [stock, setStock] = useState(
    producto.stock === null ? "" : String(producto.stock)
  );
  const [activo, setActivo] = useState(Boolean(producto.activo));
  const [destacado, setDestacado] = useState(Boolean(producto.destacado));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  async function guardar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");

    if (!nombre.trim() || !precio.trim() || !categoria.trim()) {
      setError("Completa el nombre, el precio y la categoría.");
      return;
    }

    const cambios: Record<string, string | number | boolean | null> = {
      nombre: nombre.trim(),
      precio: Number(precio),
      categoria: categoria.trim(),
      descripcion: descripcion.trim() || null,
      activo,
      destacado,
    };

    if (stock.trim() !== "") {
      const existencias = Number(stock);
      if (!Number.isInteger(existencias) || existencias < 0) {
        setError("Las existencias deben ser un entero igual o mayor que cero.");
        return;
      }
      cambios.stock = existencias;
    }

    setGuardando(true);

    try {
      const respuesta = await fetch("/api/admin/productos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: producto.id, ...cambios }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(resultado.error || "No se pudieron guardar los cambios.");
      }

      onSaved(resultado.producto);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el producto."
      );
    } finally {
      setGuardando(false);
    }
  }

  const campo =
    "w-full rounded-xl border border-white/10 bg-[#0d1729] px-3 py-3 text-white outline-none focus:border-blue-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/80 p-4">
      <form
        onSubmit={guardar}
        className="my-auto w-full max-w-2xl space-y-5 rounded-2xl border border-blue-400/30 bg-[#101c30] p-5 shadow-2xl sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
              Administración WICU
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Editar producto #{producto.id}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-lg border border-white/10 px-3 py-2 text-slate-300 hover:bg-white/10"
          >
            Cerrar
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-300">
            Nombre del producto
            <input
              className={campo}
              value={nombre}
              maxLength={180}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Precio en pesos colombianos
            <input
              className={campo}
              type="number"
              min="0"
              step="1"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Categoría
            <input
              className={campo}
              value={categoria}
              maxLength={80}
              onChange={(e) => setCategoria(e.target.value)}
              required
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300">
            Existencias
            <input
              className={campo}
              type="number"
              min="0"
              step="1"
              placeholder="Dejar vacío para no modificar"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </label>
        </div>

        <label className="block space-y-2 text-sm text-slate-300">
          Descripción
          <textarea
            className={campo}
            rows={4}
            maxLength={5000}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-6 border-t border-white/10 pt-4">
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="h-4 w-4 accent-green-500"
            />
            Producto activo
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
              className="h-4 w-4 accent-blue-500"
            />
            Producto destacado
          </label>
        </div>

        {error && (
          <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-slate-300 hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="rounded-xl bg-blue-500 px-6 py-3 font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
