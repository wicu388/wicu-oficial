"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ShoppingCart,
  MessageCircle,
  Package,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import { siteConfig } from "../../../lib/siteConfig";

type Producto = {
  id: number | string;
  nombre?: string;
  precio?: number | string | null;
  categoria?: string | null;
  imagen?: string | null;
  imagenes?: string[] | string | null;
  descripcion?: string;
  descripción?: string;
  destacado?: boolean;
  [key: string]: unknown;
};

const STORAGE_KEY = "wicu-cart-v1";

function obtenerImagenes(producto: Producto): string[] {
  const lista: string[] = [];

  if (typeof producto.imagen === "string" && producto.imagen.trim()) {
    lista.push(producto.imagen.trim());
  }

  if (Array.isArray(producto.imagenes)) {
    lista.push(
      ...producto.imagenes.filter(
        (imagen): imagen is string =>
          typeof imagen === "string" && imagen.trim() !== ""
      )
    );
  } else if (typeof producto.imagenes === "string") {
    try {
      const datos: unknown = JSON.parse(producto.imagenes);
      if (Array.isArray(datos)) {
        lista.push(
          ...datos.filter(
            (imagen): imagen is string =>
              typeof imagen === "string" && imagen.trim() !== ""
          )
        );
      } else {
        lista.push(producto.imagenes);
      }
    } catch {
      lista.push(producto.imagenes);
    }
  }

  return [...new Set(lista)].filter(
    (url) =>
      url.startsWith("https://") ||
      url.startsWith("http://") ||
      url.startsWith("/")
  );
}

function formatoPrecio(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") {
    return "Consultar precio";
  }

  let numero: number;

  if (typeof valor === "number") {
    numero = valor;
  } else {
    const limpio = String(valor).replace(/[^\d,.-]/g, "");

    if (!limpio) return "Consultar precio";

    if (limpio.includes(",") && limpio.includes(".")) {
      numero =
        limpio.lastIndexOf(",") > limpio.lastIndexOf(".")
          ? Number(limpio.replace(/\./g, "").replace(",", "."))
          : Number(limpio.replace(/,/g, ""));
    } else {
      numero = Number(limpio.replace(",", "."));
    }
  }

  if (!Number.isFinite(numero) || numero < 0) {
    return "Consultar precio";
  }

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numero);
}

