import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ItemEntrada = {
  id: number | string;
  cantidad: number;
};

type DatosEntrada = {
  nombre: string;
  celular: string;
  ciudad: string;
  direccion: string;
  productos: ItemEntrada[];
};

type ResultadoReserva = {
  ok?: boolean;
  pedidoId?: string;
  subtotal?: number;
};

function precioNumerico(valor: unknown): number | null {
  if (typeof valor === "number") {
    return Number.isFinite(valor) && valor >= 0 ? valor : null;
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

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secret) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as DatosEntrada;

    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const celular = typeof body.celular === "string" ? body.celular.trim() : "";
    const ciudad = typeof body.ciudad === "string" ? body.ciudad.trim() : "";
    const direccion =
      typeof body.direccion === "string" ? body.direccion.trim() : "";

    if (
      !nombre || nombre.length > 120 ||
      !celular || celular.length > 30 ||
      !ciudad || ciudad.length > 120 ||
      !direccion || direccion.length > 250
    ) {
      return NextResponse.json(
        { error: "Revisa los datos del comprador." },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(body.productos) ||
      body.productos.length === 0 ||
      body.productos.length > 50
    ) {
      return NextResponse.json(
        { error: "El carrito no contiene productos válidos." },
        { status: 400 }
      );
    }

    const cantidades = new Map<number, number>();

    for (const item of body.productos) {
      const id = Number(item.id);
      const cantidad = item.cantidad;

      if (
        !Number.isSafeInteger(id) || id <= 0 ||
        !Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99
      ) {
        return NextResponse.json(
          { error: "Hay productos o cantidades no válidas." },
          { status: 400 }
        );
      }

      const total = (cantidades.get(id) ?? 0) + cantidad;

      if (total > 99) {
        return NextResponse.json(
          { error: "La cantidad máxima por producto es 99." },
          { status: 400 }
        );
      }

      cantidades.set(id, total);
    }

    const supabase = createClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const ids = [...cantidades.keys()];

    const { data: productosDB, error: errorProductos } = await supabase
      .from("productos")
      .select("id,nombre,precio,activo,origen")
      .in("id", ids);

    if (errorProductos || !productosDB || productosDB.length !== ids.length) {
      return NextResponse.json(
        { error: "No fue posible verificar todos los productos." },
        { status: 400 }
      );
    }

    let subtotal = 0;

    const productosPedido = [];

    for (const producto of productosDB) {
      const cantidad = cantidades.get(Number(producto.id)) ?? 0;

      if (!producto.activo || cantidad < 1) {
        return NextResponse.json(
          { error: "Uno de los productos ya no está disponible." },
          { status: 409 }
        );
      }

      if (
        !["propio", "dropshipping", "tercero"].includes(
          producto.origen ?? ""
        )
      ) {
        return NextResponse.json(
          {
            error:
              `El origen de ${producto.nombre} todavía no está definido.`,
          },
          { status: 409 }
        );
      }

      const precio = precioNumerico(producto.precio);

      if (precio === null) {
        return NextResponse.json(
          { error: `El precio de ${producto.nombre} no es válido.` },
          { status: 409 }
        );
      }

      const importe = precio * cantidad;
      subtotal += importe;

      productosPedido.push({
        id: producto.id,
        nombre: producto.nombre,
        cantidad,
        precio_unitario: precio,
        importe,
      });
    }

    // La función SQL registra el pedido y reserva el inventario
    // dentro de una sola transacción.
    const { data, error } = await supabase.rpc(
      "crear_pedido_con_reserva",
      {
        p_nombre: nombre,
        p_celular: celular,
        p_ciudad: ciudad,
        p_direccion: direccion,
        p_productos: productosPedido,
        p_subtotal: subtotal,
      }
    );

    if (error) {
      console.error("Error al registrar pedido con reserva:", error.message);

      const mensaje = error.message.toLowerCase();

      if (
        mensaje.includes("existencias") ||
        mensaje.includes("inventario") ||
        mensaje.includes("disponible") ||
        mensaje.includes("origen")
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "No se pudo registrar el pedido. Inténtalo nuevamente." },
        { status: 500 }
      );
    }

    const resultado = data as ResultadoReserva | null;

    if (!resultado?.ok || !resultado.pedidoId) {
      return NextResponse.json(
        { error: "No se recibió una confirmación válida del pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      pedidoId: resultado.pedidoId,
      subtotal: resultado.subtotal ?? subtotal,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud." },
      { status: 400 }
    );
  }
}
