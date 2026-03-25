"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import HeaderAdmin from "../../components/HeaderAdmin";
import SidebarAdmin from "../../components/SidebarAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Phone,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  ArrowLeft,
  ShoppingBag,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  User,
  Receipt,
  ImageOff,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type Opcion = {
  nombre_opcion: string;
  tipo_opcion: string;
};

type Producto = {
  nombre_producto: string;
  cantidad: number;
  subtotal: number;
  imagen_url?: string;
  opciones: Opcion[];
};

type Pedido = {
  id_pedido: number;
  cliente_nombres: string;
  cliente_telefono: string;
  estado_id: number;
  total: number;
  fecha_creacion: string;
  productos: Producto[];
};

const ESTADO_CONFIG: Record<
  number,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ElementType;
    dotColor: string;
  }
> = {
  4: {
    label: "Aprobado",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: CheckCircle2,
    dotColor: "bg-blue-500",
  },
  5: {
    label: "Pendiente",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    icon: Clock,
    dotColor: "bg-amber-500",
  },
  6: {
    label: "Rechazado",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: XCircle,
    dotColor: "bg-red-500",
  },
  7: {
    label: "Entregado",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    icon: Package,
    dotColor: "bg-emerald-500",
  },
};

const TRANSICIONES: Record<number, number[]> = {
  5: [4, 6],
  4: [7],
  6: [],
  7: [],
};

