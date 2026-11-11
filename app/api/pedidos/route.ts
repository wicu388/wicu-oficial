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

      cantidades.set(id, (cantidades.get(id) ?? 0) + cantidad);
    }

    const supabase = createClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const ids = [...cantidades.keys()];

    const { data: productosDB, error: errorProductos } = await supabase
      .from("productos")
      .select("id,nombre,precio,activo,stock")
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
        producto.stock !== null &&
        producto.stock !== undefined &&
        Number(producto.stock) < cantidad
      ) {
        return NextResponse.json(
          { error: `No hay existencias suficientes de ${producto.nombre}.` },
          { status: 409 }
        );
      }

      const precio = precioNumerico(producto.precio);
      const importe = precio === null ? null : precio * cantidad;

      if (importe !== null) subtotal += importe;

      productosPedido.push({
        id: producto.id,
        nombre: producto.nombre,
        cantidad,
        precio_unitario: precio,
        importe,
      });
    }

    const { data: pedido, error: errorPedido } = await supabase
      .from("pedidos")
      .insert({
        nombre,
        celular,
        ciudad,
        direccion,
        productos: productosPedido,
        subtotal,
        estado: "pendiente",
        estado_pago: "pendiente",
      })
      .select("id")
      .single();

    if (errorPedido || !pedido) {
      console.error("Error al registrar pedido:", errorPedido?.message);
      return NextResponse.json(
        { error: "No se pudo registrar el pedido. Inténtalo nuevamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      pedidoId: pedido.id,
      subtotal,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo procesar la solicitud." },
      { status: 400 }
    );
  }
}
