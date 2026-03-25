"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Calendar,
  ShoppingCart,
  DollarSign,
  Activity,
  RefreshCw,
  FileText,
} from "lucide-react";

type PedidoEstado = {
  estado: string;
  cantidad: number;
};

type PedidoDetalle = {
  id_pedido: number;
  fecha: string;
  estado: string;
  cliente: string;
  total: number;
};

type ReportePedidosResponse = {
  total_pedidos: number;
  total_ingresos: number;
  por_estado: PedidoEstado[];
  detalle: PedidoDetalle[];
};

const estadoColors: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  preparando: "bg-blue-100 text-blue-700 border-blue-200",
  listo: "bg-green-100 text-green-700 border-green-200",
  entregado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
};

export default function ReportePedidosPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const token = () => localStorage.getItem("access_token");
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [reporte, setReporte] = useState<ReportePedidosResponse | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const cargarPedidos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const res = await fetch(
        `${API}/admin/reportes/pedidos?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token()}` } },
      );

      if (!res.ok) {
        console.error("Error API:", res.status);
        setReporte(null);
        return;
      }

      const data: ReportePedidosResponse = await res.json();
      setReporte(data);
    } catch (error) {
      console.error("Error cargando pedidos", error);
      setReporte(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const exportarExcel = () => {
    if (!reporte) return;

    const worksheet = XLSX.utils.json_to_sheet(
      reporte.detalle.map((p) => ({
        Pedido: p.id_pedido,
        Fecha: p.fecha,
        Estado: p.estado,
        Cliente: p.cliente,
        Total: p.total,
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

    const rango =
      desde || hasta ? `_${desde || "inicio"}_${hasta || "hoy"}` : "";
    XLSX.writeFile(workbook, `reporte_pedidos${rango}.xlsx`);
  };

  const getEstadoClass = (estado: string) => {
    return (
      estadoColors[estado.toLowerCase()] ||
      "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Reporte de Pedidos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Seguimiento operativo y estados de pedidos
                </p>
              </div>
            </div>

            <button
              onClick={exportarExcel}
              disabled={!reporte?.detalle.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>

          {/* Filtros */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Desde
                </label>
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Hasta
                </label>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              <button
                onClick={cargarPedidos}
                className="flex items-center gap-2 h-10 px-4 rounded-lg bg-foreground text-background font-medium text-sm hover:bg-foreground/90 transition-colors"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Aplicar
              </button>
            </div>
          </div>

          {/* KPIs */}
          {reporte && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard
                title="Total Pedidos"
                value={reporte.total_pedidos.toString()}
                icon={ShoppingCart}
              />
              <KPICard
                title="Ingresos Totales"
                value={`$${reporte.total_ingresos.toFixed(2)}`}
                icon={DollarSign}
              />
              <KPICard
                title="Estados Activos"
                value={reporte.por_estado.length.toString()}
                icon={Activity}
              />
            </div>
          )}

          {/* Estados */}
          {reporte && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Pedidos por estado
              </h3>
              <div className="flex flex-wrap gap-3">
                {reporte.por_estado.map((e) => (
                  <div
                    key={e.estado}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium ${getEstadoClass(e.estado)}`}
                  >
                    <span className="capitalize">{e.estado}</span>
                    <span className="ml-2 font-bold">{e.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Detalle de pedidos
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Cargando datos...
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reporte?.detalle.length ? (
                      reporte.detalle.map((p) => (
                        <tr
                          key={p.id_pedido}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-foreground">
                            #{p.id_pedido}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {p.fecha}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {p.cliente}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${getEstadoClass(p.estado)}`}
                            >
                              {p.estado}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            ${p.total.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No hay pedidos para el rango seleccionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ========================= COMPONENTES ========================= */

function KPICard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
