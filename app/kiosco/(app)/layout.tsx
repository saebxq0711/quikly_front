"use client";

import Image from "next/image";
import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useKiosco } from "../layout";

/* =========================
   Helpers
========================= */
const getItemExtrasTotal = (item: any) => {
  if (!Array.isArray(item.seleccion)) return 0;
  return item.seleccion.reduce(
    (total: number, o: any) => total + (o.precio_adicional ?? 0),
    0,
  );
};

const money = (n: number) => `$${n.toLocaleString()}`;

/* =========================
   Icons (inline SVG for performance)
========================= */
function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

/* =========================
   Layout
========================= */
export default function KioscoAppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    restaurante,
    cart,
    getItemCount,
    getTotal,
    clearCart,
    removeFromCart,
    updateQuantity,
  } = useKiosco();

  const FILES = process.env.NEXT_PUBLIC_FILES_URL!;
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);

  const getImageUrl = (path?: string | null): string | undefined => {
    if (!path) return undefined;
    return `${FILES.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  };

  const hideCartButton =
    pathname.startsWith("/kiosco/carrito") ||
    pathname.startsWith("/kiosco/checkout");
  const itemCount = getItemCount();

  const [imgError, setImgError] = useState<Record<string, boolean>>({});

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bounce animation when cart updates
  useEffect(() => {
    if (itemCount > 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 300);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ================= HEADER ================= */}
      <header
        className={`
          sticky top-0 z-40 
          bg-background/95 backdrop-blur-xl 
          border-b border-border/50
          transition-all duration-300
          ${isScrolled ? "shadow-lg shadow-black/5" : ""}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 sm:h-20 flex items-center justify-between gap-4">
            {/* Logo & Restaurant Name */}
            <button
              onClick={() => router.push("/kiosco")}
              className="flex items-center gap-3 sm:gap-4 cursor-pointer group"
            >
              {/* Logo Container */}
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-muted ring-2 ring-border/50 group-hover:ring-[#5CCFE6]/50 transition-all duration-300 flex-shrink-0">
                {restaurante?.logo ? (
                  <Image
                    src={getImageUrl(restaurante.logo)!}
                    alt={restaurante.nombre}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#5CCFE6]/20 to-[#5CCFE6]/5">
                    <span className="text-lg sm:text-xl font-bold text-[#5CCFE6]">
                      {restaurante?.nombre?.charAt(0) || "Q"}
                    </span>
                  </div>
                )}
              </div>

              {/* Restaurant Name */}
              <div className="flex flex-col items-start">
                <span className="text-base sm:text-lg font-semibold text-foreground group-hover:text-[#5CCFE6] transition-colors duration-300 line-clamp-1">
                  {restaurante?.nombre || "Restaurante"}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  Autoservicio
                </span>
              </div>
            </button>

            {/* Cart Button */}
            {!hideCartButton && (
              <button
                onClick={() => setShowCartPreview(true)}
                className={`
                  relative flex items-center gap-2 sm:gap-3
                  px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl
                  bg-[#5CCFE6] text-black font-semibold
                  shadow-lg shadow-[#5CCFE6]/25
                  hover:shadow-xl hover:shadow-[#5CCFE6]/30
                  hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-200
                  cursor-pointer
                  ${cartBounce ? "animate-bounce-soft" : ""}
                `}
              >
                <CartIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Carrito</span>

                {/* Item Count Badge */}
                {itemCount > 0 && (
                  <span
                    className="
                      absolute -top-2 -right-2
                      min-w-[24px] h-6 px-1.5 rounded-full
                      bg-black text-white text-xs font-bold
                      flex items-center justify-center
                      ring-2 ring-background
                      animate-scale-in
                    "
                  >
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#5CCFE6]/50 to-transparent" />
      </header>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 bg-background">{children}</main>

      {/* ================= CART DRAWER ================= */}
      <div
        className={`
          fixed inset-0 z-50
          transition-all duration-300
          ${showCartPreview ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={() => setShowCartPreview(false)}
        />

        {/* Drawer Panel */}
        <aside
          className={`
            absolute right-0 top-0 h-full w-full max-w-md
            bg-background
            shadow-2xl shadow-black/20
            transition-transform duration-300 ease-out
            flex flex-col
            ${showCartPreview ? "translate-x-0" : "translate-x-full"}
          `}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5CCFE6]/10 flex items-center justify-center">
                <CartIcon className="w-5 h-5 text-[#5CCFE6]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Tu Pedido
                </h3>
                <p className="text-sm text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "producto" : "productos"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCartPreview(false)}
              className="w-10 h-10 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center cursor-pointer transition-colors"
            >
              <CloseIcon className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <PackageIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">
                  Tu carrito esta vacio
                </h4>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Explora nuestro menu y agrega productos a tu pedido
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => {
                  const extras = getItemExtrasTotal(item);
                  const unitPrice = item.precio + extras;
                  const totalItem = unitPrice * item.cantidad;

                  const imgUrl = getImageUrl(item.img);
                  const showImg = !!imgUrl && !imgError[item.id];

                  const seleccionCount = item.seleccion?.length || 0;

                  return (
                    <div
                      key={item.id}
                      className="
                        group bg-muted/50 rounded-2xl p-4
                        border border-border/50
                        hover:border-[#5CCFE6]/30
                        transition-all duration-200
                        animate-fade-in-up
                      "
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex gap-4">
                        {/* Item Image/Placeholder */}
                        <div className="w-16 h-16 rounded-xl bg-background flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {showImg ? (
                            <Image
                              src={imgUrl as string} // 👈 aquí le dices a TS: “confía, no es null”
                              alt={item.nombre}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full"
                              unoptimized
                              onError={() =>
                                setImgError((prev) => ({
                                  ...prev,
                                  [item.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <PackageIcon className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {item.nombre}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {money(unitPrice)} c/u
                          </p>

                          {seleccionCount > 0 && (
                            <p className="text-xs text-[#5CCFE6] mt-1">
                              + {seleccionCount} extras
                            </p>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 self-start"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>

                      {/* Quantity & Price Row */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              if (item.cantidad > 1) {
                                updateQuantity(item.id, item.cantidad - 1);
                              } else {
                                removeFromCart(item.id);
                              }
                            }}
                            className="w-8 h-8 rounded-lg bg-background border border-border hover:border-[#5CCFE6] flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-foreground">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.cantidad + 1)
                            }
                            className="w-8 h-8 rounded-lg bg-[#5CCFE6] text-black flex items-center justify-center cursor-pointer hover:bg-[#5CCFE6]/90 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Total Price */}
                        <span className="font-semibold text-foreground">
                          {money(totalItem)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-border bg-muted/30">
              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-sm text-red-500 hover:text-red-600 cursor-pointer transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                Vaciar carrito
              </button>

              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">
                  {money(getTotal())}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowCartPreview(false);
                    router.push("/kiosco/carrito");
                  }}
                  className="
                    w-full py-4 rounded-xl
                    bg-[#5CCFE6] text-black font-bold text-lg
                    shadow-lg shadow-[#5CCFE6]/25
                    hover:shadow-xl hover:shadow-[#5CCFE6]/30
                    hover:scale-[1.01]
                    active:scale-[0.99]
                    transition-all duration-200
                    cursor-pointer
                    flex items-center justify-center gap-2
                  "
                >
                  Finalizar Pedido
                  <ChevronRightIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowCartPreview(false)}
                  className="
                    w-full py-3.5 rounded-xl
                    border-2 border-border
                    text-muted-foreground font-medium
                    hover:border-[#5CCFE6]/50 hover:text-foreground
                    transition-all duration-200
                    cursor-pointer
                  "
                >
                  Seguir ordenando
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
