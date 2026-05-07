"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Search, Globe } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaPinterest,
} from "react-icons/fa";

import { supabase } from "../lib/supabaseClient";

export default function Home() {

  const [productos, setProductos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [giftMap, setGiftMap] = useState<{ [key: number]: boolean }>({});
  const [imgActiva, setImgActiva] = useState<{ [key: number]: string }>({});

  // 🔥 CARGAR PRODUCTOS
  useEffect(() => {
    const fetchProductos = async () => {

      const { data } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true)
        .order("id", { ascending: false });

      if (data) {

        setProductos(data);

        const gifts: any = {};
        const imagenesIniciales: any = {};

        data.forEach((p: any, i: number) => {

          gifts[i] = Math.random() < 0.3;

          imagenesIniciales[p.id] =
            p.imagenes?.[0] || p.imagen;
        });

        setGiftMap(gifts);
        setImgActiva(imagenesIniciales);
      }
    };

    fetchProductos();

  }, []);

  // 🔔 TOAST AUTOMÁTICO
  useEffect(() => {

    const cities = [
      "Bogotá",
      "Medellín",
      "Cali",
      "Barranquilla",
      "Cartagena",
    ];

    const interval = setInterval(() => {

      const city =
        cities[Math.floor(Math.random() * cities.length)];

      const type = Math.random();

      if (type < 0.6) {
        setToast(`🔥 Compra reciente en ${city}`);
      } else {
        setToast(`🎁 Cliente recibió regalo sorpresa`);
      }

      setTimeout(() => {
        setToast("");
      }, 3000);

    }, 4500);

    return () => clearInterval(interval);

  }, []);

  // 🔍 FILTRO
  const filtrados = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(search.toLowerCase())
  );

  const productoEstrella = productos[0];

  return (
    <main className="relative min-h-screen text-white overflow-hidden bg-black">

      {/* 🌌 FONDO */}
      <div className="stars absolute inset-0"></div>
      <div className="particles absolute inset-0"></div>
      <div className="grid-lines absolute inset-0"></div>
      <div className="depth-layer absolute inset-0"></div>

      {/* 🔝 TOPBAR */}
      <div className="overflow-hidden border-b border-cyan-400/20 relative z-10">
        <div className="animate-scroll text-cyan-400 py-2 text-sm whitespace-nowrap">
          ⚡ WICU 24/7 · Comercio Inteligente Global · IA + Dropshipping + Ecommerce ⚡
        </div>
      </div>

      {/* 🧊 HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-center gap-6 px-6 py-4 relative z-10">

        {/* 🔄 LOGO */}
        <div className="flex items-center gap-3 text-cyan-400">

          <div className="relative w-12 h-12 flex items-center justify-center">

            <div className="absolute w-full h-full border border-cyan-400 rounded-full animate-spin opacity-40"></div>

            <span className="absolute text-[9px] animate-[spin_10s_linear_infinite] tracking-widest">
              WICU • WICU • WICU
            </span>

            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f0ff]"></div>

          </div>

          <div>
            <span className="font-bold text-2xl glow">
              WICU
            </span>

            <p className="text-xs opacity-60">
              Tecnología premium
            </p>
          </div>

        </div>

        {/* 🔍 BUSCADOR */}
        <div className="searchBox w-full lg:w-[420px] relative">

          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />

          <Search
            size={18}
            className="text-cyan-400 absolute right-4 top-3"
          />

        </div>

        {/* 🌍 DERECHA */}
        <div className="flex items-center gap-4">

          <Globe className="text-cyan-400" />

          <img
            src="https://flagcdn.com/w40/co.png"
            className="w-6 hover:scale-110 transition"
          />

          <img
            src="https://flagcdn.com/w40/us.png"
            className="w-6 hover:scale-110 transition"
          />

          <div className="cart cursor-pointer relative">

            <ShoppingCart />

            <div className="badge">
              {productos.length}
            </div>

          </div>

        </div>

      </header>

      {/* 🚀 HERO */}
      <section className="text-center mt-16 relative z-10 px-4">

        <h1 className="text-6xl lg:text-7xl font-bold text-cyan-400 glow">
          WICU
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Tecnología que evoluciona contigo
        </p>

        <button className="btn mt-6">
          Comprar ahora
        </button>

      </section>

      {/* ⭐ PRODUCTO DESTACADO */}
      {productoEstrella && (

        <section className="mt-16 px-4 max-w-6xl mx-auto relative z-10">

          <div className="grid lg:grid-cols-2 gap-8 card p-6 hover:shadow-[0_0_40px_#00f0ff50] transition">

            {/* 🖼 GALERÍA */}
            <div>

              <img
                src={
                  imgActiva[productoEstrella.id] ||
                  productoEstrella.imagen
                }
                className="rounded-2xl h-[420px] w-full object-cover hover:scale-[1.02] transition duration-300"
              />

              {/* MINIATURAS */}
              <div className="flex gap-3 mt-4 overflow-x-auto">

                {productoEstrella.imagenes?.map(
                  (img: string, idx: number) => (

                    <img
                      key={idx}
                      src={img}
                      onClick={() =>
                        setImgActiva({
                          ...imgActiva,
                          [productoEstrella.id]: img,
                        })
                      }
                      className="w-20 h-20 rounded-xl object-cover cursor-pointer border border-cyan-400/30 hover:border-cyan-400 hover:scale-105 transition"
                    />
                  )
                )}

              </div>

            </div>

            {/* 📦 INFO */}
            <div className="flex flex-col justify-center">

              <h2 className="text-3xl font-bold">
                {productoEstrella.nombre}
              </h2>

              <p className="text-cyan-400 text-3xl mt-4 font-bold">
                ${productoEstrella.precio}
              </p>

              <p className="text-gray-300 mt-4 whitespace-pre-line">
                {productoEstrella.descripcion}
              </p>

              <a
                href={`https://wa.me/573052293658?text=Hola quiero comprar ${productoEstrella.nombre}`}
                target="_blank"
                className="btn mt-6 inline-block text-center"
              >
                Comprar ahora
              </a>

            </div>

          </div>

        </section>
      )}

      {/* ⚡ CATEGORÍAS */}
      <section className="mt-16 relative z-10">

        <div className="overflow-hidden">
          <div className="animate-scroll text-cyan-400 text-xl font-bold whitespace-nowrap">
            ⚡ CATEGORÍAS WICU ⚡
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto px-4 mt-6 pb-2">

          {[
            "🏠 Hogar",
            "⌚ Gadgets",
            "💻 Tecnología",
            "🎧 Audio",
            "📱 Smartphones",
            "👕 Moda",
            "🔥 Tendencias",
            "🎮 Gaming",
          ].map((c, i) => (

            <div
              key={i}
              className="cat whitespace-nowrap"
            >
              {c}
            </div>

          ))}

        </div>

      </section>

      {/* 🛍 PRODUCTOS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 mt-12 relative z-10">

        {filtrados.map((p, i) => (

          <div
            key={i}
            className="card hover:scale-105 transition duration-300 relative overflow-hidden"
          >

            <div className="absolute top-2 left-2 bg-red-500 text-xs px-2 py-1 rounded z-20">
              🔥 HOT
            </div>

            {/* 🖼 IMAGEN PRINCIPAL */}
            <img
              src={imgActiva[p.id] || p.imagen}
              className="h-52 w-full object-cover rounded-xl"
            />

            {/* 🖼 MINIATURAS */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">

              {p.imagenes?.slice(0, 4).map(
                (img: string, idx: number) => (

                  <img
                    key={idx}
                    src={img}
                    onClick={() =>
                      setImgActiva({
                        ...imgActiva,
                        [p.id]: img,
                      })
                    }
                    className="w-12 h-12 object-cover rounded-lg cursor-pointer border border-white/10 hover:border-cyan-400 transition"
                  />
                )
              )}

            </div>

            <h4 className="mt-4 font-semibold line-clamp-2">
              {p.nombre}
            </h4>

            <p className="text-cyan-400 text-lg font-bold mt-2">
              ${p.precio}
            </p>

            {giftMap[i] && (
              <p className="text-green-400 text-xs mt-1">
                🎁 Incluye regalo
              </p>
            )}

            <a
              href={`https://wa.me/573052293658?text=Hola quiero comprar ${p.nombre}`}
              target="_blank"
              className="btn mt-4 block text-center"
            >
              Comprar
            </a>

          </div>

        ))}

      </section>

      {/* 🔻 FOOTER */}
      <footer className="text-center mt-24 pb-10 relative z-10 px-4">

        <p>🌍 WICU 24/7 · Cobertura global</p>

        <p className="mt-2">
          🔒 Compra segura
        </p>

        <div className="flex justify-center gap-6 mt-6 flex-wrap">

          <span className="text-blue-400">Visa</span>
          <span className="text-orange-400">Mastercard</span>
          <span className="text-yellow-400">Wompi</span>
          <span className="text-white">PayPal</span>

        </div>

        <p className="mt-6 text-cyan-400">
          📧 wicu888@hotmail.com
        </p>

        <div className="flex justify-center gap-6 text-2xl mt-6">

          <FaFacebook className="text-blue-600" />
          <FaInstagram className="text-pink-500" />
          <FaYoutube className="text-red-600" />
          <FaTiktok />
          <FaPinterest className="text-red-500" />

        </div>

        <a
          href="https://wa.me/573052293658"
          className="btn mt-8 inline-block"
        >
          💬 WhatsApp soporte
        </a>

      </footer>

      {/* 🔔 TOAST */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

    </main>
  );
}