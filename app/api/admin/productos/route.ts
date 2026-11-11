import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET() {
  try {
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

    const { data: productos, error } = await supabase
      .from("productos")
      .select(
        "id,created_at,nombre,precio,categoria,activo,destacado,stock,imagen,imagenes,descripcion,proveedor,origen,tags,rating,ventas"
      )
      .order("id", { ascending: false });

    if (error) {
      console.error("Error al consultar productos:", error.message);
      return NextResponse.json(
        { error: "No fue posible consultar los productos." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, productos });
  } catch {
    return NextResponse.json(
      { error: "Error interno al consultar productos." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const origin = request.headers.get("origin");

    if (origin) {
      let originHost = "";

      try {
        originHost = new URL(origin).host.toLowerCase();
      } catch {
        return NextResponse.json(
          { error: "Origen de solicitud no autorizado." },
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
          { error: "Origen de solicitud no autorizado." },
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

    const body = await request.json();
    const { id, ...cambios } = body;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Código de producto inválido." },
        { status: 400 }
      );
    }

    const permitidos = [
      "nombre",
      "precio",
      "categoria",
      "descripcion",
      "stock",
      "activo",
      "destacado",
    ];

    const campos = Object.keys(cambios);

    if (
      campos.length === 0 ||
      campos.some((campo) => !permitidos.includes(campo))
    ) {
      return NextResponse.json(
        { error: "Los campos enviados no son válidos." },
        { status: 400 }
      );
    }

    const actualizacion: Record<string, string | number | boolean | null> = {};

    if ("nombre" in cambios) {
      if (
        typeof cambios.nombre !== "string" ||
        !cambios.nombre.trim() ||
        cambios.nombre.trim().length > 180
      ) {
        return NextResponse.json(
          { error: "El nombre debe tener entre 1 y 180 caracteres." },
          { status: 400 }
        );
      }
      actualizacion.nombre = cambios.nombre.trim();
    }

    if ("precio" in cambios) {
      const precio = Number(cambios.precio);

      if (
        cambios.precio === "" ||
        !Number.isFinite(precio) ||
        precio < 0
      ) {
        return NextResponse.json(
          { error: "El precio debe ser un número válido no negativo." },
          { status: 400 }
        );
      }
      actualizacion.precio = precio;
    }

    if ("categoria" in cambios) {
      if (
        typeof cambios.categoria !== "string" ||
        !cambios.categoria.trim() ||
        cambios.categoria.trim().length > 80
      ) {
        return NextResponse.json(
          { error: "La categoría no es válida." },
          { status: 400 }
        );
      }
      actualizacion.categoria = cambios.categoria.trim();
    }

    if ("descripcion" in cambios) {
      if (
        cambios.descripcion !== null &&
        (typeof cambios.descripcion !== "string" ||
          cambios.descripcion.length > 5000)
      ) {
        return NextResponse.json(
          { error: "La descripción no es válida." },
          { status: 400 }
        );
      }
      actualizacion.descripcion = cambios.descripcion;
    }

    if ("stock" in cambios) {
      if (
        !Number.isInteger(cambios.stock) ||
        cambios.stock < 0
      ) {
        return NextResponse.json(
          { error: "Las existencias deben ser un entero igual o mayor que cero." },
          { status: 400 }
        );
      }
      actualizacion.stock = cambios.stock;
    }

    for (const campo of ["activo", "destacado"]) {
      if (campo in cambios) {
        if (typeof cambios[campo] !== "boolean") {
          return NextResponse.json(
            { error: `El campo ${campo} debe ser verdadero o falso.` },
            { status: 400 }
          );
        }
        actualizacion[campo] = cambios[campo];
      }
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

    const { data: producto, error } = await supabase
      .from("productos")
      .update(actualizacion)
      .eq("id", id)
      .select(
        "id,nombre,precio,categoria,activo,destacado,stock,descripcion"
      )
      .single();

    if (error) {
      console.error("Error al actualizar producto:", error.message);
      return NextResponse.json(
        { error: "No fue posible guardar los cambios." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, producto });
  } catch {
    return NextResponse.json(
      { error: "Solicitud inválida o error interno." },
      { status: 400 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");

    if (origin) {
      let originHost = "";
      try {
        originHost = new URL(origin).host.toLowerCase();
      } catch {
        return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
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
        return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
      }
    }

    const authClient = await createServerClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user || user.id !== process.env.WICU_ADMIN_USER_ID) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, precio, categoria, descripcion, stock, activo, destacado,
      origen: tipoOrigen, proveedor, imagen } = body;

    if (typeof nombre !== "string" || !nombre.trim() || nombre.trim().length > 180) {
      return NextResponse.json({ error: "El nombre debe tener entre 1 y 180 caracteres." }, { status: 400 });
    }

    const precioNumero = Number(precio);
    if (precio === "" || precio === null || !Number.isFinite(precioNumero) || precioNumero < 0) {
      return NextResponse.json({ error: "El precio debe ser un número válido no negativo." }, { status: 400 });
    }

    if (typeof categoria !== "string" || !categoria.trim() || categoria.trim().length > 80) {
      return NextResponse.json({ error: "La categoría no es válida." }, { status: 400 });
    }

    if (!["propio", "dropshipping", "tercero"].includes(tipoOrigen)) {
      return NextResponse.json({ error: "Selecciona un origen válido." }, { status: 400 });
    }

    if (descripcion !== undefined && descripcion !== null &&
      (typeof descripcion !== "string" || descripcion.length > 5000)) {
      return NextResponse.json({ error: "La descripción no es válida." }, { status: 400 });
    }

    if (stock !== undefined && stock !== null &&
      (!Number.isInteger(stock) || stock < 0)) {
      return NextResponse.json({ error: "Las existencias deben ser un entero igual o mayor que cero." }, { status: 400 });
    }

    if (typeof activo !== "boolean" || typeof destacado !== "boolean") {
      return NextResponse.json({ error: "El estado del producto no es válido." }, { status: 400 });
    }

    if (proveedor !== undefined && proveedor !== null &&
      (typeof proveedor !== "string" || proveedor.length > 180)) {
      return NextResponse.json({ error: "El proveedor no es válido." }, { status: 400 });
    }

    if (imagen !== undefined && imagen !== null &&
      (typeof imagen !== "string" || imagen.length > 2000 ||
       (imagen.trim() && !/^https?:\/\//i.test(imagen.trim())))) {
      return NextResponse.json({ error: "La imagen debe ser una dirección web válida." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secret) {
      return NextResponse.json({ error: "Configuración del servidor incompleta." }, { status: 500 });
    }

    const supabase = createSupabaseClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const nuevoProducto: Record<string, string | number | boolean | null> = {
      nombre: nombre.trim(),
      precio: precioNumero,
      categoria: categoria.trim(),
      descripcion: descripcion?.trim() || null,
      activo,
      destacado,
      origen: tipoOrigen,
      proveedor: proveedor?.trim() || null,
      imagen: imagen?.trim() || null,
    };

    if (stock !== undefined && stock !== null && stock !== "") {
      nuevoProducto.stock = stock;
    }

    const { data: producto, error } = await supabase
      .from("productos")
      .insert(nuevoProducto)
      .select("id,nombre,precio,categoria,activo,destacado,stock,descripcion,imagen,origen,proveedor")
      .single();

    if (error) {
      console.error("Error al crear producto:", error.message);
      return NextResponse.json({ error: "No fue posible registrar el producto." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, producto }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Solicitud inválida o error interno." }, { status: 400 });
  }
}
