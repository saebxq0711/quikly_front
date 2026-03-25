"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderAdmin from "../components/HeaderAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Calendar,
  Eye,
  LayoutGrid,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

type Pedido = {
  id_pedido: number;
  cliente_nombres: string;
  cliente_telefono: string;
  estado_id: number;
  total: number;
  fecha_creacion: string;
  productos: {
    nombre_producto: string;
    cantidad: number;
    subtotal: number;
    opciones?: {
      tipo_opcion: string;
      nombre_opcion: string;
      precio_adicional: number;
    }[];
  }[];
};

const ESTADO_CONFIG: Record<
  number,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ElementType;
    gradient: string;
  }
> = {
  4: {
    label: "Aprobado",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: CheckCircle2,
    gradient: "from-blue-500 to-blue-600",
  },
  5: {
    label: "Pendiente",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    icon: Clock,
    gradient: "from-amber-500 to-amber-600",
  },
  6: {
    label: "Rechazado",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: XCircle,
    gradient: "from-red-500 to-red-600",
  },
  7: {
    label: "Entregado",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    icon: Package,
    gradient: "from-emerald-500 to-emerald-600",
  },
};

const ESTADO_CHART_COLORS: Record<number, string> = {
  4: "#3b82f6",
  5: "#f59e0b",
  6: "#ef4444",
  7: "#10b981",
};

const TRANSICIONES_VALIDAS: Record<number, number[]> = {
  5: [4, 6],
  4: [7],
  6: [],
  7: [],
};

const getEstadosDisponibles = (estadoActual: number): number[] => {
  return TRANSICIONES_VALIDAS[estadoActual] || [];
};

