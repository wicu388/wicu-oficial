"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Search, Globe, X } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaPinterest } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";

export default function Home() {

  const [productos, setProductos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [giftMap, setGiftMap] = useState<{[key:number]:boolean}>({});

  // 🔥 DATA
  useEffect(() => {
    const fetchProductos = async () => {
      const { data } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true)
        .order("id", { ascending: false });

      if (data) {
        setProductos(data);

        const gifts:any = {};
        data.forEach((_:any, i:number)=>{
          gifts[i] = Math.random() < 0.3;
        });
        setGiftMap(gifts);
      }
    };

    fetchProductos();
  }, []);

  // 🔔 TOAST PRO
  useEffect(() => {
    const cities = ["Bogotá","Medellín","Cali","Barranquilla"];

    const interval = setInterval(() => {
      const city = cities[Math.floor(Math.random()*cities.length)];
      const type = Math.random();

      if(type < 0.6){
        setToast(`🔥 Compra reciente en ${city}`);
      } else {
        setToast(`🎁 Cliente recibió regalo sorpresa`);
      }

    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const productoEstrella = productos[0];

  return (
    <main className="relative min-h-screen text-white overflow-hidden">

      {/* 🌌 FONDO */}
      <div className="stars absolute inset-0"></div>
      <div className="particles absolute inset-0"></div>
      <div className="grid-lines absolute inset-0"></div>
      <div className="depth-layer absolute inset-0"></div>

      {/* 🔝 TOPBAR */}
      <div className="overflow-hidden border-b border-cyan-400/20 relative z-10">
        <div className="animate-scroll text-cyan-400 py-2 text-sm">
          ⚡ WICU 24/7 · Comercio Inteligente Global ⚡
        </div>
      </div>

      {/* 🧊 HEADER */}
      <div className="flex justify-between items-center px-6 py-4 relative z-10">

        {/* 🔄 LOGO GIRATORIO PRO */}
        <div className="flex items-center gap-3 text-cyan-400">

          <div className="relative w-12 h-12 flex items-center justify-center">

            <div className="absolute w-full h-full border border-cyan-400 rounded-full animate-spin opacity-40"></div>

            <span className="absolute text-[9px] animate-[spin_10s_linear_infinite] tracking-widest">
              WICU • WICU • WICU
            </span>

            <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f0ff]"></div>
          </div>

          <div>
            <span className="font-bold text-xl glow">WICU</span>
            <p className="text-xs opacity-60">Tecnología premium</p>
          </div>
        </div>

        {/* 🔍 BUSCADOR */}
        <div className="searchBox w-[420px] relative">
          <input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e)=>setSearch(e.target.value)}
          />
          <Search size={18} className="text-cyan-400"/>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-4">
          <Globe className="text-cyan-400"/>

          <img src="https://flagcdn.com/w40/co.png" className="w-6 hover:scale-110"/>
          <img src="https://flagcdn.com/w40/us.png" className="w-6 hover:scale-110"/>

          <div onClick={()=>setCartOpen(true)} className="cart cursor-pointer">
            <ShoppingCart/>
            <div className="badge">{productos.length}</div>
          </div>
        </div>

      </div>

      {/* 🚀 HERO */}
      <section className="text-center mt-16 relative z-10">
        <h1 className="text-7xl font-bold text-cyan-400 glow">
          WICU
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Tecnología que evoluciona contigo
        </p>

        <button className="btn mt-6">
          Comprar ahora
        </button>
      </section>

      {/* ⭐ DESTACADO */}
      {productoEstrella && (
        <section className="mt-12 px-4 max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 card p-4 hover:shadow-[0_0_40px_#00f0ff50]">

            <img
              src={productoEstrella.imagen}
              className="rounded h-60 object-cover"
            />

            <div>
              <h2 className="text-xl">{productoEstrella.nombre}</h2>
              <p className="text-cyan-400 text-lg mt-2">{productoEstrella.precio}</p>

              <a
                href={`https://wa.me/573052293658?text=Hola quiero comprar ${productoEstrella.nombre}`}
                target="_blank"
                className="btn mt-4 inline-block"
              >
                Comprar ahora
              </a>
            </div>

          </div>
        </section>
      )}

      {/* ⚡ BANDA */}
      <div className="mt-12 overflow-hidden">
        <div className="animate-scroll text-cyan-400 text-xl font-bold">
          ⚡ CATEGORÍAS WICU ⚡
        </div>
      </div>

      {/* ⚡ CATEGORÍAS */}
      <div className="flex gap-4 overflow-x-auto px-4 mt-6">
        {["🏠 Hogar","🏋️ Fitness","⌚ Gadgets","💻 Tecnología","👕 Moda","🎧 Accesorios","🔥 Tendencias","📦 Otros"].map((c,i)=>(
          <div key={i} className="cat">{c}</div>
        ))}
      </div>

      {/* 🛍 PRODUCTOS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4 mt-10 relative z-10">

        {filtrados.map((p,i)=>(
          <div key={i} className="card hover:scale-105 transition duration-300">

            <div className="absolute top-2 left-2 bg-red-500 text-xs px-2 py-1 rounded">
              🔥 HOT
            </div>

            <img src={p.imagen} className="h-40 w-full object-cover rounded"/>

            <h4 className="mt-3">{p.nombre}</h4>
            <p className="text-cyan-400">{p.precio}</p>

            {giftMap[i] && (
              <p className="text-green-400 text-xs">
                🎁 Incluye regalo
              </p>
            )}

            <a
              href={`https://wa.me/573052293658?text=Hola quiero comprar ${p.nombre}`}
              target="_blank"
              className="btn mt-3 block text-center"
            >
              Comprar
            </a>

          </div>
        ))}

      </section>

      {/* 🔻 FOOTER */}
      <footer className="text-center mt-20 pb-10 relative z-10">

        <p>🌍 WICU 24/7 · Cobertura global</p>
        <p>🔒 Compra segura</p>

        <div className="flex justify-center gap-6 mt-4">
          <span className="text-blue-400">Visa</span>
          <span className="text-orange-400">Mastercard</span>
          <span className="text-yellow-400">Wompi</span>
          <span className="text-white">PayPal</span>
        </div>

        <p className="mt-4 text-cyan-400">
          📧 wicu888@hotmail.com
        </p>

        <div className="flex justify-center gap-6 text-2xl mt-4">
          <FaFacebook className="text-blue-600"/>
          <FaInstagram className="text-pink-500"/>
          <FaYoutube className="text-red-600"/>
          <FaTiktok/>
          <FaPinterest className="text-red-500"/>
        </div>

        <a href="https://wa.me/573052293658" className="btn mt-6 inline-block">
          💬 WhatsApp soporte
        </a>

      </footer>

      {/* 🔔 TOAST */}
      {toast && <div className="toast">{toast}</div>}

    </main>
  );
}