"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useKiosco } from "../../../layout";
import {
  FaImage,
  FaArrowLeft,
  FaStar,
  FaChevronRight,
  FaUtensils,
} from "react-icons/fa6";

/* =========================
   Types
========================= */
type GrupoOpcion = {
  id: number;
  nombre: string;
  tipo: "tamaño" | "topping";
  obligatorio: boolean;
  min: number;
  max: number;
  opciones: {
    id: number;
    nombre: string;
    precio_adicional: number;
  }[];
};

type Producto = {
  id: number;
  nombre: string;
  descripcion?: string;

  precio_base: number;
  precio_final?: number;

  tiene_promocion?: boolean;
  porcentaje_descuento?: number;

  img?: string | null;
  grupos_opcion: GrupoOpcion[];
};

/* =========================
   Image utils
========================= */
function buildSafeImageSrc(
  img?: string | null,
  filesBase?: string
): string | null {
  if (!img) return null;

  const clean = img.trim();
  if (!clean) return null;

  try {
    if (clean.startsWith("http")) {
      new URL(clean);
      return clean;
    }
  } catch {
    return null;
  }

  if (clean.startsWith("/")) {
    if (!filesBase) return null;

    try {
      const full = `${filesBase}${clean}`;
      new URL(full);
      return full;
    } catch {
      return null;
    }
  }

  return null;
}

/* =========================
   Skeleton Loader
========================= */
function ProductSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white border border-border/50 shadow-sm">
      <div className="relative h-52 bg-gradient-to-br from-muted to-muted/50 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded-lg animate-pulse" />
        <div className="h-4 w-full bg-muted/70 rounded-lg animate-pulse" />
        <div className="h-4 w-2/3 bg-muted/50 rounded-lg animate-pulse" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 bg-muted rounded-lg animate-pulse" />
          <div className="h-8 w-28 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* =========================
   Empty State
========================= */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <FaUtensils className="w-10 h-10 text-muted-foreground/50" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        No hay productos disponibles
      </h3>
      <p className="text-muted-foreground max-w-sm">
        Esta categoria no tiene productos disponibles en este momento. Intenta
        con otra categoria.
      </p>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function CategoriaProductosPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { resetInactivity } = useKiosco();

  const API = process.env.NEXT_PUBLIC_API_URL;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  /* =========================
     Load productos
  ========================= */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token || !API) return;

        const res = await fetch(`${API}/kiosco/categorias/${id}/productos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Productos error", e);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [API, id]);

  /* =========================
     Loading State
  ========================= */
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-10 w-40 bg-muted rounded-xl animate-pulse mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-3 mb-8 px-4 py-2.5 rounded-xl 
                   bg-white border border-border/50 shadow-sm
                   hover:border-[#5CCFE6]/50 hover:shadow-md
                   transition-all duration-300 cursor-pointer"
      >
        <div
          className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center
                      group-hover:bg-[#5CCFE6]/10 transition-colors duration-300"
        >
          <FaArrowLeft className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#5CCFE6] transition-colors" />
        </div>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          Volver a categorias
        </span>
      </button>

      {productos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">
              {productos.length} producto
              {productos.length !== 1 ? "s" : ""} encontrado
              {productos.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((p, i) => {
              const imageSrc = buildSafeImageSrc(p.img, FILES);
              const hasError = imgErrors[p.id];
              const showImage = imageSrc && !hasError;

              const hasToppings = p.grupos_opcion?.some(
                (g) => g.tipo !== "tamaño"
              );

              const precioMostrar = p.tiene_promocion
                ? p.precio_final ?? p.precio_base
                : p.precio_base;

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    resetInactivity();
                    router.push(`/kiosco/productos/${p.id}`);
                  }}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="group relative rounded-3xl overflow-hidden
                             bg-white border border-border/50 shadow-sm
                             opacity-0 animate-fade-in-up
                             hover:shadow-xl hover:border-[#5CCFE6]/30
                             hover:-translate-y-1
                             active:scale-[0.98]
                             transition-all duration-300 cursor-pointer
                             text-left"
                >
                  {/* Image */}
                  <div className="relative h-52 bg-gradient-to-br from-muted to-muted/30 overflow-hidden">
                    {showImage ? (
                      <Image
                        src={imageSrc || "/placeholder.svg"}
                        alt={p.nombre}
                        fill
                        unoptimized
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [p.id]: true }))
                        }
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FaImage className="text-5xl text-muted-foreground/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Personalizable */}
                    {hasToppings && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#5CCFE6] text-black text-xs font-medium flex items-center gap-1">
                        <FaStar className="w-2.5 h-2.5" />
                        Personalizable
                      </div>
                    )}

                    {/* PROMO BADGE */}
                    {p.tiene_promocion && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-semibold shadow">
                        -{p.porcentaje_descuento ?? 0}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground tracking-tight line-clamp-1 group-hover:text-[#5CCFE6] transition-colors">
                      {p.nombre}
                    </h3>

                    {p.descripcion && (
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
                        {p.descripcion}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {p.tiene_promocion ? "Promoción" : "Desde"}
                        </span>

                        {p.tiene_promocion && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${p.precio_base.toLocaleString()}
                          </span>
                        )}

                        <span className="text-xl font-bold text-foreground">
                          ${precioMostrar.toLocaleString()}
                        </span>
                      </div>

                      <div
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full
                                    bg-[#5CCFE6]/10 text-[#5CCFE6] 
                                    group-hover:bg-[#5CCFE6] group-hover:text-black
                                    transition-all duration-300"
                      >
                        <span className="text-sm font-medium">Ver</span>
                        <FaChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#5CCFE6] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}