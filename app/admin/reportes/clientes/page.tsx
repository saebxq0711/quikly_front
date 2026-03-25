"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  Users,
  UserCheck,
  Crown,
  RefreshCw,
  UserCircle,
} from "lucide-react";

type ClienteReporte = {
  identificacion?: string;
  nombre?: string;
  correo?: string;
  telefono?: string;
  pedidos: number;
  total: number;
};

export default function ReporteClientesPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();
  const token = () => localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState<ClienteReporte[]>([]);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/reportes/clientes`, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      if (!res.ok) {
        console.error("Error API:", res.status);
        setClientes([]);
        return;
      }

      const data = await res.json();
      setClientes(data);
    } catch (err) {
      console.error("Error cargando clientes", err);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const getClienteDisplay = (c: ClienteReporte) => {
    return (
      c.nombre ||
      c.identificacion ||
      c.correo ||
      c.telefono ||
      "Consumidor final"
    );
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const exportarExcel = () => {
    if (!clientes.length) return;

    const data = clientes.map((c) => ({
      Cliente: getClienteDisplay(c),
      Identificación: c.identificacion,
      Correo: c.correo,
      Teléfono: c.telefono,
      Pedidos: c.pedidos,
      "Total Gastado": c.total,
      "Ticket Promedio": c.pedidos > 0 ? (c.total / c.pedidos).toFixed(2) : 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    XLSX.writeFile(workbook, "reporte_clientes.xlsx");
  };

  const totalClientes = clientes.length;
  const recurrentes = clientes.filter((c) => c.pedidos > 1).length;
  const clienteTop =
    clientes.length > 0
      ? clientes.reduce((max, c) => (c.total > max.total ? c : max))
      : null;
  const totalGastado = clientes.reduce((acc, c) => acc + c.total, 0);

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
                  Reporte de Clientes
                </h1>
                <p className="text-sm text-muted-foreground">
                  Análisis de comportamiento y valor del cliente
                </p>
              </div>
            </div>

            <button
              onClick={exportarExcel}
              disabled={!clientes.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>

          {/* KPIs */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Total Clientes"
                value={totalClientes.toString()}
                icon={Users}
              />
              <KPICard
                title="Clientes Recurrentes"
                value={recurrentes.toString()}
                subtitle={
                  totalClientes > 0
                    ? `${((recurrentes / totalClientes) * 100).toFixed(0)}% del total`
                    : undefined
                }
                icon={UserCheck}
              />
              <KPICard
                title="Cliente Top"
                value={clienteTop ? getClienteDisplay(clienteTop) : "—"}
                subtitle={
                  clienteTop?.total
                    ? `$${clienteTop.total.toFixed(2)}`
                    : undefined
                }
                icon={Crown}
                highlight
              />
              <KPICard
                title="Total Gastado"
                value={`$${totalGastado.toFixed(2)}`}
                icon={UserCircle}
              />
            </div>
          )}

          {/* Tabla */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Detalle por cliente
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
                        Cliente
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
                    {clientes.length ? (
                      clientes.map((c, index) => {
                        const display = getClienteDisplay(c);

                        return (
                          <tr
                            key={`${c.identificacion ?? c.correo ?? c.telefono ?? "anon"}-${index}`}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-medium ${
                                    index === 0
                                      ? "bg-primary/10 text-primary"
                                      : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  {display?.charAt(0)?.toUpperCase() || "?"}
                                </div>

                                <div>
                                  <span className="font-medium text-foreground">
                                    {display}
                                  </span>

                                  {/* info secundaria (pro UX) */}
                                  {(c.correo || c.telefono) && (
                                    <p className="text-xs text-muted-foreground">
                                      {c.correo ?? c.telefono}
                                    </p>
                                  )}

                                  {c.pedidos > 3 && (
                                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                      Frecuente
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right text-foreground">
                              {c.pedidos}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-foreground">
                              ${c.total.toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-right text-muted-foreground">
                              $
                              {c.pedidos
                                ? (c.total / c.pedidos).toFixed(2)
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
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p
            className={`text-xl font-bold truncate w-full ${
              highlight ? "text-primary" : "text-foreground"
            }`}
            title={value}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${highlight ? "bg-primary/20" : "bg-primary/10"}`}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}
