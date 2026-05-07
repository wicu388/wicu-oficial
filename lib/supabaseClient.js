import { createClient } from "@supabase/supabase-js";

// 🔥 VARIABLES SEGURAS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// 🔥 VALIDACIÓN WICU
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "❌ Faltan variables de entorno de Supabase en .env.local"
  );
}

// 🔥 CLIENTE WICU NEXT-GEN
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },

    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },

    global: {
      headers: {
        "x-application-name": "WICU",
      },
    },

    db: {
      schema: "public",
    },
  }
);

// 🔥 TEST CONEXIÓN
export async function testSupabaseConnection() {
  try {

    const { error } = await supabase
      .from("productos")
      .select("id")
      .limit(1);

    if (error) {
      console.error("❌ Supabase Error:", error.message);
      return false;
    }

    console.log("✅ WICU conectado a Supabase");

    return true;

  } catch (err) {

    console.error(
      "❌ Error general Supabase:",
      err
    );

    return false;
  }
}