"use client";

import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  barsVariant?: "aligned" | "stepped";
};

export default function BrandLogo({
  className = "",
  barsVariant = "stepped",
}: BrandLogoProps) {
  const stepped = barsVariant === "stepped";

  const greenPoints = "8,5 24,8 17,33 1,33";
  const orangePoints = stepped
    ? "35,11 49,14 43,33 29,33"
    : "31,5 45,8 39,33 25,33";
  const redPoints = stepped
    ? "58,17 70,20 65,33 53,33"
    : "54,5 66,8 61,33 49,33";

  return (
    <div
      className={`flex shrink-0 items-center gap-1.5 overflow-visible ${className}`}
      aria-label="WICU, logo oficial"
    >
      <Image
        src="/assets/imagenes/wicu-logo-oficial-definitivo.png"
        alt="Emblema oficial definitivo de WICU"
        width={1254}
        height={1254}
        priority
        draggable={false}
        className="h-full w-auto shrink-0 object-contain"
      />

      <span
        className="shrink-0 bg-clip-text text-[27px] font-black leading-none tracking-[-0.06em] text-transparent sm:text-[36px] lg:text-[39px]"
        style={{
          backgroundImage:
            "linear-gradient(125deg, #7899bd 0%, #e7f4ff 25%, #ffffff 42%, #a9c9e8 60%, #f4faff 78%, #739bc5 100%)",
          filter:
            "drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 7px rgba(37,150,255,0.55))",
          WebkitBackgroundClip: "text",
        }}
      >
        WICU
      </span>

      <svg
        viewBox="0 0 72 36"
        width="52"
        height="26"
        className="ml-0.5 h-[26px] w-[52px] shrink-0 overflow-visible sm:h-[32px] sm:w-[64px] lg:h-[35px] lg:w-[70px]"
        role="img"
        aria-label="Barras tridimensionales verde, naranja y roja de WICU"
      >
        <defs>
          <linearGradient id="wicu-green" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d5ffc5" />
            <stop offset="22%" stopColor="#56f184" />
            <stop offset="65%" stopColor="#13ad4d" />
            <stop offset="100%" stopColor="#075b2b" />
          </linearGradient>
          <linearGradient id="wicu-orange" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff2c2" />
            <stop offset="25%" stopColor="#ffb640" />
            <stop offset="68%" stopColor="#ed7915" />
            <stop offset="100%" stopColor="#9e4208" />
          </linearGradient>
          <linearGradient id="wicu-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffc0b8" />
            <stop offset="25%" stopColor="#ff6255" />
            <stop offset="68%" stopColor="#d92d27" />
            <stop offset="100%" stopColor="#82151b" />
          </linearGradient>
        </defs>

        <g>
          <polygon points={greenPoints} fill="#064323" transform="translate(1.2 1.6)" />
          <polygon points={greenPoints} fill="url(#wicu-green)" stroke="#baffc7" strokeWidth="0.7" strokeLinejoin="miter" />
          <path d="M8 5 L24 8" stroke="#efffe9" strokeWidth="1.1" opacity="0.95" />
        </g>

        <g>
          <polygon points={orangePoints} fill="#813b0a" transform="translate(1.2 1.6)" />
          <polygon points={orangePoints} fill="url(#wicu-orange)" stroke="#ffe0a0" strokeWidth="0.7" strokeLinejoin="miter" />
          <path
            d={stepped ? "M35 11 L49 14" : "M31 5 L45 8"}
            stroke="#fff7d9"
            strokeWidth="1"
            opacity="0.95"
          />
        </g>

        <g>
          <polygon points={redPoints} fill="#68151a" transform="translate(1.2 1.6)" />
          <polygon points={redPoints} fill="url(#wicu-red)" stroke="#ffb7b0" strokeWidth="0.7" strokeLinejoin="miter" />
          <path
            d={stepped ? "M58 17 L70 20" : "M54 5 L66 8"}
            stroke="#ffe4df"
            strokeWidth="0.9"
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}
