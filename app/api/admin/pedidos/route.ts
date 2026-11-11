import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function verificarAdmin() {
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser();

  if (error || !user || user.id !== process.env.WICU_ADMIN_USER_ID) {
    return null;
  }

  return user;
}

function crearClienteAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function GET() {
  try {
    const user = await verificarAdmin();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    const supabase = crearClienteAdmin();

    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select(
        "id,created_at,nombre,celular,ciudad,direccion,productos,subtotal,estado,estado_pago"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error consultando pedidos:", error.message);
      return NextResponse.json(
        { ok: false, error: "No se pudieron consultar los pedidos." },
        { status: 500 }
      );
    }

    const idsPedidos = (pedidos ?? []).map((pedido) => pedido.id);

    let reservasPendientes: { pedido_id: string }[] = [];

    if (idsPedidos.length > 0) {
      const { data: reservas, error: errorReservas } = await supabase
        .from("reservas_inventario")
        .select("pedido_id")
        .in("pedido_id", idsPedidos)
        .eq("estado", "reservada");

      if (errorReservas) {
        console.error(
          "Error consultando reservas:",
          errorReservas.message
        );
        return NextResponse.json(
          { ok: false, error: "No se pudieron consultar las reservas." },
          { status: 500 }
        );
      }

      reservasPendientes = reservas ?? [];
    }

    const pedidosConReservas = new Set(
      reservasPendientes.map((reserva) => reserva.pedido_id)
    );

    const resultado = (pedidos ?? []).map((pedido) => ({
      ...pedido,
      tiene_reserva_pendiente: pedidosConReservas.has(pedido.id),
    }));

    return NextResponse.json({ ok: true, pedidos: resultado });
  } catch (error) {
    console.error("Error inesperado consultando pedidos:", error);
    return NextResponse.json(
      { ok: false, error: "Ocurrió un error al consultar los pedidos." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await verificarAdmin();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const pedidoId =
      typeof body.pedidoId === "string" ? body.pedidoId : "";
    const accion =
      typeof body.accion === "string" ? body.accion : "";

    const uuidValido =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        pedidoId
      );

    if (!uuidValido || !["confirmar", "cancelar"].includes(accion)) {
      return NextResponse.json(
        { ok: false, error: "La solicitud no es válida." },
        { status: 400 }
      );
    }

    const supabase = crearClienteAdmin();
    const nombreFuncion =
      accion === "confirmar"
        ? "confirmar_pedido_inventario"
        : "cancelar_pedido_inventario";

    const { data, error } = await supabase.rpc(nombreFuncion, {
      p_pedido_id: pedidoId,
    });

    if (error) {
      console.error(`Error al ${accion} pedido:`, error.message);

      const detalle = error.message.toLowerCase();
      const conflicto =
        detalle.includes("pendiente") ||
        detalle.includes("reserva") ||
        detalle.includes("stock") ||
        detalle.includes("inventario") ||
        detalle.includes("existencia");

      return NextResponse.json(
        {
          ok: false,
          error: conflicto
            ? error.message
            : "No fue posible procesar la acción. Revisa el pedido e inténtalo nuevamente.",
        },
        { status: conflicto ? 409 : 500 }
      );
    }

    if (data && typeof data === "object" && "ok" in data && data.ok === false) {
      return NextResponse.json(
        {
          ok: false,
          error: "La operación no pudo completarse para este pedido.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json({
      ok: true,
      accion,
      resultado: data,
    });
  } catch (error) {
    console.error("Error inesperado procesando pedido:", error);
    return NextResponse.json(
      { ok: false, error: "Ocurrió un error al procesar el pedido." },
      { status: 500 }
    );
  }
}
