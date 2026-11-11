"use client";

import {
  Music2,
  Pin,
  MessageCircle,
  Heart,
  Mail,
  Grid2X2,
  ShoppingBag,
  ArrowUpRight,
} from "lucide-react";

import { siteConfig } from "../lib/siteConfig";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  const redes = [
    {
      nombre: "Facebook",
      href: siteConfig.social.facebook,
      icono: MessageCircle,
      color: "text-[#1877F2]",
      fondo: "hover:bg-[#1877F2]/15 hover:border-[#1877F2]/60",
    },
    {
      nombre: "Instagram",
      href: siteConfig.social.instagram,
      icono: Heart,
      color: "text-[#E4405F]",
      fondo: "hover:bg-[#E4405F]/15 hover:border-[#E4405F]/60",
    },
    {
      nombre: "TikTok",
      href: siteConfig.social.tiktok,
      icono: Music2,
      color: "text-white",
      fondo: "hover:bg-cyan-300/15 hover:border-cyan-300/60",
    },
    {
      nombre: "Pinterest",
      href: siteConfig.social.pinterest,
      icono: Pin,
      color: "text-[#E60023]",
      fondo: "hover:bg-[#E60023]/15 hover:border-[#E60023]/60",
    },
    {
      nombre: "YouTube",
      href: siteConfig.social.youtube,
      icono: ArrowUpRight,
      color: "text-[#FF0033]",
      fondo: "hover:bg-[#FF0033]/15 hover:border-[#FF0033]/60",
    },
    {
      nombre: "WhatsApp",
      href: siteConfig.social.whatsapp,
      icono: MessageCircle,
      color: "text-[#25D366]",
      fondo: "hover:bg-[#25D366]/15 hover:border-[#25D366]/60",
    },
  ];

  const enlaces = [
    {
      nombre: "Categorías",
      href: "#categorias",
      icono: Grid2X2,
    },
    {
      nombre: "Productos",
      href: "#productos",
      icono: ShoppingBag,
    },
    {
      nombre: "Contacto",
      href: `mailto:${siteConfig.brand.email}`,
      icono: Mail,
    },
  ];

  return (
    <footer className="relative mt-3 overflow-hidden border-t border-cyan-300/20 bg-gradient-to-b from-[#0b1728] to-[#050a13]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at 15% 0%, rgba(0,160,255,0.18), transparent 48%), radial-gradient(ellipse at 85% 100%, rgba(0,90,220,0.13), transparent 45%)",
        }}
      />

      <div className="relative mx-auto grid max-w-[1500px] grid-cols-1 gap-7 px-4 py-7 sm:px-6 md:grid-cols-[1.15fr_0.75fr_1.1fr] md:gap-5 lg:px-10 lg:py-9">

        {/* MARCA WICU */}
        <div className="flex flex-col items-start gap-3">
          <a
            href="#"
            aria-label="WICU, volver al inicio"
            className="inline-flex items-center transition duration-300 hover:scale-[1.02]"
          >
            <BrandLogo className="h-[68px] sm:h-[78px]" />
          </a>

          <p className="max-w-sm bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-sm font-bold tracking-wide text-transparent sm:text-base">
            {siteConfig.brand.slogan}
          </p>

          <p className="max-w-sm text-xs leading-5 text-slate-300">
            Tecnología, calidad y estilo en una experiencia de compra diferente.
          </p>
        </div>

        {/* NAVEGACIÓN */}
        <div>
          <h3 className="mb-4 text-sm font-black uppercase tracking-[0.15em] text-cyan-200">
            Explora WICU
          </h3>

          <nav className="flex flex-col gap-3">
            {enlaces.map((enlace) => {
              const Icono = enlace.icono;

              return (
                <a
                  key={enlace.nombre}
                  href={enlace.href}
                  className="group inline-flex w-fit items-center gap-2.5 text-sm font-semibold text-slate-200 transition hover:translate-x-1 hover:text-cyan-200"
                >
                  <Icono
                    size={17}
                    className="text-cyan-400 transition group-hover:text-white"
                  />
                  {enlace.nombre}
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </a>
              );
            })}
          </nav>
        </div>

        {/* REDES SOCIALES */}
        <div>
          <h3 className="mb-2 text-sm font-black uppercase tracking-[0.15em] text-cyan-200">
            Conecta con WICU
          </h3>

          <p className="mb-4 text-xs leading-5 text-slate-300">
            Síguenos y descubre nuestras novedades.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {redes.map((red) => {
              const Icono = red.icono;

              return (
                <a
                  key={red.nombre}
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={red.nombre}
                  title={red.nombre}
                  className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-2 transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_18px_rgba(0,180,255,0.13)] ${red.fondo}`}
                >
                  <Icono size={20} className={red.color} />
                  <span className="text-[10px] font-bold text-slate-200">
                    {red.nombre}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* FRANJA INFERIOR */}
      <div className="relative border-t border-cyan-300/15 bg-black/20">
        <div className="mx-auto flex max-w-[1500px] flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:px-6 md:flex-row md:text-left lg:px-10">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-cyan-100 sm:text-xs">
            © {new Date().getFullYear()} WICU · Todos los derechos reservados
          </p>

          <p className="text-[10px] text-slate-400 sm:text-xs">
            Precios, disponibilidad y envío sujetos a confirmación.
          </p>
        </div>
      </div>
    </footer>
  );
}
