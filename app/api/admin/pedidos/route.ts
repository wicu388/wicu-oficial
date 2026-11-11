import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const authClient = await createServerClient();
    const { data: { user }, error: authError } =
      await authClient.auth.getUser();

    if (
      authError ||
      !user ||
      user.id !== process.env.WICU_ADMIN_USER_ID
    ) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secret) {
      return NextResponse.json(
        { error: "Configuración del servidor incompleta." },
        { status: 500 }
      );
    }

    const supabase = createSupabaseClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select(
        "id,created_at,nombre,celular,ciudad,direccion,productos,subtotal,estado,estado_pago"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error al consultar pedidos:", error.message);
      return NextResponse.json(
        { error: "No fue posible consultar los pedidos." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, pedidos });
  } catch {
    return NextResponse.json(
      { error: "Error interno al consultar pedidos." },
      { status: 500 }
    );
  }
}
