import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const productos = [
  {
    nombre: "Smartwatch Pro Max",
    precio: 149900,
    imagen: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
    descripcion: "Reloj inteligente premium",
    categoria: "Tecnología",
    activo: true
  },
  {
    nombre: "Audífonos Bluetooth 5.3 – Sonido Pro",
    precio: 89900,
    imagen: "https://images.unsplash.com/photo-1518441902110-1c4c0c0f4f6f",
    descripcion: "Audio sin cables alta calidad",
    categoria: "Tecnología",
    activo: true
  }
];

async function subirProductos() {
  const { error } = await supabase.from("productos").insert(productos);

  if (error) {
    console.log("❌ Error:", error.message);
  } else {
    console.log("✅ Productos subidos correctamente");
  }
}

subirProductos();
