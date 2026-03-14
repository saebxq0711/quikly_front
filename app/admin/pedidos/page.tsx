"use client";

import React from "react";
import { useEffect, useState } from "react";
import HeaderAdmin from "../components/HeaderAdmin";
import SidebarAdmin from "../components/SidebarAdmin";
import { useRestaurante } from "../context/RestauranteContext";
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
  User,
  Calendar,
  Eye,
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
    icon: any;
  }
> = {
  4: {
    label: "Aprobado",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: CheckCircle2,
  },
  5: {
    label: "Pendiente",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: Clock,
  },
  6: {
    label: "Rechazado",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: XCircle,
  },
  7: {
    label: "Entregado",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: Package,
  },
};

const ESTADO_CHART_COLORS: Record<number, string> = {
  4: "#3b82f6",
  5: "#f59e0b",
  6: "#ef4444",
  7: "#10b981",
};

export default function PedidosAdminPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const { restaurante } = useRestaurante();

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

  const marcarEntregado = async (id: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const res = await fetch(`${API}/admin/pedidos/${id}/entregado`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) loadPedidos();
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
        cutout: "70%",
      },
    ],
  };

  const ventasPorHora: Record<number, number> = {};
  ventasValidas.forEach((p) => {
    const h = new Date(p.fecha_creacion).getHours();
    ventasPorHora[h] = (ventasPorHora[h] || 0) + p.total;
  });

  const ventasPorHoraData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: "Ventas",
        data: Array.from({ length: 24 }, (_, i) => ventasPorHora[i] || 0),
        backgroundColor: "#5CCFE6",
        borderRadius: 6,
        maxBarThickness: 24,
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
      name.length > 20 ? name.slice(0, 20) + "..." : name,
    ),
    datasets: [
      {
        label: "Ventas",
        data: topProductos.map(([, total]) => total),
        backgroundColor: "#0a0a0a",
        borderRadius: 6,
        maxBarThickness: 24,
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
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#a3a3a3", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f5f5f5" },
        ticks: { color: "#a3a3a3", font: { size: 10 } },
      },
    },
  };

  const kpiCards = [
    {
      label: "Total pedidos",
      value: pedidos.length,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Total ventas",
      value: `$${totalVentas.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Ticket promedio",
      value: `$${ticketPromedio.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Pendientes",
      value: pedidosPendientes,
      icon: Clock,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">
                Cargando pedidos...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="flex-1 p-8 space-y-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Gestión de Pedidos
              </h1>
              <p className="text-muted-foreground mt-1">
                Administra y da seguimiento a todos los pedidos
              </p>
            </div>
          </div>

          {/* KPIs */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiCards.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={index}
                  className="p-6 bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                      <Icon className={`w-6 h-6 ${kpi.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-2xl font-bold text-foreground tracking-tight">
                        {kpi.value}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pedidos por estado - Doughnut */}
            <Card className="p-6 bg-card border-0 shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Pedidos por estado
              </h3>
              <div className="h-48 flex items-center justify-center">
                <Doughnut
                  data={pedidosPorEstadoData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {Object.entries(estadoCounts).map(([key, count]) => {
                  const config = ESTADO_CONFIG[Number(key)];
                  return (
                    <div key={key} className="flex items-center gap-2 text-sm">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ESTADO_CHART_COLORS[Number(key)],
                        }}
                      />
                      <span className="text-muted-foreground">
                        {config?.label}
                      </span>
                      <span className="font-medium text-foreground ml-auto">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Ventas por hora */}
            <Card className="p-6 bg-card border-0 shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Ventas por hora
              </h3>
              <div className="h-64">
                <Bar data={ventasPorHoraData} options={chartOptions} />
              </div>
            </Card>

            {/* Top productos */}
            <Card className="p-6 bg-card border-0 shadow-sm">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Top 5 productos
              </h3>
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
          <Card className="p-4 bg-card border-0 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ID o teléfono..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Filter by estado */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={filterEstado ?? ""}
                  onChange={(e) => {
                    setFilterEstado(
                      e.target.value ? Number(e.target.value) : null,
                    );
                    setPage(1);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
          <Card className="bg-card border-0 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
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
              <div className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No se encontraron pedidos
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
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
                          className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {sortBy === col.key &&
                              (sortAsc ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              ))}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedPedidos.map((p) => {
                      const estadoConfig = ESTADO_CONFIG[p.estado_id] || {
                        label: "Desconocido",
                        color: "text-gray-700",
                        bgColor: "bg-gray-50",
                        borderColor: "border-gray-200",
                        icon: Package,
                      };
                      const EstadoIcon = estadoConfig.icon;
                      const isExpanded = expandedRows.includes(p.id_pedido);

                      return (
                        <React.Fragment key={p.id_pedido}>
                          <tr
                            className="hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => toggleRow(p.id_pedido)}
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-semibold text-foreground">
                                #{p.id_pedido}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground">
                                  {p.cliente_nombres}
                                </span>

                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />
                                  {p.cliente_telefono}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />

                                {new Date(p.fecha_creacion).toLocaleDateString(
                                  "es-ES",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}

                                <span className="text-xs">
                                  {new Date(
                                    p.fecha_creacion,
                                  ).toLocaleTimeString("es-ES", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${estadoConfig.bgColor} ${estadoConfig.color} ${estadoConfig.borderColor}`}
                              >
                                <EstadoIcon className="w-3.5 h-3.5" />
                                {estadoConfig.label}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <span className="text-base font-bold text-foreground">
                                ${p.total.toFixed(2)}
                              </span>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {p.estado_id === 4 && (
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      marcarEntregado(p.id_pedido);
                                    }}
                                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Entregar
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1.5 text-xs"
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
                            <tr className="bg-muted/20">
                              <td colSpan={6} className="px-6 py-4">
                                <div className="pl-4 border-l-2 border-primary/30">
                                  <p className="text-sm font-semibold text-foreground mb-3">
                                    Detalle del pedido
                                  </p>

                                  <div className="space-y-2">
                                    {p.productos.map((prod, i) => (
                                      <div
                                        key={`${p.id_pedido}-${i}`}
                                        className="flex items-center justify-between py-2 px-4 bg-card rounded-lg"
                                      >
                                        <div className="flex items-center gap-3">
                                          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                            {prod.cantidad}x
                                          </span>

                                          <div>
                                            <p className="font-medium text-foreground text-sm">
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

                                        <span className="font-semibold text-foreground">
                                          ${prod.subtotal.toFixed(2)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="flex justify-end mt-4 pt-3 border-t border-border">
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">
                                        Total del pedido
                                      </p>

                                      <p className="text-xl font-bold text-foreground">
                                        ${p.total.toFixed(2)}
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
              <div className="p-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {(page - 1) * pageSize + 1} -{" "}
                  {Math.min(page * pageSize, filteredPedidos.length)} de{" "}
                  {filteredPedidos.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="gap-1"
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
                          className={`w-9 h-9 ${page === pageNum ? "bg-primary text-primary-foreground" : ""}`}
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
                    className="gap-1"
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
