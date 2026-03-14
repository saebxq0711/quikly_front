"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useKiosco } from "./layout";
import { useEffect, useState } from "react";

// Wave Component
function WaveTop() {
  return (
    <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0">
      <svg
        className="relative block w-[200%] h-24 md:h-32"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          className="fill-[#5CCFE6]/20 animate-wave-slow"
        />
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          className="fill-[#5CCFE6]/30 animate-wave-medium"
        />
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          className="fill-[#5CCFE6]/10 animate-wave-fast"
        />
      </svg>
    </div>
  );
}

function WaveBottom() {
  return (
    <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180 z-0">
      <svg
        className="relative block w-[200%] h-24 md:h-32"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
          className="fill-[#5CCFE6]/20 animate-wave-medium"
        />
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          className="fill-[#5CCFE6]/30 animate-wave-slow"
        />
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          className="fill-[#5CCFE6]/10 animate-wave-fast"
        />
      </svg>
    </div>
  );
}

// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Animated Logo/Spinner */}
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-[#5CCFE6]/20" />
        
        {/* Spinning arc */}
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-transparent border-t-[#5CCFE6] animate-spin" />
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-[#5CCFE6]/10 rounded-full animate-pulse flex items-center justify-center">
            <svg
              className="w-6 h-6 text-[#5CCFE6]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Loading text with dots animation */}
      <div className="mt-8 flex items-center gap-1">
        <span className="text-lg font-medium text-foreground">Preparando tu experiencia</span>
        <span className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-[#5CCFE6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-[#5CCFE6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-[#5CCFE6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </span>
      </div>
      
      {/* Shimmer bar */}
      <div className="mt-4 w-48 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#5CCFE6] to-transparent animate-shimmer" />
      </div>
    </div>
  );
}

// Error Component
function ErrorState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-destructive"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">No se pudo cargar el kiosco</h2>
      <p className="text-muted-foreground text-center max-w-xs">
        Por favor, verifica tu conexión e intenta nuevamente
      </p>
    </div>
  );
}

// Main Component
export default function KioscoPage() {
  const router = useRouter();
  const { restaurante, clearCart, loading } = useKiosco();
  const [mounted, setMounted] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 100);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const handleStart = () => {
    clearCart();
    router.push("/kiosco/categorias");
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!restaurante) {
    return <ErrorState />;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Waves */}
      <WaveTop />
      <WaveBottom />
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #000 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <main className="flex-1 flex items-center justify-center px-6 md:px-12 lg:px-20">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-8 lg:gap-16 items-center">
              
              {/* Logo Section - Left */}
              <div
                className={`
                  flex justify-center lg:justify-start
                  opacity-0
                  ${mounted ? "animate-fade-in-left" : ""}
                `}
              >
                <div className="relative group">
                  {/* Glow effect behind logo */}
                  <div className="absolute -inset-4 bg-[#5CCFE6]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Logo container - adaptive for square or rectangular */}
                  <div className="relative w-40 h-40 md:w-52 md:h-52 lg:w-60 lg:h-60 rounded-2xl bg-white shadow-2xl shadow-black/10 border border-border/50 overflow-hidden flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-105">
                    {restaurante.logo && !imageError ? (
                      <Image
                        src={restaurante.logo.startsWith('http') ? restaurante.logo : `${process.env.NEXT_PUBLIC_FILES_URL || ''}${restaurante.logo}`}
                        alt={restaurante.nombre}
                        fill
                        className="object-contain p-4"
                        priority
                        onError={() => setImageError(true)}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#5CCFE6]/5 to-[#5CCFE6]/20 rounded-xl">
                        <svg
                          className="w-20 h-20 md:w-24 md:h-24 text-[#5CCFE6]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Text Section - Right */}
              <div className="flex flex-col gap-6 md:gap-8 text-center lg:text-left">
                {/* Badge */}
                <div
                  className={`
                    opacity-0
                    ${mounted ? "animate-fade-in-up delay-100" : ""}
                  `}
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#5CCFE6]/10 border border-[#5CCFE6]/20">
                    <span className="w-2 h-2 rounded-full bg-[#5CCFE6] animate-pulse" />
                    <span className="text-sm font-medium text-foreground tracking-wide">
                      Kiosco de Autoatención
                    </span>
                  </span>
                </div>

                {/* Title */}
                <div
                  className={`
                    opacity-0
                    ${mounted ? "animate-fade-in-up delay-200" : ""}
                  `}
                >
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight text-balance">
                    Bienvenido a{" "}
                    <span className="relative">
                      <span className="relative z-10">{restaurante.nombre}</span>
                      <span className="absolute bottom-2 left-0 w-full h-3 bg-[#5CCFE6]/30 -z-0 rounded" />
                    </span>
                  </h1>
                </div>

                {/* Description */}
                <p
                  className={`
                    text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed
                    opacity-0
                    ${mounted ? "animate-fade-in-up delay-300" : ""}
                  `}
                >
                  Ordena de forma rápida y sin filas. Toca la pantalla, elige tus productos 
                  favoritos y disfruta en segundos.
                </p>

                {/* CTA Button */}
                <div
                  className={`
                    opacity-0
                    ${mounted ? "animate-fade-in-up delay-400" : ""}
                  `}
                >
                  <button
                    onClick={handleStart}
                    className="
                      group relative inline-flex items-center justify-center
                      px-10 py-5 md:px-14 md:py-6
                      bg-[#5CCFE6] text-black
                      font-bold text-xl md:text-2xl
                      rounded-2xl
                      shadow-lg shadow-[#5CCFE6]/30
                      transition-all duration-300
                      hover:shadow-xl hover:shadow-[#5CCFE6]/40
                      hover:scale-[1.02]
                      active:scale-[0.98]
                      focus:outline-none focus:ring-4 focus:ring-[#5CCFE6]/50
                      cursor-pointer
                    "
                  >
                    {/* Button shine effect */}
                    <span className="absolute inset-0 rounded-2xl overflow-hidden">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </span>
                    
                    <span className="relative flex items-center gap-3">
                      <svg
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                      <span>Empezar Pedido</span>
                      <svg
                        className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </button>
                </div>

                {/* Features */}
                <div
                  className={`
                    flex flex-wrap justify-center lg:justify-start gap-4 md:gap-6 mt-2
                    opacity-0
                    ${mounted ? "animate-fade-in-up delay-500" : ""}
                  `}
                >
                  {[
                    { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: "Rápido" },
                    { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Fácil" },
                    { icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z", text: "Seguro" },
                  ].map((feature, i) => (
                    <div
                      key={feature.text}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <svg
                        className="w-5 h-5 text-[#5CCFE6]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={feature.icon}
                        />
                      </svg>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className={`
            py-6 md:py-8 text-center
            opacity-0
            ${mounted ? "animate-fade-in-up delay-700" : ""}
          `}
        >
          <p className="text-sm text-muted-foreground tracking-wide flex items-center justify-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-foreground">Quikly</span>
            <span className="w-1 h-1 rounded-full bg-[#5CCFE6]" />
            <span>AutoAtención</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
