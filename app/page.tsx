
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  Package,
  Smartphone,
  House,
  Dumbbell,
  PawPrint,
  Shirt,
  Wrench,
  Heart,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Music2,
  Pin,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { siteConfig } from "../lib/siteConfig";

type Producto = {
  id: number | string;
  nombre?: string;
  precio?: number | string | null;
  categoria?: string | null;
  activo?: boolean;
  destacado?: boolean;
  imagen?: string | null;
  imagenes?: string[] | string | null;
  descripción?: string;
  descripcion?: string;
  proveedor?: string;
  etiquetas?: string[] | string;
  [key: string]: unknown;
};

type Carrito = Record<string, number>;

const WHATSAPP = siteConfig.brand.whatsapp;
const STORAGE_KEY = "wicu-cart-v1";

const CATEGORIAS = [
  { nombre: "Todas", icono: Sparkles },
  { nombre: "Tecnología", icono: Smartphone },
  { nombre: "Hogar", icono: House },
  { nombre: "Fitness", icono: Dumbbell },
  { nombre: "Mascotas", icono: PawPrint },
  { nombre: "Moda", icono: Shirt },
  { nombre: "Ferretería", icono: Wrench },
  { nombre: "Lencería", icono: Heart },
  { nombre: "Adultos", icono: Heart },
  { nombre: "Otros", icono: Package },
];

function normalizarTexto(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function obtenerImagenes(producto: Producto): string[] {
  const lista: string[] = [];

  if (typeof producto.imagen === "string" && producto.imagen.trim()) {
    lista.push(producto.imagen.trim());
  }

  if (Array.isArray(producto.imagenes)) {
    for (const imagen of producto.imagenes) {
      if (typeof imagen === "string" && imagen.trim()) {
        lista.push(imagen.trim());
      }
    }
  } else if (typeof producto.imagenes === "string") {
    try {
      const parsed: unknown = JSON.parse(producto.imagenes);
      if (Array.isArray(parsed)) {
        for (const imagen of parsed) {
          if (typeof imagen === "string" && imagen.trim()) {
            lista.push(imagen.trim());
          }
        }
      } else if (producto.imagenes.trim()) {
        lista.push(producto.imagenes.trim());
      }
    } catch {
      if (producto.imagenes.trim()) {
        lista.push(producto.imagenes.trim());
      }
    }
  }

  return [...new Set(lista)].filter(
    (url) =>
      url.startsWith("https://") ||
      url.startsWith("http://") ||
      url.startsWith("/")
  );
}

function precioNumerico(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isFinite(valor) && valor >= 0) {
    return valor;
  }

  if (typeof valor !== "string" || !valor.trim()) return null;

  const limpio = valor.replace(/[^\d,.-]/g, "").trim();
  if (!limpio) return null;

  let numero: number;

  if (limpio.includes(",") && limpio.includes(".")) {
    numero =
      limpio.lastIndexOf(",") > limpio.lastIndexOf(".")
        ? Number(limpio.replace(/\./g, "").replace(",", "."))
        : Number(limpio.replace(/,/g, ""));
  } else if (limpio.includes(",")) {
    numero = Number(limpio.replace(",", "."));
  } else {
    numero = Number(limpio);
  }

  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

function formatoPrecio(valor: unknown): string {
  const numero = precioNumerico(valor);

  if (numero === null) return "Consultar precio";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numero);
}

function nombreProducto(producto: Producto): string {
  return producto.nombre?.trim() || "Producto WICU";
}

function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
}

