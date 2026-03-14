"use client";

import Guard from "@/lib/guards";
import Image from "next/image";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
  useRef,
} from "react";

/* =========================
   Types
========================= */

export type CartItem = {
  id: string;
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  seleccion?: {
    grupo_id: number;
    grupo_nombre: string;
    opcion_id: number;
    opcion_nombre: string;
    precio_adicional: number;
  }[];
  img?: string | null;
};

type Restaurante = {
  id: number;
  nombre: string;
  logo: string;
};

type Promocion = {
  id: number;
  titulo: string;
  descripcion?: string;
  img_flyer: string;
};

type KioscoContextType = {
  restaurante: Restaurante | null;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "id">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInactive: boolean;
  resetInactivity: () => void;
  promociones: Promocion[];
  loading: boolean;
};

/* =========================
   Context
========================= */

const KioscoContext = createContext<KioscoContextType | null>(null);

export function useKiosco() {
  const ctx = useContext(KioscoContext);
  if (!ctx) throw new Error("useKiosco must be used within KioscoProvider");
  return ctx;
}

/* =========================
   Provider
========================= */

const INACTIVITY_TIME = 60_000;
const FADE_DURATION = 800;
const SLIDE_DURATION = 7_000;
const CART_KEY = "kiosco_cart";

function KioscoProvider({ children }: { children: ReactNode }) {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL!;

  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(CART_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed)
        ? parsed.map((item: CartItem) => ({
            ...item,
            seleccion: Array.isArray(item.seleccion) ? item.seleccion : [],
          }))
        : [];
    } catch {
      return [];
    }
  });

  const [isInactive, setIsInactive] = useState(false);
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [showPromoOverlay, setShowPromoOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const inactivityTimerRef = useRef<number | null>(null);

  /* =========================
     Persist cart
  ========================= */
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  /* =========================
     Load contexto kiosco
  ========================= */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API}/kiosco/context`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setRestaurante(data.restaurante);
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  /* =========================
     Inactividad
  ========================= */
  const resetInactivity = useCallback(() => {
    setIsInactive(false);
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = window.setTimeout(
      () => setIsInactive(true),
      INACTIVITY_TIME
    );
  }, []);

  useEffect(() => {
    const handle = () => resetInactivity();
    window.addEventListener("click", handle);
    window.addEventListener("touchstart", handle);
    resetInactivity();
    return () => {
      window.removeEventListener("click", handle);
      window.removeEventListener("touchstart", handle);
    };
  }, [resetInactivity]);

  /* =========================
     Promociones
  ========================= */
  useEffect(() => {
    if (!isInactive || showPromoOverlay) return;

    (async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const res = await fetch(`${API}/kiosco/promociones/activas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      const validas = Array.isArray(data)
        ? data.filter((p: Promocion) => p.img_flyer)
        : [];

      if (!validas.length) return;

      setPromociones(validas);
      setShowPromoOverlay(true);
      setTimeout(() => setOverlayVisible(true), 50);
    })();
  }, [isInactive, API, showPromoOverlay]);

  const closePromos = () => {
    setOverlayVisible(false);
    setTimeout(() => {
      setShowPromoOverlay(false);
      setPromociones([]);
      resetInactivity();
    }, FADE_DURATION);
  };

  /* =========================
     Helpers
  ========================= */
  function sameConfig(a?: CartItem["seleccion"], b?: CartItem["seleccion"]) {
    return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  }

  const getItemExtrasTotal = (item: CartItem) =>
    item.seleccion?.reduce((t, o) => t + o.precio_adicional, 0) ?? 0;

  /* =========================
     Cart actions
  ========================= */
  const addToCart = (item: Omit<CartItem, "id">) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (i) =>
          i.id_producto === item.id_producto &&
          sameConfig(i.seleccion, item.seleccion)
      );

      if (index !== -1) {
        return prev.map((i, idx) =>
          idx === index ? { ...i, cantidad: i.cantidad + item.cantidad } : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          seleccion: Array.isArray(item.seleccion) ? item.seleccion : [],
          id: crypto.randomUUID(),
        },
      ];
    });

    resetInactivity();
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.id !== id));

  const updateQuantity = (id: string, cantidad: number) =>
    cantidad <= 0
      ? removeFromCart(id)
      : setCart((prev) =>
          prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
        );

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);
    setIsInactive(false);
  };

  const getTotal = () =>
    cart.reduce(
      (total, item) =>
        total + (item.precio + getItemExtrasTotal(item)) * item.cantidad,
      0
    );

  const getItemCount = () => cart.reduce((c, i) => c + i.cantidad, 0);

  return (
    <KioscoContext.Provider
      value={{
        restaurante,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
        isInactive,
        resetInactivity,
        promociones,
        loading,
      }}
    >
      {children}

      {/* ================== Overlay promociones ================== */}
      {showPromoOverlay && (
        <div
          className={`fixed inset-0 z-50 bg-black transition-opacity duration-700 ${
            overlayVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closePromos}
        >
          <PromoCarousel promociones={promociones} files={FILES} />
          
          {/* Toca para continuar */}
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center pb-12">
            <div className="animate-bounce-soft">
              <div className="flex items-center gap-3 rounded-full bg-white/10 px-8 py-4 backdrop-blur-md">
                <svg 
                  className="h-6 w-6 text-[#5CCFE6] animate-pulse" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" 
                  />
                </svg>
                <span className="text-xl font-medium text-white animate-pulse">
                  Toca para continuar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </KioscoContext.Provider>
  );
}

/* =========================
   Promo Carousel
========================= */
function PromoCarousel({
  promociones,
  files,
}: {
  promociones: Promocion[];
  files: string;
}) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const current = promociones[index];

  useEffect(() => {
    if (promociones.length <= 1) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % promociones.length);
        setIsTransitioning(false);
      }, 500);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [promociones]);

  return (
    <div className="relative h-full w-full">
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={
            current.img_flyer.startsWith("http")
              ? current.img_flyer
              : `${files}${current.img_flyer}`
          }
          alt={current.titulo}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>

      {/* Gradient overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Indicators */}
      {promociones.length > 1 && (
        <div className="absolute bottom-32 left-1/2 flex -translate-x-1/2 gap-2">
          {promociones.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index 
                  ? "w-8 bg-[#5CCFE6]" 
                  : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   Layout export
========================= */
export default function KioscoLayout({ children }: { children: ReactNode }) {
  return (
    <Guard allowedRoles={["kiosco"]}>
      <KioscoProvider>
        <main className="min-h-screen bg-background">{children}</main>
      </KioscoProvider>
    </Guard>
  );
}
