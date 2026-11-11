"use client";

import { useEffect, useState } from "react";

type ProductoPedido = {
  id: number | string;
  nombre: string;
  cantidad: number;
  precio_unitario: number | null;
  importe: number | null;
};

type Pedido = {
  id: string;
  created_at: string;
  nombre: string;
  celular: string;
  ciudad: string;
  direccion: string;
  productos: ProductoPedido[];
  subtotal: number;
  estado: string;
  estado_pago: string;
  tiene_reserva_pendiente: boolean;
};

const moneda = (valor: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(valor) || 0);

export default function PedidosPanel() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [accionando, setAccionando] = useState("");

  async function actualizarPedidos() {
    const respuesta = await fetch("/api/admin/pedidos", {
      cache: "no-store",
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.error || "No se pudieron cargar los pedidos."
      );
    }

    setPedidos(resultado.pedidos || []);
  }

  useEffect(() => {
    async function cargar() {
      try {
        await actualizarPedidos();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Error al consultar los pedidos."
        );
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  async function ejecutarAccion(
    pedido: Pedido,
    accion: "confirmar" | "cancelar"
  ) {
    if (accionando) return;

    if (accion === "cancelar") {
      const confirmado = window.confirm(
        "¿Seguro que deseas cancelar este pedido y liberar las unidades reservadas?"
      );

      if (!confirmado) return;
    }

    setAccionando(pedido.id);
    setErrorAccion("");
    setMensaje("");

    try {
      const respuesta = await fetch("/api/admin/pedidos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pedidoId: pedido.id,
          accion,
        }),
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok || !resultado.ok) {
        throw new Error(
          resultado.error || "No fue posible procesar el pedido."
        );
      }

      try {
        await actualizarPedidos();
        setMensaje(
          accion === "confirmar"
            ? "Pedido confirmado. Las unidades reservadas fueron descontadas del inventario."
            : "Pedido cancelado. Las unidades reservadas fueron liberadas."
        );
      } catch {
        setMensaje(
          "La acción se realizó correctamente, pero no se pudo actualizar la lista. Recarga el panel."
        );
      }
    } catch (err) {
      setErrorAccion(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al procesar el pedido."
      );
    } finally {
      setAccionando("");
    }
  }

  return (
    <section className="mt-8">
      {mensaje && (
        <p className="mb-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          {mensaje}
        </p>
      )}

      {errorAccion && (
        <p className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-300">
          {errorAccion}
        </p>
      )}

      {cargando ? (
        <p className="rounded-xl bg-[#0d1729] p-6 text-slate-300">
          Cargando pedidos...
        </p>
      ) : error ? (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-6 text-red-300">
          {error}
        </p>
      ) : pedidos.length === 0 ? (
        <p className="rounded-xl bg-[#0d1729] p-6 text-slate-300">
          Todavía no hay pedidos registrados.
        </p>
      ) : (
        <div className="space-y-5">
          {pedidos.map((pedido) => (
            <article
              key={pedido.id}
              className="rounded-2xl border border-blue-400/20 bg-[#0d1729] p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Pedido
                  </p>
                  <h2 className="mt-1 break-all text-sm font-bold text-white">
                    {pedido.id}
                  </h2>
                  <p className="mt-2 text-xs text-slate-400">
                    {new Date(pedido.created_at).toLocaleString("es-CO")}
                  </p>
                </div>

                <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-sm text-yellow-300">
                  {pedido.estado || "Pendiente"}
                </div>
              </div>

              <div className="grid gap-4 py-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Cliente</p>
                  <p className="mt-1 font-semibold text-white">
                    {pedido.nombre}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {pedido.celular}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Entrega</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {pedido.ciudad}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {pedido.direccion}
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="mb-3 font-bold text-blue-300">
                  Productos solicitados
                </h3>

                <div className="space-y-3">
                  {(pedido.productos || []).map((producto, indice) => (
                    <div
                      key={`${producto.id}-${indice}`}
                      className="flex flex-wrap justify-between gap-2 text-sm"
                    >
                      <span className="text-slate-300">
                        {producto.nombre} × {producto.cantidad}
                      </span>
                      <span className="font-semibold text-white">
                        {moneda(producto.importe ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                <div>
                  <p className="text-xs text-slate-500">Estado del pago</p>
                  <p className="mt-1 text-sm text-slate-300">
                    {pedido.estado_pago || "Pendiente"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500">Subtotal</p>
                  <p className="mt-1 text-xl font-black text-emerald-300">
                    {moneda(pedido.subtotal)}
                  </p>
                </div>
              </div>

              {pedido.estado === "pendiente" &&
                pedido.tiene_reserva_pendiente && (
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={() => ejecutarAccion(pedido, "confirmar")}
                      disabled={accionando !== ""}
                      className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {accionando === pedido.id
                        ? "Procesando..."
                        : "Confirmar pedido"}
                    </button>

                    <button
                      type="button"
                      onClick={() => ejecutarAccion(pedido, "cancelar")}
                      disabled={accionando !== ""}
                      className="rounded-xl border border-red-400/40 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancelar pedido
                    </button>
                  </div>
                )}

              {pedido.estado === "pendiente" &&
                !pedido.tiene_reserva_pendiente && (
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs text-slate-500">
                    Este pedido no tiene una reserva de inventario pendiente.
                    No hay acciones de inventario disponibles.
                  </p>
                )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
