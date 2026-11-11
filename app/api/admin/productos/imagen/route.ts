import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const TIPOS_PERMITIDOS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");

    if (origin) {
      let originHost = "";

      try {
        originHost = new URL(origin).host.toLowerCase();
      } catch {
        return NextResponse.json(
          { error: "Origen no autorizado." },
          { status: 403 }
        );
      }

      const hosts = [
        request.headers.get("host"),
        request.headers.get("x-forwarded-host"),
        new URL(request.url).host,
      ]
        .filter(Boolean)
        .flatMap((value) => value!.split(","))
        .map((value) => value.trim().toLowerCase());

      if (!hosts.includes(originHost)) {
        return NextResponse.json(
          { error: "Origen no autorizado." },
          { status: 403 }
        );
      }
    }

    const authClient = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

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

    const formData = await request.formData();
    const archivo = formData.get("imagen");

    if (!(archivo instanceof File)) {
      return NextResponse.json(
        { error: "Selecciona una fotografía." },
        { status: 400 }
      );
    }

    if (archivo.size === 0 || archivo.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La imagen debe pesar más de 0 y máximo 5 MB." },
        { status: 400 }
      );
    }

    const extension = TIPOS_PERMITIDOS[archivo.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Formato no permitido. Utiliza JPG, PNG o WebP." },
        { status: 400 }
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

    const ruta = `catalogo/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("productos")
      .upload(ruta, archivo, {
        contentType: archivo.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error al subir imagen:", uploadError.message);
      return NextResponse.json(
        { error: "No fue posible guardar la fotografía." },
        { status: 500 }
      );
    }

    const { data } = supabase.storage
      .from("productos")
      .getPublicUrl(ruta);

    return NextResponse.json({
      ok: true,
      imagen: data.publicUrl,
    });
  } catch {
    return NextResponse.json(
      { error: "Error interno al procesar la fotografía." },
      { status: 400 }
    );
  }
}
