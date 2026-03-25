"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  Clock,
  ShoppingBag,
  DollarSign,
  Zap,
  RefreshCw,
} from "lucide-react";

type HorarioReporte = {
  hora: number;
  pedidos: number;
  total: number;
};

export default function ReporteHorariosPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();
  const token = () => localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [horarios, setHorarios] = useState<HorarioReporte[]>([]);

  const cargarHorarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/reportes/horas-pico`, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      if (!res.ok) {
        console.error("Error API:", res.status);
        setHorarios([]);
        return;
      }

      const data = await res.json();
      setHorarios(data);
    } catch (err) {
      console.error("Error cargando horarios", err);
      setHorarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, []);

  const exportarExcel = () => {
    if (!horarios.length) return;

    const data = horarios.map((h) => ({
      Hora: `${h.hora}:00`,
      Pedidos: h.pedidos,
      Total: h.total,
      "Ticket Promedio": h.pedidos > 0 ? (h.total / h.pedidos).toFixed(2) : 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Horarios");

    XLSX.writeFile(workbook, "ventas_por_horario.xlsx");
  };

  const totalPedidos = horarios.reduce((acc, h) => acc + h.pedidos, 0);
  const totalIngresos = horarios.reduce((acc, h) => acc + h.total, 0);
  const horaPico = horarios.reduce<HorarioReporte | null>(
    (max, h) => (max === null || h.pedidos > max.pedidos ? h : max),
    null,
  );
  const maxPedidos = horaPico?.pedidos || 1;

  const formatHora = (hora: number) => {
    const ampm = hora >= 12 ? "PM" : "AM";
    const hora12 = hora % 12 || 12;
    return `${hora12}:00 ${ampm}`;
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
                  Reporte por Horarios
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análisis de demanda y ventas por hora
                </p>
              </div>
            </div>

            <button
              onClick={exportarExcel}
              disabled={!horarios.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>

          {/* KPIs */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KPICard
                title="Pedidos Totales"
                value={totalPedidos.toString()}
                icon={ShoppingBag}
              />
              <KPICard
                title="Ingresos Totales"
                value={`$${totalIngresos.toFixed(2)}`}
                icon={DollarSign}
              />
              <KPICard
                title="Hora Pico"
                value={horaPico ? formatHora(horaPico.hora) : "—"}
                subtitle={horaPico ? `${horaPico.pedidos} pedidos` : undefined}
                icon={Zap}
                highlight
              />
            </div>
          )}

          {/* Visual de Horarios */}
          {!loading && horarios.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Distribución por hora
              </h3>
              <div className="space-y-3">
                {horarios.map((h) => {
                  const porcentaje = (h.pedidos / maxPedidos) * 100;
                  const esPico = h.hora === horaPico?.hora;
                  return (
                    <div key={h.hora} className="flex items-center gap-4">
                      <span
                        className={`w-20 text-sm font-medium ${esPico ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {formatHora(h.hora)}
                      </span>
                      <div className="flex-1 h-8 bg-secondary rounded-lg overflow-hidden">
                        <div
                          className={`h-full rounded-lg transition-all duration-500 ${esPico ? "bg-primary" : "bg-primary/40"}`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                      <span
                        className={`w-16 text-right text-sm font-medium ${esPico ? "text-primary" : "text-foreground"}`}
                      >
                        {h.pedidos}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabla */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Detalle por hora
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
                        Hora
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Pedidos
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Total
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Ticket Prom.
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {horarios.length ? (
                      horarios.map((h) => {
                        const esPico = h.hora === horaPico?.hora;
                        return (
                          <tr
                            key={h.hora}
                            className={`hover:bg-secondary/30 transition-colors ${esPico ? "bg-primary/5" : ""}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium ${esPico ? "text-primary" : "text-foreground"}`}
                                >
                                  {formatHora(h.hora)}
                                </span>
                                {esPico && (
                                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    Pico
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-foreground">
                              {h.pedidos}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-foreground">
                              ${h.total.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-muted-foreground">
                              $
                              {h.pedidos
                                ? (h.total / h.pedidos).toFixed(2)
                                : "0.00"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No hay datos disponibles
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
  subtitle,
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 ${highlight ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" : "border-border"}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p
            className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${highlight ? "bg-primary/20" : "bg-primary/10"}`}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
