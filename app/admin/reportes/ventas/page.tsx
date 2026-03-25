"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Receipt,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

type VentaDia = {
  fecha: string;
  total: number;
  pedidos: number;
};

type VentasResponse = {
  total_ingresos: number;
  total_pedidos: number;
  ticket_promedio: number;
  detalle: VentaDia[];
};

export default function ReporteVentasPage() {
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const token = () => localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [ventas, setVentas] = useState<VentasResponse | null>(null);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (desde) params.append("desde", desde);
      if (hasta) params.append("hasta", hasta);

      const res = await fetch(
        `${API}/admin/reportes/ventas?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token()}` } },
      );

      if (!res.ok) {
        console.error("Error API:", res.status);
        setVentas(null);
        return;
      }

      const data: VentasResponse = await res.json();

      if (
        typeof data.total_ingresos !== "number" ||
        typeof data.total_pedidos !== "number" ||
        typeof data.ticket_promedio !== "number"
      ) {
        console.error("Respuesta inválida:", data);
        setVentas(null);
        return;
      }

      setVentas(data);
    } catch (err) {
      console.error("Error cargando ventas", err);
      setVentas(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVentas();
  }, []);

  const exportarExcel = () => {
    if (!ventas || !ventas.detalle?.length) return;

    const data = ventas.detalle.map((d) => ({
      Fecha: d.fecha,
      Pedidos: d.pedidos,
      Total: d.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas");

    const rango =
      desde || hasta ? `_${desde || "inicio"}_${hasta || "hoy"}` : "";
    XLSX.writeFile(workbook, `reporte_ventas${rango}.xlsx`);
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
                  Reporte de Ventas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análisis de ingresos y rendimiento del restaurante
                </p>
              </div>
            </div>

            <button
              onClick={exportarExcel}
              disabled={!ventas || !ventas.detalle?.length}
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
                onClick={cargarVentas}
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
          {ventas && !loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard
                title="Ingresos Totales"
                value={`$${(ventas.total_ingresos ?? 0).toFixed(2)}`}
                icon={DollarSign}
                trendUp
              />
              <KPICard
                title="Total Pedidos"
                value={ventas.total_pedidos.toString()}
                icon={ShoppingBag}
              />
              <KPICard
                title="Ticket Promedio"
                value={`$${(ventas.ticket_promedio ?? 0).toFixed(2)}`}
                icon={Receipt}
              />
            </div>
          )}

          {/* Tabla */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Detalle por día
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
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Pedidos
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ventas?.detalle?.length ? (
                      ventas.detalle.map((d) => (
                        <tr
                          key={d.fecha}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-4 py-3 text-foreground">
                            {d.fecha}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {d.pedidos}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            ${(d.total ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No hay datos para el rango seleccionado
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
  trend,
  trendUp,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
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
