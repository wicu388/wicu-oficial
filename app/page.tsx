
"use client";

import ProductCard from "../components/ProductCard";

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
import BrandLogo from "../components/BrandLogo";
import Footer from "../components/Footer";

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

type DatosCliente = {
  nombre: string;
  celular: string;
  ciudad: string;
  direccion: string;
};

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

function ImagenProducto({ producto, portada = false }: { producto: Producto; portada?: boolean }) {
  const imagenes = obtenerImagenes(producto);
  const [indice, setIndice] = useState(0);
  const [fallo, setFallo] = useState(false);

  useEffect(() => {
    setIndice(0);
    setFallo(false);
  }, [producto.id]);

  const imagen = imagenes[indice];

  return (
    <div className={`group/image relative ${portada ? "aspect-[4/5] rounded-lg" : "aspect-[5/4] rounded-xl"} overflow-hidden bg-[#f3f5f8]`}>
      {imagen && !fallo ? (
        <img
          src={imagen}
          alt={nombreProducto(producto)}
          loading="lazy"
          className={`h-full w-full transition-transform duration-300 group-hover/image:scale-105 ${portada ? "scale-110 object-cover p-0 sm:scale-110" : "object-contain p-2 sm:p-4"}`}
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
  const [sugerenciasAbiertas, setSugerenciasAbiertas] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState("Todas");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [menuMovil, setMenuMovil] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [carrito, setCarrito] = useState<Carrito>({});
  const [carritoListo, setCarritoListo] = useState(false);
  const [pedidoEnviando, setPedidoEnviando] = useState(false);
  const [errorPedido, setErrorPedido] = useState("");
  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: "",
    celular: "",
    ciudad: "",
    direccion: "",
  });

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

  const sugerencias = useMemo(() => {
    const consulta = normalizarTexto(busqueda);

    if (consulta.length < 2) return [];

    return productos
      .filter((producto) => {
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

        return texto.includes(consulta);
      })
      .slice(0, 5);
  }, [busqueda, productos]);

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

  async function solicitarPedido() {
    if (pedidoEnviando || productosCarrito.length === 0) return;

    const nombre = datosCliente.nombre.trim();
    const celular = datosCliente.celular.trim();
    const ciudad = datosCliente.ciudad.trim();
    const direccion = datosCliente.direccion.trim();

    if (!nombre || !celular || !ciudad || !direccion) {
      setErrorPedido("Completa los cuatro datos del comprador.");
      return;
    }

    setErrorPedido("");
    const ventana = window.open("about:blank", "_blank");

    setPedidoEnviando(true);

    try {
      const respuesta = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          celular,
          ciudad,
          direccion,
          productos: productosCarrito.map(({ producto, cantidad }) => ({
            id: producto.id,
            cantidad,
          })),
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.pedidoId) {
        throw new Error(resultado.error || "No se pudo registrar el pedido.");
      }

      const lineas = productosCarrito.map(({ producto, cantidad }) => {
        const precio = precioNumerico(producto.precio);
        const importe = precio === null ? null : precio * cantidad;

        return [
          `Producto: ${nombreProducto(producto)}`,
          `Referencia: ${producto.id}`,
          `Cantidad: ${cantidad}`,
          `Precio unitario: ${formatoPrecio(producto.precio)}`,
          `Importe: ${importe === null ? "Pendiente de confirmar" : formatoPrecio(importe)}`,
        ].join("\n");
      });

      const mensaje = [
        "Hola, WICU. Quiero solicitar este pedido:",
        "",
        `REFERENCIA DEL PEDIDO: ${resultado.pedidoId}`,
        "",
        "DATOS DEL COMPRADOR",
        `Nombre: ${nombre}`,
        `Celular: ${celular}`,
        `Ciudad: ${ciudad}`,
        `Dirección de entrega: ${direccion}`,
        "",
        "DETALLE DEL PEDIDO",
        ...lineas.flatMap((linea) => [linea, ""]),
        `Subtotal de precios confirmados: ${formatoPrecio(resultado.subtotal)}`,
        hayPreciosPendientes
          ? "IMPORTANTE: Hay productos cuyo precio está pendiente de confirmación."
          : "",
        "",
        "Por favor, confirmen disponibilidad, envío y total definitivo.",
        "Gracias.",
      ].filter(Boolean).join("\n");

      const destino = enlaceWhatsApp(mensaje);

      if (ventana) {
        ventana.location.href = destino;
      } else {
        window.location.href = destino;
      }
    } catch (error) {
      if (ventana) ventana.close();
      setErrorPedido(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el pedido. Inténtalo nuevamente."
      );
    } finally {
      setPedidoEnviando(false);
    }
  }

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

          <a
              href="#"
              aria-label="WICU, inicio"
              className="group flex shrink-0 items-center"
            >
              <BrandLogo barsVariant="stepped" className="h-[48px] sm:h-[58px]" />
            </a>

          <div className="relative mx-auto hidden max-w-2xl flex-1 md:block">
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-4 transition focus-within:border-cyan-300/70 focus-within:bg-white/[0.07]">
              <button
                type="button"
                onClick={() => {
                  setSugerenciasAbiertas(false);
                  document.getElementById("productos")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                  });
                }}
                aria-label="Ejecutar búsqueda"
                className="shrink-0 text-cyan-200 transition hover:text-white"
              >
                <Search size={18} />
              </button>
              <input
                value={busqueda}
                onChange={(event) => {
                  setBusqueda(event.target.value);
                  setSugerenciasAbiertas(true);
                }}
                onFocus={() => setSugerenciasAbiertas(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setSugerenciasAbiertas(false);
                    document.getElementById("productos")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                placeholder="Busca productos, marcas o categorías"
                aria-label="Buscar productos"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda("");
                    setSugerenciasAbiertas(false);
                  }}
                  aria-label="Limpiar búsqueda"
                  className="text-slate-300 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </label>
{sugerenciasAbiertas && sugerencias.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-cyan-300/25 bg-[#0b1423] shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
                <p className="border-b border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                  Productos sugeridos
                </p>
                {sugerencias.map((producto) => {
                  const imagen = obtenerImagenes(producto)[0];

                  return (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => {
                        setBusqueda(nombreProducto(producto));
                        setSugerenciasAbiertas(false);
                        document.getElementById("productos")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="flex w-full items-center gap-3 border-b border-white/[0.07] px-3 py-2 text-left transition last:border-b-0 hover:bg-cyan-300/[0.08]"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.06]">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Package size={20} className="text-slate-400" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-white">
                          {nombreProducto(producto)}
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-cyan-300">
                          {producto.categoria || "WICU"}
                        </span>
                        <span className="mt-0.5 block text-xs font-extrabold text-slate-200">
                          {formatoPrecio(producto.precio)}
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-cyan-300" />
                    </button>
                  );
                })}
              </div>
            )}
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

        <div className="relative px-3 pb-3 md:hidden">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3">
            <button
              type="button"
              onClick={() => {
                setSugerenciasAbiertas(false);
                document.getElementById("productos")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              aria-label="Ejecutar búsqueda"
              className="shrink-0 text-cyan-200 transition hover:text-white"
            >
              <Search size={17} />
            </button>
            <input
              value={busqueda}
              onChange={(event) => {
                setBusqueda(event.target.value);
                setSugerenciasAbiertas(true);
              }}
              onFocus={() => setSugerenciasAbiertas(true)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    setSugerenciasAbiertas(false);
                    document.getElementById("productos")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              placeholder="Buscar productos..."
              aria-label="Buscar productos"
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => {
                    setBusqueda("");
                    setSugerenciasAbiertas(false);
                  }}
                aria-label="Limpiar búsqueda"
              >
                <X size={16} />
              </button>
            )}
          </label>
{sugerenciasAbiertas && sugerencias.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-cyan-300/25 bg-[#0b1423] shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
                <p className="border-b border-white/10 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300">
                  Productos sugeridos
                </p>
                {sugerencias.map((producto) => {
                  const imagen = obtenerImagenes(producto)[0];

                  return (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => {
                        setBusqueda(nombreProducto(producto));
                        setSugerenciasAbiertas(false);
                        document.getElementById("productos")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                      className="flex w-full items-center gap-3 border-b border-white/[0.07] px-3 py-2 text-left transition last:border-b-0 hover:bg-cyan-300/[0.08]"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/[0.06]">
                        {imagen ? (
                          <img
                            src={imagen}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <Package size={20} className="text-slate-400" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold text-white">
                          {nombreProducto(producto)}
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-cyan-300">
                          {producto.categoria || "WICU"}
                        </span>
                        <span className="mt-0.5 block text-xs font-extrabold text-slate-200">
                          {formatoPrecio(producto.precio)}
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-cyan-300" />
                    </button>
                  );
                })}
              </div>
            )}
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

      <section className="mx-auto max-w-[1600px] px-3 pb-4 pt-3 sm:px-6 sm:pb-6 lg:px-10">
        <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-cyan-200/20 bg-[#060b16] shadow-[0_25px_90px_rgba(0,0,0,0.42)] sm:rounded-[2rem]">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_10%,rgba(34,211,238,0.19),transparent_36%),radial-gradient(ellipse_at_88%_55%,rgba(37,99,235,0.23),transparent_42%),linear-gradient(125deg,#07111f_0%,#0a1222_55%,#080d19_100%)]" />
          <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-64 w-64 rounded-full border border-cyan-200/10 sm:h-96 sm:w-96" />
          <div className="pointer-events-none absolute right-8 top-10 -z-10 h-40 w-40 rounded-full border border-blue-200/[0.09] sm:right-24 sm:top-14 sm:h-64 sm:w-64" />

          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-7 lg:p-7">
            <div className="relative min-w-0">
              <div className="pointer-events-none absolute inset-4 rounded-[2rem] bg-cyan-300/10 blur-3xl" />
              {productos.length > 0 ? (
                <div className="relative grid grid-cols-3 items-stretch gap-2 sm:gap-3">
                  {productos.slice(0, 3).map((producto) => (
                    <a
                      key={producto.id}
                      href="#productos"
                      className="group flex min-h-full min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-cyan-200/40 sm:rounded-2xl sm:p-2.5"
                    >
                      <div className="overflow-hidden rounded-lg bg-white">
                        <ImagenProducto producto={producto} portada />
                      </div>
                      <div className="flex flex-1 flex-col px-0.5 pb-1 pt-2">
                        <h2 className="line-clamp-2 text-[10px] font-extrabold leading-snug text-white sm:text-xs">
                          {nombreProducto(producto)}
                        </h2>
                        <p className="mt-auto break-words pt-2 text-[10px] font-black text-cyan-100 sm:text-sm">
                          {formatoPrecio(producto.precio)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
                  <Package size={30} className="text-cyan-200" />
                  <p className="mt-3 text-sm font-extrabold text-white">
                    {cargando ? "Preparando tu vitrina" : "Estamos preparando el catálogo"}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    {errorCarga || "Descubre los productos WICU en nuestra sección de catálogo."}
                  </p>
                  <a href="#productos" className="mt-3 text-xs font-bold text-cyan-200 hover:text-white">
                    Ir al catálogo <ArrowUpRight size={14} className="inline" />
                  </a>
                </div>
              )}
            </div>

            <div className="relative z-10 lg:py-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-cyan-100/[0.07] px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-cyan-100 sm:text-[10px]">
                <Sparkles size={14} />
                WICU · Descubre algo extraordinario
              </div>

              <h1 className="mt-3 text-3xl font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                Eleva tu mundo.
                <span className="mt-1 block bg-gradient-to-r from-cyan-200 via-sky-300 to-blue-400 bg-clip-text pb-1 text-transparent">
                  Descubre WICU.
                </span>
              </h1>

              <p className="mt-3 max-w-lg text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
                Tecnología, hogar y nuevos favoritos en un solo lugar. Encuentra productos que hacen cada día más extraordinario.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="#productos"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-sky-300 px-4 py-2.5 text-xs font-black text-slate-950 shadow-[0_8px_30px_rgba(34,211,238,0.22)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                >
                  Explorar productos <ArrowUpRight size={16} />
                </a>
                <a
                  href="#categorias"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.045] px-4 py-2.5 text-xs font-bold text-white transition hover:border-cyan-200/40 hover:bg-white/[0.08]"
                >
                  Ver categorías <ChevronRight size={15} />
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-[10px] font-semibold text-slate-300 sm:text-xs">
                <span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-cyan-200" /> Compra con confianza</span>
                <span className="inline-flex items-center gap-2"><Package size={15} className="text-cyan-200" /> {productos.length} productos en catálogo</span>
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
        className="mx-auto max-w-[1600px] scroll-mt-28 px-3 pb-4 sm:px-6 lg:px-10"
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
              <ProductCard
                key={producto.id}
                id={producto.id}
                nombre={nombreProducto(producto)}
                categoria={producto.categoria || "WICU"}
                precio={formatoPrecio(producto.precio)}
                descripcion={
                  producto.descripcion || producto["descripción"]
                    ? String(producto.descripcion || producto["descripción"])
                    : undefined
                }
                imagenes={obtenerImagenes(producto)}
                destacado={producto.destacado === true}
                onAgregar={agregarCarrito}
                onConsultar={() => consultarProducto(producto)}
              />
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
        <div className="relative mx-auto grid max-w-[1600px] gap-3 px-4 py-4 sm:grid-cols-2 sm:px-6 sm:py-5 lg:grid-cols-4 lg:px-10">
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

      <Footer />

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
              <div className="max-h-[55vh] shrink-0 overflow-y-auto border-t border-white/10 bg-[#0e1727] p-4 pb-6 sm:p-5">
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

                <div className="mt-4 rounded-xl border border-cyan-300/20 bg-slate-950/50 p-4">
                  <h3 className="mb-3 text-sm font-black text-cyan-200">
                    Datos para tu pedido
                  </h3>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={datosCliente.nombre}
                      onChange={(e) => setDatosCliente({ ...datosCliente, nombre: e.target.value })}
                      placeholder="Nombre completo"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <input
                      type="tel"
                      value={datosCliente.celular}
                      onChange={(e) => setDatosCliente({ ...datosCliente, celular: e.target.value })}
                      placeholder="Celular de contacto"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <input
                      type="text"
                      value={datosCliente.ciudad}
                      onChange={(e) => setDatosCliente({ ...datosCliente, ciudad: e.target.value })}
                      placeholder="Ciudad"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
                    />
                    <textarea
                      value={datosCliente.direccion}
                      onChange={(e) => setDatosCliente({ ...datosCliente, direccion: e.target.value })}
                      placeholder="Dirección de entrega"
                      rows={2}
                      className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none focus:border-cyan-300"
                    />
                  </div>
                </div>

                {errorPedido && (
                  <p role="alert" className="mt-3 text-sm text-red-300">{errorPedido}</p>
                )}
                <button
                  type="button"
                  onClick={solicitarPedido}
                  disabled={productosCarrito.length === 0 || pedidoEnviando}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <MessageCircle size={18} />
                  {pedidoEnviando ? "Registrando pedido..." : "Solicitar pedido por WhatsApp"}
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