export default function FichaProducto() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [imagenActiva, setImagenActiva] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    let activo = true;

    async function cargarProducto() {
      setCargando(true);
      setError("");

      const { data, error: errorConsulta } = await supabase
        .from("productos")
        .select("*")
        .eq("id", id)
        .eq("activo", true)
        .maybeSingle();

      if (!activo) return;

      if (errorConsulta || !data) {
        setError("No encontramos este producto o ya no está disponible.");
        setProducto(null);
      } else {
        setProducto(data as Producto);
      }

      setCargando(false);
    }

    void cargarProducto();

    return () => {
      activo = false;
    };
  }, [id]);

  function agregarAlCarrito() {
    if (!producto) return;

    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      const datos: unknown = guardado ? JSON.parse(guardado) : {};
      const carrito =
        datos && typeof datos === "object" && !Array.isArray(datos)
          ? (datos as Record<string, unknown>)
          : {};

      const cantidadActual = Number(carrito[String(producto.id)]) || 0;

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...carrito,
          [String(producto.id)]: Math.min(cantidadActual + cantidad, 99),
        })
      );

      setAgregado(true);
    } catch {
      setError("No pudimos guardar el producto en el carrito. Inténtalo de nuevo.");
    }
  }

  function consultarPorWhatsApp() {
    if (!producto) return;

    const nombre = producto.nombre?.trim() || "Producto WICU";
    const numero = String(siteConfig.brand.whatsapp).replace(/\D/g, "");

    const mensaje = [
      "Hola, WICU. Quiero información sobre este producto:",
      nombre,
      `Precio publicado: ${formatoPrecio(producto.precio)}`,
      `Referencia: ${producto.id}`,
      "¿Me pueden confirmar disponibilidad y envío?",
    ].join("\n");

    window.open(
      `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  if (cargando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050914] px-5 text-center text-cyan-200">
        Cargando producto...
      </main>
    );
  }

  if (error && !producto) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#050914] px-5 text-center text-white">
        <Package size={48} className="text-cyan-300" />
        <h1 className="text-xl font-bold">{error}</h1>
        <Link
          href="/"
          className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Volver al catálogo
        </Link>
      </main>
    );
  }

  if (!producto) return null;

  const imagenes = obtenerImagenes(producto);
  const descripcion =
    producto.descripcion || producto["descripción"];
  const nombre = producto.nombre?.trim() || "Producto WICU";

  return (
    <main className="min-h-screen bg-[#050914] px-4 py-6 text-white sm:px-8 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Volver al catálogo
        </Link>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <section>
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 p-4">
              {imagenes.length > 0 ? (
                <img
                  src={imagenes[imagenActiva]}
                  alt={nombre}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Package size={60} />
                  Imagen no disponible
                </div>
              )}
            </div>

            {imagenes.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {imagenes.map((imagen, indice) => (
                  <button
                    key={`${imagen}-${indice}`}
                    type="button"
                    onClick={() => setImagenActiva(indice)}
                    aria-label={`Ver fotografía ${indice + 1}`}
                    className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-slate-900 p-1 ${
                      imagenActiva === indice
                        ? "border-cyan-300"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={imagen}
                      alt={`${nombre}, fotografía ${indice + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="flex flex-col justify-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              {producto.categoria || "WICU"}
            </p>

            <h1 className="text-3xl font-black leading-tight sm:text-4xl">
              {nombre}
            </h1>

            {producto.destacado === true && (
              <span className="mt-4 w-fit rounded-lg border border-cyan-300/30 bg-cyan-950/50 px-3 py-1 text-xs font-bold text-cyan-200">
                Destacado
              </span>
            )}

            <p className="mt-6 text-3xl font-black text-white">
              {formatoPrecio(producto.precio)}
            </p>

            <div className="my-7 border-t border-white/10" />

            <h2 className="mb-3 text-lg font-bold">Descripción del producto</h2>

            <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
              {typeof descripcion === "string" && descripcion.trim()
                ? descripcion
                : "Consulta con WICU para recibir más información sobre este producto."}
            </p>

            <div className="mt-8 flex items-center gap-4">
              <span className="text-sm font-semibold text-slate-300">
                Cantidad
              </span>

              <div className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/[0.04] p-2">
                <button
                  type="button"
                  onClick={() => setCantidad((actual) => Math.max(1, actual - 1))}
                  aria-label="Disminuir cantidad"
                  className="rounded-lg p-1 hover:bg-white/10"
                >
                  <Minus size={18} />
                </button>

                <span className="min-w-5 text-center font-bold">
                  {cantidad}
                </span>

                <button
                  type="button"
                  onClick={() => setCantidad((actual) => Math.min(99, actual + 1))}
                  aria-label="Aumentar cantidad"
                  className="rounded-lg p-1 hover:bg-white/10"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={agregarAlCarrito}
              className="mt-7 flex min-h-14 items-center justify-center gap-3 rounded-xl bg-cyan-400 px-5 py-3 font-extrabold text-slate-950 transition hover:bg-cyan-300"
            >
              {agregado ? <Check size={20} /> : <ShoppingCart size={20} />}
              {agregado ? "Producto añadido al carrito" : "Añadir al carrito"}
            </button>

            <button
              type="button"
              onClick={consultarPorWhatsApp}
              className="mt-3 flex min-h-14 items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 font-bold text-white transition hover:border-cyan-300/40 hover:bg-cyan-950/40"
            >
              <MessageCircle size={20} />
              Consultar por WhatsApp
            </button>

            {error && (
              <p className="mt-3 text-sm text-red-300">{error}</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
