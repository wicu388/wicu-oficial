import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // 🔥 REACT ESTRICTO
  reactStrictMode: true,

  // 🔥 COMPRESIÓN
  compress: true,

  // 🔥 OCULTAR POWERED BY
  poweredByHeader: false,

  // 🔥 TURBO COMPILER
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },

  images: {

    // 🔥 NUEVO SISTEMA NEXT 16
    remotePatterns: [

      // Unsplash
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },

      // AliExpress
      {
        protocol: "https",
        hostname: "ae-pic-a1.aliexpress-media.com",
      },
      {
        protocol: "https",
        hostname: "ae01.alicdn.com",
      },
      {
        protocol: "https",
        hostname: "gloimg.alicdn.com",
      },

      // CJ Dropshipping
      {
        protocol: "https",
        hostname: "cjdropshipping.com",
      },
      {
        protocol: "https",
        hostname: "img.cjdropshipping.com",
      },

      // Shopify
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },

      // Amazon
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },

      // Cloudinary
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },

      // Imgur
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },

      // Picsum
      {
        protocol: "https",
        hostname: "picsum.photos",
      },

      // Pexels
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },

      // Freepik
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },

      // Temu CDN
      {
        protocol: "https",
        hostname: "img.kwcdn.com",
      },

      // eBay
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
      },
    ],

    // 🔥 FORMATOS MODERNOS
    formats: ["image/avif", "image/webp"],

    // 🔥 RESPONSIVE MARKETPLACE
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

    // 🔥 MINIATURAS
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

    // 🔥 CACHE
    minimumCacheTTL: 60 * 60 * 24 * 30,

    // 🔥 SVG
    dangerouslyAllowSVG: true,

    // 🔥 SEGURIDAD
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {

    // 🔥 RESTAURAR SCROLL
    scrollRestoration: true,

    // 🔥 IMPORTS OPTIMIZADOS
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
    ],
  },

  // 🔥 HEADERS CACHE
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