const normalize = (text: string) =>
  (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Componente de imagen con fallback
function ProductImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const showFallback = error || !src;

  if (showFallback) {
    return (
      <div
        className={`${className} bg-muted/50 flex items-center justify-center`}
      >
        <ImageOff className="w-6 h-6 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div className={`${className} relative overflow-hidden bg-muted/50`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#5CCFE6]/20 border-t-[#5CCFE6] rounded-full animate-spin" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${loading ? "opacity-0" : "opacity-100"}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        unoptimized
      />
    </div>
  );
}

export default function PedidosPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL!;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API}/admin/pedidos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPedidos(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, estadoFilter]);

  const updateEstado = async (id: number, estado_id: number) => {
    const token = localStorage.getItem("access_token");

    setPedidos((prev) =>
      prev.map((p) => (p.id_pedido === id ? { ...p, estado_id } : p)),
    );

    if (selected && selected.id_pedido === id) {
      setSelected({ ...selected, estado_id });
    }

    await fetch(`${API}/admin/pedidos/${id}/estado`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ estado_id }),
    });
  };

  const filtered = pedidos.filter((p) => {
    const s = normalize(search);
    const matchSearch =
      normalize(p.cliente_nombres).includes(s) ||
      p.id_pedido.toString().includes(s) ||
      (p.cliente_telefono || "").includes(s);
    const matchEstado = estadoFilter === null || p.estado_id === estadoFilter;
    return matchSearch && matchEstado;
  });

  // Calculos de paginacion
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPedidos = filtered.slice(startIndex, endIndex);

  // Generar numeros de pagina visibles
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const estadoCounts = pedidos.reduce(
    (acc, p) => {
      acc[p.estado_id] = (acc[p.estado_id] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#5CCFE6]/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-[#5CCFE6] border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-semibold">
                  Cargando pedidos
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Por favor espera un momento...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#5CCFE6]/10">
                <Sparkles className="w-6 h-6 text-[#5CCFE6]" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                  Todos los Pedidos
                </h1>
                <p className="text-muted-foreground mt-0.5">
                  Busca por nombre, ID (#123) o telefono
                </p>
              </div>
            </div>

            <Button
              onClick={() => router.push("/admin/pedidos")}
              variant="outline"
              className="rounded-xl px-5 h-11 font-medium border-border/50 hover:bg-muted/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>

          {/* Search */}
          <Card className="p-4 bg-card border border-border/50 rounded-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                placeholder="Ej: Cliente, Id pedido, Telefono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-muted/50 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#5CCFE6] focus:bg-background transition-all"
              />
            </div>
          </Card>

          {/* Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setEstadoFilter(null)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                estadoFilter === null
                  ? "bg-foreground text-background shadow-lg shadow-foreground/20"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Todos
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  estadoFilter === null
                    ? "bg-background/20 text-background"
                    : "bg-foreground/10 text-foreground"
                }`}
              >
                {pedidos.length}
              </span>
            </button>

            {Object.entries(ESTADO_CONFIG).map(([id, config]) => {
              const Icon = config.icon;
              const isActive = estadoFilter === Number(id);
              const count = estadoCounts[Number(id)] || 0;

              return (
                <button
                  key={id}
                  onClick={() => setEstadoFilter(Number(id))}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                      : "bg-muted/50 text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                      isActive
                        ? `${config.bgColor} ${config.color}`
                        : "bg-foreground/10 text-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Results summary */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {startIndex + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(endIndex, filtered.length)}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-foreground">
                  {filtered.length}
                </span>{" "}
                pedidos
              </p>
            </div>
          )}

          {/* Cards Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-foreground font-semibold text-lg">
                No se encontraron pedidos
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Intenta ajustar los filtros de busqueda
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5">
                {paginatedPedidos.map((p) => {
                  const estado = ESTADO_CONFIG[p.estado_id];
                  const Icon = estado?.icon || Package;

                  return (
                    <Card
                      key={p.id_pedido}
                      className="group relative overflow-hidden p-5 bg-card border border-border/50 rounded-2xl hover:border-[#5CCFE6]/50 hover:shadow-xl hover:shadow-[#5CCFE6]/5 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelected(p)}
                    >
                      {/* Status indicator line */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 ${estado?.dotColor || "bg-gray-400"}`}
                      />

                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-foreground/5 font-mono text-sm font-bold text-foreground group-hover:bg-[#5CCFE6]/10 group-hover:text-[#5CCFE6] transition-colors">
                          #{p.id_pedido}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${estado?.bgColor} ${estado?.color} ${estado?.borderColor}`}
                        >
                          <Icon className="w-3 h-3" />
                          {estado?.label}
                        </span>
                      </div>

                      {/* Client info */}
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <p className="font-semibold text-foreground truncate">
                            {p.cliente_nombres}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-sm">{p.cliente_telefono}</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-muted-foreground mb-4 pb-4 border-b border-border/50">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">
                          {new Date(p.fecha_creacion).toLocaleDateString(
                            "es-ES",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>

                      {/* Products preview */}
                      <div className="space-y-2 mb-4">
                        {p.productos.slice(0, 2).map((prod, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {prod.cantidad}x
                            </span>
                            <span className="text-foreground truncate flex-1">
                              {prod.nombre_producto}
                            </span>
                          </div>
                        ))}
                        {p.productos.length > 2 && (
                          <p className="text-xs text-muted-foreground pl-8">
                            +{p.productos.length - 2} mas
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className="text-xl font-bold text-foreground">
                          ${p.total.toLocaleString("es-CO")}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5CCFE6] group-hover:gap-2 transition-all">
                          <Eye className="w-4 h-4" />
                          Ver detalle
                          <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Card className="p-4 bg-card border border-border/50 rounded-2xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Info */}
                    <p className="text-sm text-muted-foreground order-2 sm:order-1">
                      Pagina{" "}
                      <span className="font-semibold text-foreground">
                        {currentPage}
                      </span>{" "}
                      de{" "}
                      <span className="font-semibold text-foreground">
                        {totalPages}
                      </span>
                    </p>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5 order-1 sm:order-2">
                      {/* First page */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-10 w-10 rounded-xl border-border/50 hover:bg-muted/50 hover:border-[#5CCFE6]/50 disabled:opacity-40"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>

                      {/* Previous */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="h-10 w-10 rounded-xl border-border/50 hover:bg-muted/50 hover:border-[#5CCFE6]/50 disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      {/* Page numbers */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {getVisiblePages().map((page, index) =>
                          page === "..." ? (
                            <span
                              key={`dots-${index}`}
                              className="w-10 h-10 flex items-center justify-center text-muted-foreground"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="icon"
                              onClick={() => setCurrentPage(page as number)}
                              className={`h-10 w-10 rounded-xl font-medium transition-all ${
                                currentPage === page
                                  ? "bg-[#5CCFE6] text-foreground hover:bg-[#5CCFE6]/90 border-[#5CCFE6]"
                                  : "border-border/50 hover:bg-muted/50 hover:border-[#5CCFE6]/50"
                              }`}
                            >
                              {page}
                            </Button>
                          ),
                        )}
                      </div>

                      {/* Mobile page indicator */}
                      <div className="flex sm:hidden items-center gap-2 px-3">
                        <input
                          type="number"
                          min={1}
                          max={totalPages}
                          value={currentPage}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 1 && val <= totalPages) {
                              setCurrentPage(val);
                            }
                          }}
                          className="w-14 h-10 rounded-xl bg-muted/50 border border-border/50 text-center text-sm font-medium focus:outline-none focus:border-[#5CCFE6]"
                        />
                        <span className="text-muted-foreground text-sm">
                          / {totalPages}
                        </span>
                      </div>

                      {/* Next */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 rounded-xl border-border/50 hover:bg-muted/50 hover:border-[#5CCFE6]/50 disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>

                      {/* Last page */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-10 w-10 rounded-xl border-border/50 hover:bg-muted/50 hover:border-[#5CCFE6]/50 disabled:opacity-40"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-foreground/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative p-6 border-b border-border/50">
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${ESTADO_CONFIG[selected.estado_id]?.dotColor || "bg-gray-400"}`}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#5CCFE6]/10">
                    <Receipt className="w-6 h-6 text-[#5CCFE6]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Pedido #{selected.id_pedido}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {new Date(selected.fecha_creacion).toLocaleDateString(
                        "es-ES",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-auto">
              {/* Client Info */}
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Informacion del cliente
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#5CCFE6]/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-[#5CCFE6]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {selected.cliente_nombres}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" />
                      {selected.cliente_telefono}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Productos ({selected.productos.length})
                </p>
                <div className="space-y-3">
                  {selected.productos.map((prod, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50"
                    >
                      <ProductImage
                        src={prod.imagen_url}
                        alt={prod.nombre_producto}
                        className="w-16 h-16 rounded-xl flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-foreground">
                              {prod.nombre_producto}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#5CCFE6]/10 text-[#5CCFE6] text-xs font-bold mt-1">
                              {prod.cantidad}x unidades
                            </span>
                          </div>
                          <span className="text-lg font-bold text-foreground whitespace-nowrap">
                            ${prod.subtotal.toLocaleString("es-CO")}
                          </span>
                        </div>

                        {prod.opciones?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {prod.opciones.map((o, j) => (
                              <span
                                key={j}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs"
                              >
                                + {o.nombre_opcion}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border/50 bg-muted/20">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Total */}
                <div className="bg-foreground/5 rounded-xl px-5 py-3">
                  <p className="text-xs text-muted-foreground">
                    Total del pedido
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ${selected.total.toLocaleString("es-CO")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {(TRANSICIONES[selected.estado_id] || []).length > 0 ? (
                    (TRANSICIONES[selected.estado_id] || []).map(
                      (e: number) => {
                        const config = ESTADO_CONFIG[e];
                        const Icon = config?.icon || Package;
                        return (
                          <Button
                            key={e}
                            onClick={() => updateEstado(selected.id_pedido, e)}
                            className={`rounded-xl px-5 h-11 font-medium ${
                              e === 4
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : e === 6
                                  ? "bg-red-500 hover:bg-red-600 text-white"
                                  : e === 7
                                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                    : "bg-foreground text-background"
                            }`}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {config?.label}
                          </Button>
                        );
                      },
                    )
                  ) : (
                    <span className="px-4 py-2 text-sm text-muted-foreground bg-muted/50 rounded-xl">
                      Estado final alcanzado
                    </span>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setSelected(null)}
                    className="rounded-xl px-5 h-11 font-medium"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
