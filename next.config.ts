import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 MODO ESTRICTO REACT
  reactStrictMode: true,

  // 🔥 COMPRESIÓN GENERAL
  compress: true,

  // 🔥 POWERED BY OFF
  poweredByHeader: false,

  // 🔥 OPTIMIZACIÓN TURBO
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },

  images: {
    // 🔥 DOMINIOS PREMIUM DROPSHIPPING + MARKETPLACE
    domains: [
      // Unsplash
      "images.unsplash.com",

      // AliExpress / Alibaba
      "ae-pic-a1.aliexpress-media.com",
      "ae01.alicdn.com",
      "gloimg.alicdn.com",

      // CJ Dropshipping
      "cjdropshipping.com",
      "img.cjdropshipping.com",

      // Shopify CDN
      "cdn.shopify.com",

      // Amazon
      "m.media-amazon.com",
      "images-na.ssl-images-amazon.com",

      // Cloudinary
      "res.cloudinary.com",

      // Imgur
      "i.imgur.com",

      // Picsum
      "picsum.photos",

      // Pexels
      "images.pexels.com",

      // Freepik CDN
      "img.freepik.com",

      // Temu CDN (algunas imágenes)
      "img.kwcdn.com",

      // eBay CDN
      "i.ebayimg.com",
    ],

    // ⚡ FORMATOS ULTRA RÁPIDOS
    formats: ["image/avif", "image/webp"],

    // ⚡ TAMAÑOS RESPONSIVE MARKETPLACE
    deviceSizes: [
      320,
      420,
      640,
      768,
      1024,
      1200,
      1600,
      1920,
    ],

    // ⚡ MINIATURAS + GALERÍAS
    imageSizes: [
      16,
      32,
      48,
      64,
      96,
      128,
      256,
      384,
    ],

    // ⚡ CACHE AGRESIVO
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días

    // ⚡ PERMITE FUTURAS OPTIMIZACIONES IA
    dangerouslyAllowSVG: true,

    // ⚡ SEGURIDAD SVG
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 🔥 OPTIMIZACIÓN GENERAL
  swcMinify: true,

  experimental: {
    // ⚡ CSS MÁS RÁPIDO
    optimizeCss: true,

    // ⚡ SCROLL RESTORE APP STYLE
    scrollRestoration: true,

    // ⚡ OPTIMIZACIÓN IMPORTS
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
    ],
  },

  // 🔥 HEADERS DE RENDIMIENTO
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif)",
        locale: false,
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;