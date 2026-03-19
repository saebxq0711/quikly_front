"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaCartShopping,
  FaArrowLeft,
  FaBagShopping,
  FaCircleCheck,
  FaReceipt,
  FaStar,
  FaArrowRight,
} from "react-icons/fa6";
import { useKiosco } from "../../layout";

/* =========================
   Types
========================= */
type ProductoSugerido = {
  id: number;
  nombre: string;
  precio_base: number;
  precio_final?: number;
  tiene_promocion?: boolean;
  porcentaje_descuento?: number;
  img?: string | null;
};

/* =========================
   Utils
========================= */
const money = (n: number) => `$${n.toLocaleString()}`;

const buildImgUrl = (files?: string, img?: string | null): string | null => {
  if (!img || !files) return null;
  if (img.startsWith("http")) return img;
  return `${files.replace(/\/$/, "")}/${img.replace(/^\//, "")}`;
};

/* =========================
   SVG Placeholder
========================= */
function ProductPlaceholderIcon({
  className = "w-10 h-10",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} text-muted-foreground/40`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 7h18" />
      <path d="M6 7v13h12V7" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
      <path d="M8 7l1-3h6l1 3" />
    </svg>
  );
}

/* =========================
   Skeleton Components
========================= */
function CartItemSkeleton() {
  return (
    <div className="flex gap-5 bg-white border border-border/50 rounded-2xl p-5 animate-pulse">
      <div className="w-24 h-24 rounded-xl bg-muted flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded-lg" />
        <div className="h-4 w-1/2 bg-muted/70 rounded-lg" />
        <div className="h-10 w-32 bg-muted/50 rounded-xl" />
      </div>
      <div className="h-6 w-20 bg-muted rounded-lg" />
    </div>
  );
}

function SuggestedSkeleton() {
  return (
    <div className="bg-white border border-border/50 rounded-2xl p-4 animate-pulse">
      <div className="aspect-square bg-muted rounded-xl mb-3" />
      <div className="h-4 w-3/4 bg-muted rounded-lg mb-2" />
      <div className="h-4 w-1/2 bg-muted/70 rounded-lg mb-3" />
      <div className="h-10 w-full bg-muted/50 rounded-xl" />
    </div>
  );
}

/* =========================
   Empty Cart Component
========================= */
function EmptyCart({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center mb-6 animate-bounce-soft">
        <FaBagShopping className="w-12 h-12 text-muted-foreground/50" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Tu carrito esta vacio
      </h2>
      <p className="text-muted-foreground max-w-sm mb-8">
        Agrega algunos productos deliciosos para comenzar tu pedido
      </p>
      <button
        onClick={onContinue}
        className="px-8 py-4 rounded-2xl bg-[#5CCFE6] text-black font-semibold
                   flex items-center gap-3 cursor-pointer
                   hover:bg-[#5CCFE6]/90 hover:shadow-lg hover:shadow-[#5CCFE6]/30
                   transition-all duration-300"
      >
        <FaCartShopping className="w-5 h-5" />
        Explorar menu
      </button>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function CarritoPage() {
  const router = useRouter();

  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    addToCart,
    resetInactivity,
  } = useKiosco();

  const API = process.env.NEXT_PUBLIC_API_URL;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL;

  const [sugeridos, setSugeridos] = useState<ProductoSugerido[]>([]);
  const [loadingSugeridos, setLoadingSugeridos] = useState(false);
  const [imgError, setImgError] = useState<Record<number | string, boolean>>(
    {},
  );
  const [removingItem, setRemovingItem] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState<number | null>(null);

  /* =========================
     Load sugeridos
  ========================= */
  let currentRequest = 0;

  const loadSugeridos = useCallback(async () => {
    const requestId = ++currentRequest;

    if (!API) return;
    setLoadingSugeridos(true);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const excludeIds = cart.map((c) => c.id_producto).join(",");

      const res = await fetch(
        `${API}/kiosco/productos/sugeridos?limit=4&exclude_ids=${excludeIds}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) return;

      const data: ProductoSugerido[] = await res.json();

      // 🔥 evita race condition
      if (requestId !== currentRequest) return;

      setSugeridos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSugeridos(false);
    }
  }, [API]);

  useEffect(() => {
    loadSugeridos();
  }, [loadSugeridos]);

  /* =========================
     Handlers
  ========================= */
  const handleRemove = (itemId: string) => {
    setRemovingItem(itemId);
    setTimeout(() => {
      removeFromCart(itemId);
      setRemovingItem(null);
    }, 300);
  };

  const handleAddSuggested = (p: ProductoSugerido) => {
    setAddingItem(p.id);

    // 1. Agregar al carrito
    addToCart({
      id_producto: p.id,
      nombre: p.nombre,
      precio: p.tiene_promocion
        ? (p.precio_final ?? p.precio_base)
        : p.precio_base,
      cantidad: 1,
      seleccion: [],
      img: p.img,
    });

    // 2. Quitar inmediatamente de sugeridos (UI reactiva)
    setSugeridos((prev) => prev.filter((x) => x.id !== p.id));

    resetInactivity();

    setTimeout(() => {
      setAddingItem(null);
    }, 300);
  };

  /* =========================
     Empty state
  ========================= */
  if (cart.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <EmptyCart onContinue={() => router.push("/kiosco/categorias")} />
      </main>
    );
  }

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white border border-border/50 shadow-sm 
                       flex items-center justify-center cursor-pointer
                       hover:border-[#5CCFE6]/50 hover:shadow-md transition-all"
          >
            <FaArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Tu Pedido
            </h1>
            <p className="text-sm text-muted-foreground">
              {totalItems} producto{totalItems !== 1 ? "s" : ""} en tu carrito
            </p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                     text-red-500 bg-red-50 border border-red-100
                     hover:bg-red-100 transition-colors cursor-pointer"
        >
          <FaTrash className="w-4 h-4" />
          <span className="font-medium">Vaciar carrito</span>
        </button>
      </header>

      {/* Grid Layout */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Cart Items */}
        <section className="space-y-4">
          {cart.map((item, index) => {
            const extras =
              item.seleccion?.reduce(
                (t, o) => t + (o.precio_adicional ?? 0),
                0,
              ) || 0;

            const precioUnitario = item.precio + extras;
            const subtotal = precioUnitario * item.cantidad;

            const imgUrl = buildImgUrl(FILES, item.img);
            const showImg = imgUrl && !imgError[item.id];
            const isRemoving = removingItem === item.id;

            return (
              <article
                key={item.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`flex gap-5 bg-white border border-border/50 rounded-2xl p-5
                           shadow-sm opacity-0 animate-fade-in-up
                           hover:shadow-md hover:border-[#5CCFE6]/20 transition-all
                           ${isRemoving ? "scale-95 opacity-50" : ""}`}
              >
                {/* Image */}
                <div
                  onClick={() =>
                    router.push(`/kiosco/productos/${item.id_producto}`)
                  }
                  className="relative w-24 h-24 rounded-xl bg-gradient-to-br from-muted to-muted/30 overflow-hidden flex-shrink-0 flex items-center justify-center"
                >
                  {showImg ? (
                    <Image
                      src={imgUrl! || "/placeholder.svg"}
                      alt={item.nombre}
                      fill
                      unoptimized
                      onError={() =>
                        setImgError((p) => ({ ...p, [item.id]: true }))
                      }
                      className="object-cover"
                    />
                  ) : (
                    <ProductPlaceholderIcon />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    onClick={() =>
                      router.push(`/kiosco/productos/${item.id_producto}`)
                    }
                    className="font-semibold text-lg text-foreground truncate"
                  >
                    {item.nombre}
                  </h3>

                  <p className="text-sm text-muted-foreground mt-0.5">
                    {money(item.precio)} c/u
                  </p>

                  {/* Selected options */}
                  {item.seleccion && item.seleccion.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.seleccion.map((o) => (
                        <span
                          key={o.opcion_id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg
                                     bg-[#5CCFE6]/10 text-[#5CCFE6] text-xs font-medium"
                        >
                          {o.opcion_nombre}
                          {o.precio_adicional > 0 && (
                            <span className="text-[#5CCFE6]/70">
                              +{money(o.precio_adicional)}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center rounded-xl border border-border/50 overflow-hidden">
                      <button
                        onClick={() => {
                          resetInactivity();
                          updateQuantity(item.id, item.cantidad - 1);
                        }}
                        className="w-10 h-10 flex items-center justify-center
                                   hover:bg-muted transition-colors cursor-pointer"
                      >
                        <FaMinus className="w-3 h-3 text-muted-foreground" />
                      </button>

                      <span className="w-10 text-center font-semibold text-foreground">
                        {item.cantidad}
                      </span>

                      <button
                        onClick={() => {
                          resetInactivity();
                          updateQuantity(item.id, item.cantidad + 1);
                        }}
                        className="w-10 h-10 flex items-center justify-center
                                   hover:bg-[#5CCFE6]/10 transition-colors cursor-pointer"
                      >
                        <FaPlus className="w-3 h-3 text-[#5CCFE6]" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2.5 rounded-xl text-red-400 hover:text-red-500
                                 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex flex-col items-end justify-between">
                  <span className="text-xl font-bold text-foreground">
                    {money(subtotal)}
                  </span>
                </div>
              </article>
            );
          })}
        </section>

        {/* Summary Sidebar */}
        <aside className="lg:sticky lg:top-24 h-fit space-y-6">
          {/* Order Summary */}
          <div className="bg-white border border-border/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#5CCFE6]/10 flex items-center justify-center">
                <FaReceipt className="w-5 h-5 text-[#5CCFE6]" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Resumen del pedido
              </h2>
            </div>

            <div className="space-y-3 pb-4 border-b border-border/50">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({totalItems} items)</span>
                <span>{money(getTotal())}</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-lg font-semibold text-foreground">
                Total
              </span>
              <span className="text-2xl font-bold text-foreground">
                {money(getTotal())}
              </span>
            </div>

            <button
              onClick={() => cart.length > 0 && router.push("/kiosco/checkout")}
              disabled={cart.length === 0}
              className="w-full py-4 rounded-2xl bg-[#5CCFE6] text-black font-semibold text-lg
                         flex items-center justify-center gap-3 cursor-pointer
                         hover:bg-[#5CCFE6]/90 hover:shadow-lg hover:shadow-[#5CCFE6]/30
                         active:scale-[0.98] transition-all duration-300"
            >
              <FaCircleCheck className="w-5 h-5" />
              Confirmar pedido
            </button>

            <button
              onClick={() => router.push("/kiosco/categorias")}
              className="w-full py-3.5 mt-3 rounded-2xl border-2 border-border/50 
                         text-foreground font-semibold cursor-pointer
                         hover:border-[#5CCFE6]/30 hover:bg-muted/30
                         transition-all duration-300 flex items-center justify-center gap-2"
            >
              Seguir comprando
              <FaArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>
      </div>

      {/* Suggested Products */}
      {sugeridos.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#5CCFE6]/10 flex items-center justify-center">
              <FaStar className="w-5 h-5 text-[#5CCFE6]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Te puede interesar
              </h2>
              <p className="text-sm text-muted-foreground">
                Agrega algo mas a tu pedido
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingSugeridos
              ? [...Array(4)].map((_, i) => <SuggestedSkeleton key={i} />)
              : sugeridos.map((p, index) => {
                  const imgUrl = buildImgUrl(FILES, p.img);
                  const showImg = imgUrl && !imgError[p.id];
                  const isAdding = addingItem === p.id;

                  return (
                    <div
                      key={p.id}
                      style={{ animationDelay: `${index * 100}ms` }}
                      className={`bg-white border border-border/50 rounded-2xl p-4 
                                 opacity-0 animate-fade-in-up
                                 hover:shadow-lg hover:border-[#5CCFE6]/30 transition-all
                                 ${isAdding ? "ring-2 ring-[#5CCFE6]" : ""}`}
                    >
                      <div
                        onClick={() => router.push(`/kiosco/productos/${p.id}`)}
                        className="relative aspect-square bg-gradient-to-br from-muted to-muted/30 rounded-xl mb-3 overflow-hidden flex items-center justify-center"
                      >
                        {showImg ? (
                          <Image
                            src={imgUrl! || "/placeholder.svg"}
                            alt={p.nombre}
                            fill
                            unoptimized
                            onError={() =>
                              setImgError((prev) => ({
                                ...prev,
                                [p.id]: true,
                              }))
                            }
                            className="object-cover"
                          />
                        ) : (
                          <ProductPlaceholderIcon className="w-12 h-12" />
                        )}
                      </div>

                      {p.tiene_promocion && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-semibold shadow">
                          -{p.porcentaje_descuento ?? 0}%
                        </div>
                      )}

                      <h3
                        onClick={() => router.push(`/kiosco/productos/${p.id}`)}
                        className="font-medium text-foreground line-clamp-1"
                      >
                        {p.nombre}
                      </h3>
                      <div className="mb-3">
                        {p.tiene_promocion && (
                          <span className="text-xs line-through text-muted-foreground">
                            {money(p.precio_base)}
                          </span>
                        )}

                        <p className="text-sm font-semibold text-foreground">
                          {money(
                            p.tiene_promocion
                              ? (p.precio_final ?? p.precio_base)
                              : p.precio_base,
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => handleAddSuggested(p)}
                        disabled={isAdding}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                                   font-medium cursor-pointer transition-all duration-300
                                   ${
                                     isAdding
                                       ? "bg-green-500 text-white"
                                       : "bg-[#5CCFE6]/10 text-[#5CCFE6] hover:bg-[#5CCFE6] hover:text-black"
                                   }`}
                      >
                        {isAdding ? (
                          <>
                            <FaCircleCheck className="w-4 h-4" />
                            Agregado
                          </>
                        ) : (
                          <>
                            <FaCartShopping className="w-4 h-4" />
                            Agregar
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
          </div>
        </section>
      )}
    </main>
  );
}
