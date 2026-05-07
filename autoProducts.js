const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ovxuooooipsarxbbtbbi.supabase.co";
const supabaseKey = "sb_publishable_9KdCQyKIT95o_ABzPtzkWw_wHKk1vkV";

const supabase = createClient(supabaseUrl, supabaseKey);

async function subirProductos() {
  try {

    // 🧹 LIMPIAR PRODUCTOS ANTES DE INSERTAR (EVITA DUPLICADOS)
    await supabase.from("productos").delete().neq("id", 0);

    const productos = [
      // 🔥 TECNOLOGÍA
      {
        nombre: "Smartwatch Deportivo Pro – Llamadas Bluetooth + Monitor Salud",
        precio: 229900,
        imagen: "https://ae-pic-a1.aliexpress-media.com/kf/Sb641af5256414add91a5afe87022f263v.jpg",
        imagenes: [
          "https://ae-pic-a1.aliexpress-media.com/kf/Sb641af5256414add91a5afe87022f263v.jpg"
        ],
        descripcion: "Controla tu día desde tu muñeca.\n\n✔ Llamadas Bluetooth\n✔ Monitor de salud\n✔ Modos deportivos\n✔ Diseño moderno\n\nIdeal para uso diario.",
        categoria: "tecnologia",
        activo: true
      },
      {
        nombre: "Audífonos Bluetooth 5.3 Pro",
        precio: 89900,
        imagen: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
        imagenes: [
          "https://images.unsplash.com/photo-1585386959984-a4155224a1ad"
        ],
        descripcion: "Sonido envolvente, cancelación de ruido y conexión ultra rápida.",
        categoria: "tecnologia",
        activo: true
      },

      // 🏠 HOGAR
      {
        nombre: "Mini Proyector HD Portátil",
        precio: 199900,
        imagen: "https://images.unsplash.com/photo-1593784991095-a205069470b6",
        imagenes: [
          "https://images.unsplash.com/photo-1593784991095-a205069470b6"
        ],
        descripcion: "Convierte cualquier pared en cine. Compatible con celular y laptop.",
        categoria: "hogar",
        activo: true
      },
      {
        nombre: "Cámara Seguridad WiFi 360°",
        precio: 129900,
        imagen: "https://images.unsplash.com/photo-1581090700227-1e8b8b3b8c1b",
        imagenes: [
          "https://images.unsplash.com/photo-1581090700227-1e8b8b3b8c1b"
        ],
        descripcion: "Vigilancia en tiempo real desde tu celular, visión nocturna y audio bidireccional.",
        categoria: "hogar",
        activo: true
      }
    ];

    const { error } = await supabase
      .from("productos")
      .insert(productos);

    if (error) {
      console.log("❌ Error:", error.message);
    } else {
      console.log("✅ Base limpia + productos organizados por categoría");
    }

  } catch (err) {
    console.log("❌ Error general:", err.message);
  }
}

subirProductos();