function ImagenProducto({ producto }: { producto: Producto }) {
  const imagenes = obtenerImagenes(producto);
  const [indice, setIndice] = useState(0);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setIndice(0);
    setFallo(false);
  }, [producto.id]);

  const imagen = imagenes[indice];

  return (
    <div className="group/image relative aspect-[5/4] overflow-hidden rounded-xl bg-[#f3f5f8]">
      {imagen && !fallo ? (
        <img
          src={imagen}
          alt={nombreProducto(producto)}
          loading="lazy"
          className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover/image:scale-105 sm:p-4"
          onError={() => {
            if (indice + 1 < imagenes.length) {
              setIndice((actual) => actual + 1);
            } else {
              setFallo(true);
            }
          }}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
          <Package size={36} strokeWidth={1.3} />
          <span className="px-2 text-center text-[10px] sm:text-xs">
            Imagen no disponible
          </span>
        </div>
      )}

      {producto.destacado === true && (
        <span className="absolute left-2 top-2 rounded-md bg-cyan-300 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-slate-950 sm:left-3 sm:top-3 sm:text-[10px]">
          Destacado
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [menuMovil, setMenuMovil] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carrito, setCarrito] = useState<Carrito>({});
  const [carritoListo, setCarritoListo] = useState(false);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const parsed: unknown = JSON.parse(guardado);

        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const limpio: Carrito = {};

          for (const [id, cantidad] of Object.entries(parsed)) {
            if (
              id &&
              typeof cantidad === "number" &&
              Number.isInteger(cantidad) &&
              cantidad > 0 &&
              cantidad <= 99
            ) {
              limpio[id] = cantidad;
            }
          }

          setCarrito(limpio);
        }
      }
    } catch {
      // El carrito sigue funcionando en memoria.
    }

    setCarritoListo(true);
  }, []);

  useEffect(() => {
    if (!carritoListo) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    } catch {
      // El carrito sigue disponible durante la sesión.
    }
  }, [carrito, carritoListo]);

  async function cargarProductos() {
    setCargando(true);
    setErrorCarga("");

    try {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true)
        .order("id", { ascending: false });

      if (error) throw error;

      setProductos((data ?? []) as Producto[]);
    } catch (error) {
      console.error("Error cargando el catálogo WICU:", error);
      setErrorCarga(
        "No pudimos cargar el catálogo. Comprueba la conexión e inténtalo de nuevo."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarProductos();
  }, []);

  const categoriasDisponibles = useMemo(() => CATEGORIAS, []);

  const filtrados = useMemo(() => {
    const consulta = normalizarTexto(busqueda);

    return productos.filter((producto) => {
      const coincideCategoria =
        categoriaActiva === "Todas" ||
        normalizarTexto(producto.categoria) ===
          normalizarTexto(categoriaActiva);

      const texto = normalizarTexto(
        [
          producto.nombre,
          producto.descripcion,
          producto["descripción"],
          producto.categoria,
          producto.etiquetas,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return coincideCategoria && (!consulta || texto.includes(consulta));
    });
  }, [productos, busqueda, categoriaActiva]);

  const productosCarrito = useMemo(
    () =>
      Object.entries(carrito)
        .map(([id, cantidad]) => {
          const producto = productos.find((item) => String(item.id) === id);
          return producto ? { producto, cantidad } : null;
        })
        .filter(
          (
            item
          ): item is { producto: Producto; cantidad: number } => item !== null
        ),
    [carrito, productos]
  );

  const cantidadCarrito = Object.values(carrito).reduce(
    (total, cantidad) => total + cantidad,
    0
  );

  const subtotal = productosCarrito.reduce((total, item) => {
    const precio = precioNumerico(item.producto.precio);
    return precio === null ? total : total + precio * item.cantidad;
  }, 0);

  const hayPreciosPendientes = productosCarrito.some(
    (item) => precioNumerico(item.producto.precio) === null
  );

  function agregarCarrito(id: number | string) {
    const clave = String(id);

    setCarrito((actual) => ({
      ...actual,
      [clave]: Math.min((actual[clave] ?? 0) + 1, 99),
    }));

    setCarritoAbierto(true);
  }

  function cambiarCantidad(id: number | string, cambio: number) {
    const clave = String(id);

    setCarrito((actual) => {
      const nuevaCantidad = (actual[clave] ?? 0) + cambio;

      if (nuevaCantidad <= 0) {
        const siguiente = { ...actual };
        delete siguiente[clave];
        return siguiente;
      }

      return { ...actual, [clave]: Math.min(nuevaCantidad, 99) };
    });
  }

  function eliminarProducto(id: number | string) {
    const clave = String(id);

    setCarrito((actual) => {
      const siguiente = { ...actual };
      delete siguiente[clave];
      return siguiente;
    });
  }

  function consultarProducto(producto: Producto) {
    const mensaje = [
      "Hola, WICU. Quiero información sobre este producto:",
      nombreProducto(producto),
      `Precio publicado: ${formatoPrecio(producto.precio)}`,
      `Referencia: ${producto.id}`,
      "¿Me pueden confirmar disponibilidad y envío?",
    ].join("\n");

    window.open(enlaceWhatsApp(mensaje), "_blank", "noopener,noreferrer");
  }

  function solicitarPedido() {
    const lineas = productosCarrito.map(({ producto, cantidad }) => {
      return `• ${nombreProducto(producto)} x${cantidad} — ${formatoPrecio(
        producto.precio
      )}`;
    });

    const mensaje = [
      "Hola, WICU. Quiero consultar este pedido:",
      "",
      ...lineas,
      "",
      `Subtotal de precios confirmados: ${formatoPrecio(subtotal)}`,
      hayPreciosPendientes
        ? "Hay productos pendientes de confirmar su precio."
        : "",
      "",
      "Por favor, confirmen disponibilidad, envío y total final.",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(enlaceWhatsApp(mensaje), "_blank", "noopener,noreferrer");
  }

  const redes = [
    {
      nombre: "Facebook",
      href: siteConfig.social.facebook,
      icono: MessageCircle,
    },
    {
      nombre: "Instagram",
      href: siteConfig.social.instagram,
      icono: Heart,
    },
    {
      nombre: "TikTok",
      href: siteConfig.social.tiktok,
      icono: Music2,
    },
    {
      nombre: "Pinterest",
      href: siteConfig.social.pinterest,
      icono: Pin,
    },
    {
      nombre: "YouTube",
      href: siteConfig.social.youtube,
      icono: ArrowUpRight,
    },
    {
      nombre: "WhatsApp",
      href: siteConfig.social.whatsapp,
      icono: MessageCircle,
    },
  ];

  return (
    <main className="wicu-scene relative min-h-screen overflow-x-hidden bg-[#070b14] text-white">
      <div className="wicu-atmosphere" aria-hidden="true">
        <div className="stars" />
        <div className="depth-layer" />
        <div className="grid-lines" />
        <div className="particles" />
      </div>
      <div className="border-b border-cyan-300/20 bg-gradient-to-r from-[#0b1220] via-[#102238] to-[#0b1220] px-3 py-2 text-center text-[10px] font-bold tracking-[0.04em] text-cyan-100 sm:py-2.5 sm:text-xs">
        WICU · {siteConfig.brand.slogan}
      </div>

      <header className="sticky top-0 z-40 border-b border-cyan-200/15 bg-[#070b14]/95 shadow-[0_8px_30px_rgba(0,0,0,0.24)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-2.5 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-10">
          <button
            type="button"
            onClick={() => setMenuMovil(!menuMovil)}
            aria-label={menuMovil ? "Cerrar menú" : "Abrir menú"}
            className="rounded-lg border border-white/10 p-2 md:hidden"
          >
            {menuMovil ? <X size={19} /> : <Menu size={19} />}
          </button>

          <a href="#" className="group flex shrink-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-100/60 bg-gradient-to-br from-white via-cyan-200 to-blue-500 text-xl font-black text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.22)] transition duration-300 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.38)] sm:h-11 sm:w-11 sm:rounded-2xl sm:text-2xl">
              W
            </span>
            <span
              className="relative isolate text-[1.55rem] font-black italic leading-none tracking-[-0.065em] sm:text-4xl"
              style={{
                backgroundImage: "linear-gradient(180deg, #ffffff 0%, #dffaff 16%, #69e7ff 34%, #f8fdff 48%, #399bff 68%, #bcefff 82%, #ffffff 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                WebkitTextStroke: "0.45px rgba(210,248,255,0.85)",
                filter: "drop-shadow(0 1px 0 #236caa) drop-shadow(0 3px 0 #123c70) drop-shadow(0 5px 0 #081c3b) drop-shadow(0 0 9px rgba(34,211,238,0.65)) drop-shadow(0 0 22px rgba(37,99,235,0.35))",
              }}
            >
              WICU<span className="ml-0.5 not-italic text-cyan-200">.</span>
            </span>
          </a>

          <div className="mx-auto hidden max-w-2xl flex-1 md:block">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 transition focus-within:border-cyan-300/70 focus-within:bg-white/[0.07]">
              <Search className="shrink-0 text-cyan-200" size={18} />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Busca productos, marcas o categorías"
                aria-label="Buscar productos"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  aria-label="Limpiar búsqueda"
                  className="text-slate-300 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </label>
          </div>

          <button
            type="button"
            onClick={() => setCarritoAbierto(true)}
            className="relative ml-auto flex shrink-0 items-center gap-2 rounded-xl border border-cyan-300/25 bg-cyan-300/[0.08] px-3 py-2.5 transition hover:border-cyan-200/60 hover:bg-cyan-300/[0.14] sm:px-4"
            aria-label={`Abrir carrito, ${cantidadCarrito} unidades`}
          >
            <ShoppingCart size={19} className="text-cyan-200" />
            <span className="hidden text-sm font-bold sm:inline">Carrito</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1 text-[10px] font-black text-slate-950">
              {cantidadCarrito}
            </span>
          </button>
        </div>

        <div className="px-3 pb-3 md:hidden">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3">
            <Search size={17} className="text-cyan-200" />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </label>
        </div>

        {menuMovil && (
          <nav className="border-t border-white/10 px-3 py-2 md:hidden">
            <a
              href="#categorias"
              onClick={() => setMenuMovil(false)}
              className="block rounded-lg px-3 py-3 text-sm hover:bg-white/5"
            >
              Explorar categorías
            </a>
            <a
              href="#productos"
              onClick={() => setMenuMovil(false)}
              className="block rounded-lg px-3 py-3 text-sm hover:bg-white/5"
            >
              Ver productos
            </a>
          </nav>
        )}
      </header>

      <section className="mx-auto max-w-[1600px] px-3 pb-2 pt-2 sm:px-6 sm:pb-3 sm:pt-3 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-2xl border border-cyan-200/15 bg-[#0b1220] shadow-[0_18px_55px_rgba(0,0,0,0.22)] sm:rounded-3xl">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_20%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(ellipse_at_100%_100%,rgba(37,99,235,0.18),transparent_42%)]" />
          <div className="pointer-events-none absolute right-[-3rem] top-[-5rem] -z-10 h-48 w-48 rounded-full border border-cyan-200/[0.09] sm:right-8 sm:top-[-7rem] sm:h-72 sm:w-72" />
          <div className="pointer-events-none absolute right-[-1rem] top-[-3rem] -z-10 h-36 w-36 rounded-full border border-blue-300/[0.08] sm:right-16 sm:top-[-5rem] sm:h-56 sm:w-56" />

          <div className="grid items-center gap-3 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 lg:grid-cols-[1fr_auto] lg:gap-6 lg:px-8 lg:py-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-200/[0.06] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cyan-200">
                <Sparkles size={13} />
                WICU · Tecnología y estilo
              </div>

              <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                Todo lo que imaginas.
                <span className="block bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  Un mundo por descubrir.
                </span>
              </h1>

              <p className="mt-2 max-w-xl text-xs leading-[1.4rem] text-slate-300 sm:text-sm sm:leading-5">
                Tecnología, hogar, moda y mucho más, en un solo lugar. Explora y encuentra lo que va contigo.
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                <a
                  href="#productos"
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-300 to-sky-300 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.14)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  Explorar productos <ArrowUpRight size={17} />
                </a>
                <a
                  href="#categorias"
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-200/30 hover:bg-white/[0.06]"
                >
                  Ver categorías <ChevronRight size={16} />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-white/[0.12] pt-4 lg:min-w-48 lg:flex-col lg:items-start lg:justify-center lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.07] text-cyan-200 sm:h-12 sm:w-12">
                <Package size={23} />
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  {productos.length}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-300 sm:text-xs">
                  productos en el catálogo
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="categorias"
        className="mx-auto max-w-[1600px] px-3 pb-3 sm:px-6 lg:px-10"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-base font-extrabold sm:text-lg">
            Explora categorías
          </h2>
          <span className="text-[10px] text-slate-300 sm:text-xs">
            {productos.length} productos
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categoriasDisponibles.map((categoria) => {
            const Icono = categoria.icono;
            const activa = categoriaActiva === categoria.nombre;

            return (
              <button
                type="button"
                key={categoria.nombre}
                onClick={() => setCategoriaActiva(categoria.nombre)}
                className={`group flex min-h-[58px] min-w-0 items-center gap-2.5 rounded-xl border px-3 py-3 text-left text-xs font-extrabold transition duration-200 sm:min-h-[66px] sm:gap-3 sm:px-4 sm:text-sm ${
                  activa
                    ? "border-cyan-300/80 bg-gradient-to-br from-cyan-300 to-sky-300 text-slate-950 shadow-[0_6px_22px_rgba(34,211,238,0.12)]"
                    : "border-white/[0.14] bg-gradient-to-br from-[#111b2c] to-[#0b1220] text-slate-200 hover:-translate-y-0.5 hover:border-cyan-200/35 hover:bg-[#142137]"
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  activa ? "bg-slate-950/10" : "bg-cyan-200/[0.07] text-cyan-200 group-hover:bg-cyan-200/[0.12]"
                }`}>
                  <Icono size={18} />
                </span>
                {categoria.nombre}
              </button>
            );
          })}
        </div>
      </section>

      <section
        id="productos"
        className="mx-auto max-w-[1600px] scroll-mt-28 px-3 pb-8 sm:px-6 lg:px-10"
      >
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-[10px]">
              Catálogo WICU
            </p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">
              {busqueda
                ? "Resultados de búsqueda"
                : categoriaActiva === "Todas"
                  ? "Productos para descubrir"
                  : categoriaActiva}
            </h2>
            <p className="mt-1 text-[11px] text-slate-300 sm:text-xs">
              {cargando
                ? "Cargando catálogo..."
                : `${filtrados.length} ${
                    filtrados.length === 1 ? "producto disponible" : "productos disponibles"
                  }`}
            </p>
          </div>

          {(busqueda || categoriaActiva !== "Todas") && (
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setCategoriaActiva("Todas");
              }}
              className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-[10px] font-bold text-slate-300 hover:bg-white/5 sm:text-xs"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {errorCarga && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-300">{errorCarga}</p>
            <button
              type="button"
              onClick={() => void cargarProductos()}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15"
            >
              Reintentar
            </button>
          </div>
        )}

        {cargando ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, indice) => (
              <div
                key={indice}
                className="animate-pulse rounded-xl border border-white/[0.11] bg-[#0c1220] p-2"
              >
                <div className="aspect-square rounded-lg bg-white/[0.07]" />
                <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.08]" />
                <div className="mt-2 h-4 w-4/5 rounded bg-white/[0.08]" />
                <div className="mt-3 h-5 w-1/2 rounded bg-white/[0.08]" />
                <div className="mt-3 h-9 rounded-lg bg-white/[0.06]" />
              </div>
            ))}
          </div>
        ) : filtrados.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filtrados.map((producto) => (
              <article
                key={producto.id}
                className="group relative min-w-0 overflow-hidden rounded-2xl border border-white/[0.14] bg-gradient-to-b from-[#111b2c] to-[#0a101c] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/40 hover:shadow-[0_12px_35px_rgba(8,145,178,0.12)] sm:p-2"
              >
                <ImagenProducto producto={producto} />

                <div className="px-0.5 pb-1 pt-1.5 sm:px-1 sm:pt-2">
                  <p className="truncate text-[9px] font-extrabold uppercase tracking-[0.14em] text-cyan-300 sm:text-[10px]">
                    {producto.categoria || "WICU"}
                  </p>

                  <h3 className="mt-1.5 min-h-10 line-clamp-2 text-[12px] font-bold leading-[1.2rem] text-slate-100 sm:text-sm sm:leading-5">
                    {nombreProducto(producto)}
                  </h3>

                  <p className="mt-1 min-h-6 text-base font-black tracking-tight text-white sm:text-lg">
                    {formatoPrecio(producto.precio)}
                  </p>

                  {(producto.descripcion || producto["descripción"]) && (
                    <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-slate-300">
                      {String(producto.descripcion || producto["descripción"])}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => agregarCarrito(producto.id)}
                    className="mt-2 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-300 px-2 py-1.5 text-[10px] font-extrabold text-slate-950 shadow-[0_4px_16px_rgba(34,211,238,0.10)] transition hover:brightness-110 sm:text-xs"
                  >
                    <ShoppingCart size={14} />
                    Añadir al carrito
                  </button>

                  <button
                    type="button"
                    onClick={() => consultarProducto(producto)}
                    className="mt-1.5 flex min-h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.02] px-2 py-1.5 text-[10px] font-bold text-slate-300 transition hover:border-cyan-200/40 hover:bg-cyan-200/[0.04] hover:text-cyan-200 sm:text-[11px]"
                  >
                    <MessageCircle size={13} />
                    Consultar
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
              {errorCarga ? <Package size={27} /> : <Search size={27} />}
            </div>
            <h3 className="mt-4 text-base font-extrabold sm:text-lg">
              {errorCarga
                ? "No se pudo cargar el catálogo"
                : productos.length === 0
                  ? "El catálogo todavía está vacío"
                  : "No encontramos resultados"}
            </h3>
            <p className="mt-2 max-w-md text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              {errorCarga
                ? "Revisa la conexión de la tienda e inténtalo de nuevo."
                : productos.length === 0
                  ? "Los productos activos de Supabase aparecerán aquí con sus fotografías y precios. No mostramos productos ficticios."
                  : "Prueba otra búsqueda o selecciona una categoría diferente."}
            </p>

            {productos.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda("");
                  setCategoriaActiva("Todas");
                }}
                className="mt-4 rounded-lg bg-cyan-300 px-4 py-2.5 text-xs font-extrabold text-slate-950 hover:bg-cyan-200"
              >
                Ver todos los productos
              </button>
            )}

            {errorCarga && (
              <button
                type="button"
                onClick={() => void cargarProductos()}
                className="mt-4 rounded-lg border border-white/15 px-4 py-2.5 text-xs font-bold hover:bg-white/5"
              >
                Volver a intentar
              </button>
            )}
          </div>
        )}
      </section>

      <section className="relative overflow-hidden border-y border-cyan-200/10 bg-gradient-to-br from-[#0b1424] via-[#0a101c] to-[#101a30]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.08),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-3 px-4 py-6 sm:grid-cols-2 sm:px-6 sm:py-8 lg:grid-cols-4 lg:px-10">
          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.025] p-4 transition-colors hover:border-cyan-200/20">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-200">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-white">Atención directa</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-300">
              Resuelve tus dudas y consulta disponibilidad con nuestro canal de WhatsApp.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.025] p-4 transition-colors hover:border-cyan-200/20">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-200">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-white">Compra informada</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-300">
              Verifica precio, disponibilidad, envío y condiciones antes de confirmar.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.025] p-4 transition-colors hover:border-cyan-200/20">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-200">
              <Sparkles size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-white">Tecnología WICU</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-300">
              Base preparada para asistentes inteligentes y automatización continua 24/7.
            </p>
            <span className="mt-3 inline-flex rounded-full border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-1 text-[10px] font-bold text-amber-200">
              En desarrollo
            </span>
          </div>

          <div className="rounded-2xl border border-white/[0.12] bg-white/[0.025] p-4 transition-colors hover:border-cyan-200/20">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/20 bg-cyan-300/[0.08] text-cyan-200">
              <Package size={20} />
            </div>
            <h3 className="text-sm font-extrabold text-white">Medios de pago previstos</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { nombre: "Wompi", color: "text-purple-300", fondo: "bg-purple-400/10" },
                { nombre: "PayPal", color: "text-sky-300", fondo: "bg-sky-400/10" },
                { nombre: "Nequi", color: "text-pink-300", fondo: "bg-pink-400/10" },
                { nombre: "Mercado Pago", color: "text-blue-300", fondo: "bg-blue-400/10" },
              ].map((medio) => (
                <div
                  key={medio.nombre}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-2.5 py-2"
                >
                  <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-base font-black ${medio.color} ${medio.fondo}`}>
                    {medio.nombre === "Mercado Pago" ? "M" : medio.nombre[0]}
                  </span>
                  <span className="text-[11px] font-bold text-slate-100">
                    {medio.nombre}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-4 text-amber-200/80">
              Referencias visuales. Integración y pruebas pendientes.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1600px] px-4 pb-6 pt-7 sm:px-6 sm:pt-9 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200/40 bg-gradient-to-br from-cyan-200 to-blue-500 text-xl font-black text-slate-950">
              W
            </span>
            <span>
              <span className="block text-xl font-black">
                WICU<span className="text-cyan-300">.</span>
              </span>
              <span className="mt-0.5 block text-xs text-slate-200 sm:text-sm">
                {siteConfig.brand.slogan}
              </span>
            </span>
          </a>

          <div className="flex flex-wrap gap-x-4 gap-y-3 text-sm font-semibold text-slate-300">
            <a href="#categorias" className="hover:text-cyan-200">
              Categorías
            </a>
            <a href="#productos" className="hover:text-cyan-200">
              Productos
            </a>
            <a
              href={`mailto:${siteConfig.brand.email}`}
              className="inline-flex items-center gap-1.5 hover:text-cyan-200"
            >
              <Mail size={14} />
              Contacto
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-200 sm:text-sm">
            Síguenos en nuestras redes
          </p>

          <div className="flex flex-wrap gap-2">
            {redes.map((red) => {
              const Icono = red.icono;

              return (
                <a
                  key={red.nombre}
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.nombre}
                  title={red.nombre}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-cyan-200/35 hover:bg-cyan-300/[0.08] hover:text-cyan-100"
                >
                  <Icono size={15} />
                  <span>{red.nombre}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-white/[0.11] pt-4 text-center text-[10px] text-slate-400 sm:flex-row sm:justify-center">
          <p className="font-extrabold uppercase tracking-wider text-slate-300">
            © {new Date().getFullYear()} WICU · TODOS LOS DERECHOS RESERVADOS
          </p>
          <p>Precios, disponibilidad y envío sujetos a confirmación.</p>
        </div>
      </footer>

      {carritoAbierto && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <button
            type="button"
            aria-label="Cerrar carrito"
            onClick={() => setCarritoAbierto(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-carrito"
            className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0b1220] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <h2 id="titulo-carrito" className="text-xl font-black">
                  Mi carrito
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  {cantidadCarrito}{" "}
                  {cantidadCarrito === 1
                    ? "unidad seleccionada"
                    : "unidades seleccionadas"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCarritoAbierto(false)}
                aria-label="Cerrar carrito"
                className="rounded-xl border border-white/10 p-2.5 hover:bg-white/5"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              {cantidadCarrito === 0 ? (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.05] text-slate-300">
                    <ShoppingCart size={28} />
                  </div>
                  <h3 className="mt-5 font-bold">Tu carrito está vacío</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    Explora el catálogo y añade los productos que te interesan.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCarritoAbierto(false)}
                    className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200"
                  >
                    Seguir explorando
                  </button>
                </div>
              ) : productosCarrito.length === 0 ? (
                <p className="py-10 text-center text-sm leading-6 text-slate-300">
                  Estamos cargando los detalles de los productos seleccionados.
                  Comprueba que sigan activos en el catálogo.
                </p>
              ) : (
                <div className="space-y-3">
                  {productosCarrito.map(({ producto, cantidad }) => {
                    const imagen = obtenerImagenes(producto)[0];

                    return (
                      <div
                        key={producto.id}
                        className="flex gap-3 rounded-xl border border-white/[0.12] bg-white/[0.025] p-3"
                      >
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f3f5f8] sm:h-24 sm:w-24">
                          {imagen ? (
                            <img
                              src={imagen}
                              alt={nombreProducto(producto)}
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <Package className="text-slate-300" size={26} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-2 text-sm font-bold">
                            {nombreProducto(producto)}
                          </h3>
                          <p className="mt-1 text-sm font-black text-cyan-200">
                            {formatoPrecio(producto.precio)}
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 rounded-lg border border-white/10 px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() => cambiarCantidad(producto.id, -1)}
                                aria-label={`Reducir cantidad de ${nombreProducto(producto)}`}
                                className="text-slate-300 hover:text-white"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="min-w-4 text-center text-xs font-bold">
                                {cantidad}
                              </span>
                              <button
                                type="button"
                                onClick={() => cambiarCantidad(producto.id, 1)}
                                aria-label={`Aumentar cantidad de ${nombreProducto(producto)}`}
                                className="text-slate-300 hover:text-white"
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => eliminarProducto(producto.id)}
                              aria-label={`Eliminar ${nombreProducto(producto)}`}
                              className="rounded-lg p-2 text-slate-400 hover:bg-red-400/10 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cantidadCarrito > 0 && (
              <div className="border-t border-white/10 bg-[#0e1727] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-300 sm:text-sm">
                    Subtotal de precios confirmados
                  </span>
                  <span className="text-lg font-black">
                    {formatoPrecio(subtotal)}
                  </span>
                </div>

                {hayPreciosPendientes && (
                  <p className="mt-2 text-xs leading-5 text-amber-300">
                    Algunos productos no tienen precio confirmado. El total
                    final debe verificarse con WICU.
                  </p>
                )}

                <p className="mt-2 text-[10px] leading-5 text-slate-300 sm:text-xs">
                  El envío y el total definitivo se confirman antes de la compra.
                  Este paso no procesa pagos.
                </p>

                <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.025] p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-300">
                    Medios de pago previstos
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {["Wompi", "PayPal", "Nequi", "Mercado Pago"].map((medio) => (
                      <span
                        key={medio}
                        className="flex min-h-9 items-center justify-center rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-center text-xs font-bold text-slate-100"
                      >
                        {medio}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-amber-200/80">
                    Pendientes de integración y pruebas. El pedido se solicita por WhatsApp; aquí no se realizan cobros.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={solicitarPedido}
                  disabled={productosCarrito.length === 0}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MessageCircle size={18} />
                  Solicitar pedido por WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() => setCarrito({})}
                  className="mt-2 w-full rounded-xl border border-white/10 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
