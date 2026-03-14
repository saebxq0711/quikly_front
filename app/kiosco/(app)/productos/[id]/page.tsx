"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useKiosco } from "../../../layout";
import {
  FaPlus,
  FaMinus,
  FaImage,
  FaArrowLeft,
  FaCheck,
  FaCartPlus,
  FaCircleInfo,
  FaStar,
} from "react-icons/fa6";

/* =========================
   Types
========================= */
type Opcion = {
  id: number;
  nombre: string;
  precio_adicional: number;
};

type GrupoOpcion = {
  id: number;
  nombre: string;
  tipo: string;
  obligatorio: boolean;
  min: number;
  max: number;
  opciones: Opcion[];
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
   Utils
========================= */
function buildSafeImageSrc(
  img?: string | null,
  filesBase?: string,
): string | null {
  if (!img) return null;
  const clean = img.trim();
  if (!clean) return null;
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("/") && filesBase) return `${filesBase}${clean}`;
  return null;
}

const money = (n: number) => `$${n.toLocaleString()}`;

/* =========================
   Page
========================= */
export default function ProductoPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart, resetInactivity } = useKiosco();

  const API = process.env.NEXT_PUBLIC_API_URL;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [seleccion, setSeleccion] = useState<Record<number, number[]>>({});
  const [imgError, setImgError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  /* =========================
     Load producto
  ========================= */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token || !API) return;

        const res = await fetch(`${API}/kiosco/productos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) return;

        const data = await res.json();
        setProducto(data);
      } catch (e) {
        console.error("Error loading product:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [API, id]);

  /* =========================
     Grupos válidos (defensa)
  ========================= */
  const gruposValidos = useMemo(() => {
    if (!producto) return [];
    return producto.grupos_opcion.filter(
      (g) => g.opciones && g.opciones.length > 0,
    );
  }, [producto]);

  const tamanos = gruposValidos.filter((g) => g.tipo === "tamaño");
  const toppings = gruposValidos.filter((g) => g.tipo !== "tamaño");

  /* =========================
     Toggle opciones
  ========================= */
  function toggle(grupo: GrupoOpcion, opcionId: number) {
    setSeleccion((prev) => {
      const current = prev[grupo.id] || [];

      if (current.includes(opcionId)) {
        return { ...prev, [grupo.id]: current.filter((i) => i !== opcionId) };
      }

      if (grupo.max && current.length >= grupo.max) return prev;

      return { ...prev, [grupo.id]: [...current, opcionId] };
    });
  }

  /* =========================
     Precio unitario
  ========================= */
  const precioUnitario = useMemo(() => {
    if (!producto) return 0;

    let extra = 0;
    gruposValidos.forEach((g) => {
      (seleccion[g.id] || []).forEach((opId) => {
        const op = g.opciones.find((o) => o.id === opId);
        if (op) extra += op.precio_adicional;
      });
    });

    const base = producto.tiene_promocion
      ? (producto.precio_final ?? producto.precio_base)
      : producto.precio_base;

    return base + extra;
  }, [producto, seleccion, gruposValidos]);

  const total = precioUnitario * cantidad;

  /* =========================
     Validación
  ========================= */
  function canAdd() {
    return gruposValidos.every((g) => {
      const count = seleccion[g.id]?.length || 0;
      if (g.obligatorio && count < g.min) return false;
      if (g.max && count > g.max) return false;
      return true;
    });
  }

  /* =========================
     Add to cart
  ========================= */
  function handleAdd() {
    if (!producto) return;

    const seleccionFinal = gruposValidos.flatMap((g) =>
      (seleccion[g.id] || []).map((oid) => {
        const o = g.opciones.find((x) => x.id === oid)!;
        return {
          grupo_id: g.id,
          grupo_nombre: g.nombre,
          opcion_id: o.id,
          opcion_nombre: o.nombre,
          precio_adicional: o.precio_adicional,
        };
      }),
    );

    addToCart({
      id_producto: producto.id,
      nombre: producto.nombre,
      precio: producto.tiene_promocion
        ? (producto.precio_final ?? producto.precio_base)
        : producto.precio_base,
      cantidad,
      seleccion: seleccionFinal,
      img: producto.img ?? undefined,
    });

    setAddedAnimation(true);
    resetInactivity();

    setTimeout(() => router.back(), 600);
  }

  /* =========================
     UI
  ========================= */
  if (loading) return null;
  if (!producto) return null;

  const imageSrc = buildSafeImageSrc(producto.img, FILES);
  const showImage = imageSrc && !imgError;

  /* =========================
     UI
  ========================= */
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
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
          Volver
        </span>
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div
          className={`relative aspect-square rounded-3xl bg-gradient-to-br from-muted to-muted/30 
                      overflow-hidden shadow-lg border border-border/30
                      ${addedAnimation ? "animate-scale-in" : ""}`}
        >
          {showImage ? (
            <Image
              src={imageSrc || "/placeholder.svg"}
              alt={producto.nombre}
              fill
              unoptimized
              onError={() => setImgError(true)}
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FaImage className="text-7xl text-muted-foreground/30" />
            </div>
          )}

          {producto.tiene_promocion && (
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold shadow">
              -{producto.porcentaje_descuento ?? 0}%
            </div>
          )}

          {/* Price badge */}
          <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-white/95 backdrop-blur shadow-lg">
            <span className="text-xs text-muted-foreground">Precio base</span>
            <div className="flex flex-col">
              {producto.tiene_promocion && (
                <span className="text-xs line-through text-muted-foreground">
                  {money(producto.precio_base)}
                </span>
              )}

              <p className="text-xl font-bold text-foreground">
                {money(
                  producto.tiene_promocion
                    ? (producto.precio_final ?? producto.precio_base)
                    : producto.precio_base,
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Title and description */}
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight text-balance">
              {producto.nombre}
            </h1>

            {producto.descripcion && (
              <p className="text-muted-foreground text-lg leading-relaxed">
                {producto.descripcion}
              </p>
            )}
          </div>

          {/* Tamanos */}
          {tamanos.length > 0 && (
            <div className="space-y-4">
              {tamanos.map((g) => {
                const selectedCount = seleccion[g.id]?.length || 0;

                return (
                  <section
                    key={g.id}
                    className="p-5 rounded-2xl bg-white border border-border/50 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {g.nombre}
                        </h3>
                        {g.obligatorio && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                            Requerido
                          </span>
                        )}
                      </div>
                      {g.max > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {selectedCount}/{g.max} seleccionado
                          {selectedCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <div className="grid gap-2">
                      {g.opciones.map((o) => {
                        const active = seleccion[g.id]?.includes(o.id);

                        return (
                          <button
                            key={o.id}
                            onClick={() => toggle(g, o.id)}
                            className={`group flex items-center justify-between p-4 rounded-xl border-2 
                                       transition-all duration-200 cursor-pointer
                                       ${
                                         active
                                           ? "border-[#5CCFE6] bg-[#5CCFE6]/5 shadow-sm"
                                           : "border-border/50 hover:border-[#5CCFE6]/30 hover:bg-muted/30"
                                       }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                            ${
                                              active
                                                ? "border-[#5CCFE6] bg-[#5CCFE6]"
                                                : "border-muted-foreground/30"
                                            }`}
                              >
                                {active && (
                                  <FaCheck className="w-3 h-3 text-black" />
                                )}
                              </div>
                              <span
                                className={`font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {o.nombre}
                              </span>
                            </div>
                            {o.precio_adicional > 0 && (
                              <span
                                className={`font-semibold ${active ? "text-[#5CCFE6]" : "text-muted-foreground"}`}
                              >
                                +{money(o.precio_adicional)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Toppings */}
          {toppings.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FaStar className="w-4 h-4 text-[#5CCFE6]" />
                <h2 className="text-lg font-semibold text-foreground">
                  Personaliza tu pedido
                </h2>
              </div>

              {toppings.map((g) => {
                const selectedCount = seleccion[g.id]?.length || 0;

                return (
                  <section
                    key={g.id}
                    className="p-5 rounded-2xl bg-white border border-border/50 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {g.nombre}
                        </h3>
                        {g.obligatorio ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                            Requerido
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                            Opcional
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {g.min > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Min: {g.min}
                          </span>
                        )}
                        {g.max > 0 && (
                          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                            {selectedCount}/{g.max}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {g.opciones.map((o) => {
                        const active = seleccion[g.id]?.includes(o.id);
                        const isDisabled =
                          !active && g.max > 0 && selectedCount >= g.max;

                        return (
                          <button
                            key={o.id}
                            onClick={() => !isDisabled && toggle(g, o.id)}
                            disabled={isDisabled}
                            className={`group flex items-center justify-between p-3.5 rounded-xl border-2 
                                       transition-all duration-200
                                       ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                       ${
                                         active
                                           ? "border-[#5CCFE6] bg-[#5CCFE6]/5"
                                           : "border-border/50 hover:border-[#5CCFE6]/30 hover:bg-muted/30"
                                       }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all
                                            ${
                                              active
                                                ? "border-[#5CCFE6] bg-[#5CCFE6]"
                                                : "border-muted-foreground/30"
                                            }`}
                              >
                                {active && (
                                  <FaCheck className="w-2.5 h-2.5 text-black" />
                                )}
                              </div>
                              <span
                                className={`text-sm font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}
                              >
                                {o.nombre}
                              </span>
                            </div>
                            {o.precio_adicional > 0 && (
                              <span
                                className={`text-sm font-semibold ${active ? "text-[#5CCFE6]" : "text-muted-foreground"}`}
                              >
                                +{money(o.precio_adicional)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Cantidad */}
          <div className="flex items-center justify-between p-5 rounded-2xl bg-white border border-border/50 shadow-sm">
            <span className="font-semibold text-foreground">Cantidad</span>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={cantidad <= 1}
                className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center
                           hover:bg-[#5CCFE6]/10 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-colors cursor-pointer"
              >
                <FaMinus className="w-4 h-4 text-foreground" />
              </button>

              <span className="text-2xl font-bold w-12 text-center">
                {cantidad}
              </span>

              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="w-12 h-12 rounded-xl bg-[#5CCFE6]/10 flex items-center justify-center
                           hover:bg-[#5CCFE6]/20 transition-colors cursor-pointer"
              >
                <FaPlus className="w-4 h-4 text-[#5CCFE6]" />
              </button>
            </div>
          </div>

          {/* Validation message */}
          {!canAdd() && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <FaCircleInfo className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Por favor selecciona las opciones requeridas para continuar
              </p>
            </div>
          )}

          {/* Add to cart button */}
          <button
            disabled={!canAdd()}
            onClick={handleAdd}
            className={`w-full py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3
                       transition-all duration-300 cursor-pointer
                       disabled:opacity-40 disabled:cursor-not-allowed
                       ${
                         addedAnimation
                           ? "bg-green-500 text-white scale-95"
                           : "bg-[#5CCFE6] text-black hover:bg-[#5CCFE6]/90 hover:shadow-lg hover:shadow-[#5CCFE6]/30"
                       }`}
          >
            {addedAnimation ? (
              <>
                <FaCheck className="w-5 h-5" />
                Agregado al carrito
              </>
            ) : (
              <>
                <FaCartPlus className="w-5 h-5" />
                Agregar al pedido - {money(total)}
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