export default function PedidosAdminPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL!;

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<keyof Pedido>("id_pedido");
  const [sortAsc, setSortAsc] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<number | null>(null);

  const toggleRow = (id: number) =>
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const loadPedidos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await fetch(`${API}/admin/pedidos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data: Pedido[] = await res.json();
      setPedidos(data);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (id: number, estado_id: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    setPedidos((prev) =>
      prev.map((p) => (p.id_pedido === id ? { ...p, estado_id } : p)),
    );

    try {
      const res = await fetch(`${API}/admin/pedidos/${id}/estado`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado_id }),
      });

      if (!res.ok) {
        throw new Error("Error actualizando estado");
      }
    } catch (error) {
      console.error(error);
      loadPedidos();
    }
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  // KPIs
  const ventasValidas = pedidos.filter(
    (p) => p.estado_id === 4 || p.estado_id === 7,
  );
  const totalVentas = ventasValidas.reduce((a, p) => a + p.total, 0);
  const ticketPromedio = ventasValidas.length
    ? totalVentas / ventasValidas.length
    : 0;
  const pedidosPendientes = pedidos.filter((p) => p.estado_id === 5).length;

  // Graficas
  const estadoCounts: Record<number, number> = {};
  pedidos.forEach((p) => {
    estadoCounts[p.estado_id] = (estadoCounts[p.estado_id] || 0) + 1;
  });

  const pedidosPorEstadoData = {
    labels: Object.keys(estadoCounts).map(
      (k) => ESTADO_CONFIG[Number(k)]?.label || "Desconocido",
    ),
    datasets: [
      {
        data: Object.values(estadoCounts),
        backgroundColor: Object.keys(estadoCounts).map(
          (k) => ESTADO_CHART_COLORS[Number(k)] || "#94a3b8",
        ),
        borderWidth: 0,
        cutout: "75%",
        spacing: 4,
      },
    ],
  };

  const ventasPorHora: Record<number, number> = {};
  ventasValidas.forEach((p) => {
    const h = new Date(p.fecha_creacion).getHours();
    ventasPorHora[h] = (ventasPorHora[h] || 0) + p.total;
  });

  const ventasPorHoraData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
    datasets: [
      {
        label: "Ventas",
        data: Array.from({ length: 24 }, (_, i) => ventasPorHora[i] || 0),
        backgroundColor: "#5CCFE6",
        borderRadius: 8,
        maxBarThickness: 20,
      },
    ],
  };

  const productosMap: Record<string, number> = {};
  ventasValidas.forEach((p) =>
    p.productos.forEach((prod) => {
      productosMap[prod.nombre_producto] =
        (productosMap[prod.nombre_producto] || 0) + prod.subtotal;
    }),
  );
  const topProductos = Object.entries(productosMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topProductosData = {
    labels: topProductos.map(([name]) =>
      name.length > 18 ? name.slice(0, 18) + "..." : name,
    ),
    datasets: [
      {
        label: "Ventas",
        data: topProductos.map(([, total]) => total),
        backgroundColor: "#0a0a0a",
        borderRadius: 8,
        maxBarThickness: 20,
      },
    ],
  };

  // Filtrado y ordenamiento
  const filteredPedidos = pedidos
    .filter((p) => {
      const matchSearch =
        p.cliente_nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id_pedido.toString().includes(searchTerm) ||
        p.cliente_telefono.includes(searchTerm);
      const matchEstado = filterEstado === null || p.estado_id === filterEstado;
      return matchSearch && matchEstado;
    })
    .sort((a, b) => {
      const valA = a[sortBy],
        valB = b[sortBy];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredPedidos.length / pageSize);
  const displayedPedidos = filteredPedidos.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0a0a0a",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 12,
        titleFont: { weight: 600 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#a3a3a3", font: { size: 11 } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f5f5f5", drawBorder: false },
        ticks: { color: "#a3a3a3", font: { size: 11 } },
        border: { display: false },
      },
    },
  };

  const kpiCards = [
    {
      label: "Total pedidos",
      value: pedidos.length,
      icon: ShoppingBag,
      color: "text-[#5CCFE6]",
      bgColor: "bg-[#5CCFE6]/10",
      trendUp: true,
    },
    {
      label: "Total ventas",
      value: formatCOP(totalVentas),
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      trendUp: true,
    },
    {
      label: "Ticket promedio",
      value: formatCOP(ticketPromedio),
      icon: TrendingUp,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      trendUp: true,
    },
    {
      label: "Pendientes",
      value: pedidosPendientes,
      icon: Clock,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      trendUp: false,
    },
  ];

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
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#5CCFE6]/10">
                  <Sparkles className="w-6 h-6 text-[#5CCFE6]" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                    Gestión de Pedidos
                  </h1>
                  <p className="text-muted-foreground mt-0.5">
                    Dashboard de administración y seguimiento
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => router.push("/admin/pedidos/ver_todos")}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-xl px-5 h-11 font-medium shadow-lg shadow-foreground/10 transition-all hover:shadow-xl hover:shadow-foreground/20"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Ver todos los pedidos
            </Button>
          </div>

          {/* KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
            {kpiCards.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden p-5 lg:p-6 bg-card border border-border/50 hover:border-border hover:shadow-xl transition-all duration-300 rounded-2xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-muted/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start justify-between">
                    <div className="space-y-3">
                      <div
                        className={`inline-flex p-3 rounded-xl ${kpi.bgColor}`}
                      >
                        <Icon className={`w-5 h-5 ${kpi.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {kpi.label}
                        </p>
                        <p className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mt-1">
                          {kpi.value}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Pedidos por estado - Doughnut */}
            <Card className="p-5 lg:p-6 bg-card border border-border/50 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">
                  Pedidos por estado
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {pedidos.length} total
                </span>
              </div>
              <div className="h-44 flex items-center justify-center">
                <Doughnut
                  data={pedidosPorEstadoData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-6">
                {Object.entries(estadoCounts).map(([key, count]) => {
                  const config = ESTADO_CONFIG[Number(key)];
                  const Icon = config?.icon;
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl ${config?.bgColor} transition-colors`}
                    >
                      {Icon && <Icon className={`w-4 h-4 ${config?.color}`} />}
                      <span className="text-sm text-foreground font-medium flex-1">
                        {config?.label}
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Ventas por hora */}
            <Card className="p-5 lg:p-6 bg-card border border-border/50 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">
                  Ventas por hora
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  Hoy
                </span>
              </div>
              <div className="h-64">
                <Bar data={ventasPorHoraData} options={chartOptions} />
              </div>
            </Card>

            {/* Top productos */}
            <Card className="p-5 lg:p-6 bg-card border border-border/50 rounded-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-foreground">
                  Top 5 productos
                </h3>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  Por ventas
                </span>
              </div>
              <div className="h-64">
                <Bar
                  data={topProductosData}
                  options={{
                    ...chartOptions,
                    indexAxis: "y" as const,
                  }}
                />
              </div>
            </Card>
          </section>

          {/* Filters and Search */}
          <Card className="p-4 bg-card border border-border/50 rounded-2xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID o teléfono..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:border-[#5CCFE6] focus:bg-background transition-all"
                />
              </div>

              {/* Filter by estado */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-muted/50">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                </div>
                <select
                  value={filterEstado ?? ""}
                  onChange={(e) => {
                    setFilterEstado(
                      e.target.value ? Number(e.target.value) : null,
                    );
                    setPage(1);
                  }}
                  className="px-4 py-3 rounded-xl bg-muted/50 border border-transparent text-sm focus:outline-none focus:border-[#5CCFE6] focus:bg-background cursor-pointer transition-all min-w-[180px]"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(ESTADO_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Orders Table */}
          <Card className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <div className="p-5 lg:p-6 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Lista de pedidos
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {filteredPedidos.length} pedidos encontrados
                  </p>
                </div>
              </div>
            </div>

            {displayedPedidos.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <p className="text-foreground font-medium">
                  No se encontraron pedidos
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/30">
                      {[
                        { key: "id_pedido", label: "ID" },
                        { key: "cliente_nombres", label: "Cliente" },
                        { key: "fecha_creacion", label: "Fecha" },
                        { key: "estado_id", label: "Estado" },
                        { key: "total", label: "Total" },
                      ].map((col) => (
                        <th
                          key={col.key}
                          onClick={() => {
                            setSortBy(col.key as keyof Pedido);
                            setSortAsc(sortBy === col.key ? !sortAsc : true);
                          }}
                          className="px-5 lg:px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1.5">
                            {col.label}
                            {sortBy === col.key &&
                              (sortAsc ? (
                                <ChevronUp className="w-4 h-4 text-[#5CCFE6]" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-[#5CCFE6]" />
                              ))}
                          </div>
                        </th>
                      ))}
                      <th className="px-5 lg:px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {displayedPedidos.map((p) => {
                      const estadoConfig = ESTADO_CONFIG[p.estado_id] || {
                        label: "Desconocido",
                        color: "text-gray-600",
                        bgColor: "bg-gray-500/10",
                        borderColor: "border-gray-500/20",
                        icon: Package,
                        gradient: "from-gray-500 to-gray-600",
                      };
                      const EstadoIcon = estadoConfig.icon;
                      const isExpanded = expandedRows.includes(p.id_pedido);
                      const estadosDisponibles = getEstadosDisponibles(
                        p.estado_id,
                      );

                      return (
                        <React.Fragment key={p.id_pedido}>
                          <tr
                            className="hover:bg-muted/20 transition-colors cursor-pointer group"
                            onClick={() => toggleRow(p.id_pedido)}
                          >
                            <td className="px-5 lg:px-6 py-4">
                              <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg bg-foreground/5 font-mono text-sm font-bold text-foreground group-hover:bg-[#5CCFE6]/10 group-hover:text-[#5CCFE6] transition-colors">
                                #{p.id_pedido}
                              </span>
                            </td>

                            <td className="px-5 lg:px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">
                                  {p.cliente_nombres}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {p.cliente_telefono}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 lg:px-6 py-4">
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2 text-sm text-foreground">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  {new Date(
                                    p.fecha_creacion,
                                  ).toLocaleDateString("es-ES", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                                <span className="text-xs text-muted-foreground ml-6">
                                  {new Date(
                                    p.fecha_creacion,
                                  ).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 lg:px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${estadoConfig.bgColor} ${estadoConfig.color} ${estadoConfig.borderColor}`}
                              >
                                <EstadoIcon className="w-3.5 h-3.5" />
                                {estadoConfig.label}
                              </span>
                            </td>

                            <td className="px-5 lg:px-6 py-4">
                              <span className="text-lg font-bold text-foreground">
                                ${p.total.toLocaleString("es-CO")}
                              </span>
                            </td>

                            <td className="px-5 lg:px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {estadosDisponibles.length > 0 ? (
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      if (e.target.value) {
                                        actualizarEstado(
                                          p.id_pedido,
                                          Number(e.target.value),
                                        );
                                      }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="px-3 py-1.5 text-xs rounded-lg border border-border bg-background cursor-pointer hover:border-[#5CCFE6] transition-colors"
                                  >
                                    <option value="">Cambiar a...</option>
                                    {estadosDisponibles.map((estadoId) => (
                                      <option key={estadoId} value={estadoId}>
                                        {ESTADO_CONFIG[estadoId]?.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 rounded-lg">
                                    Estado final
                                  </span>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1.5 text-xs rounded-lg hover:bg-[#5CCFE6]/10 hover:text-[#5CCFE6]"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRow(p.id_pedido);
                                  }}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  {isExpanded ? "Ocultar" : "Ver"}
                                </Button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Row */}
                          {isExpanded && (
                            <tr className="bg-muted/10">
                              <td colSpan={6} className="px-5 lg:px-6 py-5">
                                <div className="ml-4 pl-5 border-l-2 border-[#5CCFE6]">
                                  <p className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                                    <Package className="w-4 h-4 text-[#5CCFE6]" />
                                    Detalle del pedido
                                  </p>

                                  <div className="space-y-2">
                                    {p.productos.map((prod, i) => (
                                      <div
                                        key={`${p.id_pedido}-${i}`}
                                        className="flex items-center justify-between py-3 px-4 bg-card rounded-xl border border-border/50"
                                      >
                                        <div className="flex items-center gap-4">
                                          <span className="w-10 h-10 rounded-xl bg-[#5CCFE6]/10 flex items-center justify-center text-sm font-bold text-[#5CCFE6]">
                                            {prod.cantidad}x
                                          </span>

                                          <div>
                                            <p className="font-semibold text-foreground text-sm">
                                              {prod.nombre_producto}
                                            </p>

                                            {prod.opciones &&
                                              prod.opciones.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                  {prod.opciones
                                                    .map((o) => o.nombre_opcion)
                                                    .join(", ")}
                                                </p>
                                              )}
                                          </div>
                                        </div>

                                        <span className="font-bold text-foreground">
                                          $
                                          {prod.subtotal.toLocaleString(
                                            "es-CO",
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex justify-end mt-5 pt-4 border-t border-border/50">
                                    <div className="text-right bg-foreground/5 rounded-xl px-5 py-3">
                                      <p className="text-xs text-muted-foreground">
                                        Total del pedido
                                      </p>
                                      <p className="text-2xl font-bold text-foreground">
                                        ${p.total.toLocaleString("es-CO")}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-5 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-semibold text-foreground">
                    {(page - 1) * pageSize + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-semibold text-foreground">
                    {Math.min(page * pageSize, filteredPedidos.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-foreground">
                    {filteredPedidos.length}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="gap-1 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className={`w-9 h-9 rounded-lg ${
                            page === pageNum
                              ? "bg-[#5CCFE6] text-foreground hover:bg-[#5CCFE6]/90"
                              : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="gap-1 rounded-lg"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
