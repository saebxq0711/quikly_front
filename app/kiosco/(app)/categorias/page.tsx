"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useKiosco } from "../../layout";

/* =========================
   Types
========================= */
type Categoria = {
  id: number;
  nombre: string;
  img?: string | null;
};

/* =========================
   Utils
========================= */
const buildFileUrl = (filesBase: string, path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${filesBase}${path.startsWith("/") ? "" : "/"}${path}`;
};

/* =========================
   Icons
========================= */
function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/* =========================
   Loading Skeleton
========================= */
function CategorySkeleton() {
  return (
    <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-muted animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="h-6 w-2/3 bg-muted-foreground/20 rounded-lg" />
      </div>
    </div>
  );
}

/* =========================
   Page
========================= */
export default function CategoriasPage() {
  const router = useRouter();
  const { restaurante } = useKiosco();

  const API = process.env.NEXT_PUBLIC_API_URL!;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL!;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  /* =========================
     Load categorias
  ========================= */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API}/kiosco/categorias`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Categorias error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  /* =========================
     Loading State
  ========================= */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="h-8 w-64 bg-muted rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-48 bg-muted rounded-lg animate-pulse" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <CategorySkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <header className="mb-8 sm:mb-12 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#5CCFE6]/10 flex items-center justify-center">
            <GridIcon className="w-5 h-5 text-[#5CCFE6]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Nuestro Menu
          </h1>
        </div>
        <p className="text-muted-foreground mt-2 ml-[52px]">
          Selecciona una categoria para ver los productos
        </p>
      </header>

      {/* Categories Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {categorias.map((cat, index) => {
          const imgUrl = buildFileUrl(FILES, cat.img);
          const showImage = imgUrl && !imgError[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => router.push(`/kiosco/categorias/${cat.id}`)}
              className="
                group relative h-48 sm:h-56 rounded-2xl overflow-hidden
                bg-muted
                ring-2 ring-border/50
                hover:ring-[#5CCFE6]/50
                shadow-md hover:shadow-xl hover:shadow-[#5CCFE6]/10
                transition-all duration-300
                active:scale-[0.98]
                focus:outline-none focus:ring-[#5CCFE6]
                cursor-pointer
                animate-fade-in-up
              "
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Background Image */}
              {showImage && (
                <Image
                  src={imgUrl! || "/placeholder.svg"}
                  alt={cat.nombre}
                  fill
                  unoptimized
                  onError={() => setImgError((prev) => ({ ...prev, [cat.id]: true }))}
                  className="
                    object-cover
                    transition-transform duration-500 ease-out
                    group-hover:scale-110
                  "
                />
              )}

              {/* Placeholder when no image */}
              {!showImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted to-muted/80">
                  <div className="w-16 h-16 rounded-2xl bg-[#5CCFE6]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <GridIcon className="w-8 h-8 text-[#5CCFE6]" />
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div 
                className="
                  absolute inset-0 
                  bg-gradient-to-t from-black/80 via-black/40 to-transparent
                  group-hover:from-black/90 group-hover:via-black/50
                  transition-all duration-300
                " 
              />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-white text-lg sm:text-xl font-semibold tracking-tight">
                    {cat.nombre}
                  </h3>
                  <div 
                    className="
                      w-8 h-8 rounded-full 
                      bg-white/10 backdrop-blur-sm
                      flex items-center justify-center
                      group-hover:bg-[#5CCFE6] group-hover:text-black
                      transition-all duration-300
                      transform group-hover:translate-x-1
                    "
                  >
                    <ChevronRightIcon className="w-4 h-4 text-white group-hover:text-black" />
                  </div>
                </div>
              </div>

              {/* Hover Accent Line */}
              <div 
                className="
                  absolute bottom-0 left-0 right-0 h-1
                  bg-[#5CCFE6]
                  transform scale-x-0 origin-left
                  group-hover:scale-x-100
                  transition-transform duration-300
                "
              />
            </button>
          );
        })}
      </section>

      {/* Empty State */}
      {categorias.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <GridIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No hay categorias disponibles
          </h3>
          <p className="text-muted-foreground max-w-[280px]">
            El menu estara disponible pronto. Por favor, intenta mas tarde.
          </p>
        </div>
      )}
    </main>
  );
}
