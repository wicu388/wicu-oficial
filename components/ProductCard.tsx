"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  MessageCircle,
  Package,
  Eye,
} from "lucide-react";

type ProductCardProps = {
  id: number | string;
  nombre: string;
  categoria: string;
  precio: string;
  descripcion?: string;
  imagenes: string[];
  destacado?: boolean;
  onAgregar: (id: number | string) => void;
  onConsultar: () => void;
};

export default function ProductCard({
  id,
  nombre,
  categoria,
  precio,
  descripcion,
  imagenes,
  destacado = false,
  onAgregar,
  onConsultar,
}: ProductCardProps) {
  const [indiceImagen, setIndiceImagen] = useState(0);
  const [imagenFallida, setImagenFallida] = useState(false);

  useEffect(() => {
    setIndiceImagen(0);
    setImagenFallida(false);
  }, [id]);

  const imagenActual = imagenes[indiceImagen];

  const manejarErrorImagen = () => {
    if (indiceImagen < imagenes.length - 1) {
      setIndiceImagen((actual) => actual + 1);
    } else {
      setImagenFallida(true);
    }
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-cyan-950/30">
      <Link
        href={`/productos/${encodeURIComponent(String(id))}`}
        className="relative block aspect-[4/5] overflow-hidden bg-slate-900/80"
        aria-label={`Ver detalles de ${nombre}`}
      >
        {imagenActual && !imagenFallida ? (
          <img
            src={imagenActual}
            alt={nombre}
            loading="lazy"
            onError={manejarErrorImagen}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
            <Package size={38} />
            <span className="text-xs">Imagen no disponible</span>
          </div>
        )}

        {destacado && (
          <span className="absolute left-2 top-2 rounded-md border border-cyan-300/30 bg-cyan-950/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
            Destacado
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
          {categoria}
        </p>

        <Link
          href={`/productos/${encodeURIComponent(String(id))}`}
          className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <h3 className="line-clamp-2 min-h-[2.8rem] text-sm font-bold leading-snug text-white transition hover:text-cyan-200 sm:text-base">
            {nombre}
          </h3>
        </Link>

        <p className="mt-2 text-lg font-extrabold text-white sm:text-xl">
          {precio}
        </p>

        {descripcion && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {descripcion}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link
            href={`/productos/${encodeURIComponent(String(id))}`}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-950/40 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-900/60 sm:text-sm"
          >
            <Eye size={16} />
            Ver detalles
          </Link>

          <button
            type="button"
            onClick={() => onAgregar(id)}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-300 sm:text-sm"
          >
            <ShoppingCart size={16} />
            Añadir al carrito
          </button>

          <button
            type="button"
            onClick={onConsultar}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-950/40 sm:text-sm"
          >
            <MessageCircle size={15} />
            Consultar producto
          </button>
        </div>
      </div>
    </article>
  );
}
