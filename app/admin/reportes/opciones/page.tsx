"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  BarChart3,
  Hash,
  DollarSign,
  Star,
  RefreshCw,
  Tag,
} from "lucide-react";

type OpcionReporte = {
  tipo_opcion: string;
  nombre_opcion: string;
  cantidad: number;
  total_adicional: number;
};

const tipoColors: Record<string, string> = {
  tamaño: "bg-blue-100 text-blue-700",
  extra: "bg-purple-100 text-purple-700",
  topping: "bg-green-100 text-green-700",
  salsa: "bg-orange-100 text-orange-700",
};

export default function ReporteOpcionesPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();
  const token = () => localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [opciones, setOpciones] = useState<OpcionReporte[]>([]);

  const cargarOpciones = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/reportes/opciones`, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      if (!res.ok) {
        console.error("Error API:", res.status);
        setOpciones([]);
        return;
      }

      const data = await res.json();
      setOpciones(data);
    } catch (err) {
      console.error("Error cargando opciones", err);
      setOpciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOpciones();
  }, []);

  const exportarExcel = () => {
    if (!opciones.length) return;

    const data = opciones.map((o) => ({
      Tipo: o.tipo_opcion,
      Opción: o.nombre_opcion,
      "Veces seleccionada": o.cantidad,
      "Ingreso adicional": o.total_adicional,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Opciones");

    XLSX.writeFile(workbook, "opciones_y_toppings.xlsx");
  };

  const totalUsos = opciones.reduce((acc, o) => acc + o.cantidad, 0);
  const totalIngresos = opciones.reduce((acc, o) => acc + o.total_adicional, 0);
  const topOpcion = opciones[0];

  // Agrupar por tipo
  const tiposUnicos = [...new Set(opciones.map((o) => o.tipo_opcion))];

  const getTipoClass = (tipo: string) => {
    return tipoColors[tipo.toLowerCase()] || "bg-gray-100 text-gray-700";
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
                  Opciones y Toppings
                </h1>
                <p className="text-sm text-muted-foreground">
                  Uso e impacto económico de opciones adicionales
                </p>
              </div>
            </div>

            <button
              onClick={exportarExcel}
              disabled={!opciones.length}
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
                title="Opciones Seleccionadas"
                value={totalUsos.toString()}
                icon={Hash}
              />
              <KPICard
                title="Ingreso Adicional"
                value={`$${totalIngresos.toFixed(2)}`}
                icon={DollarSign}
              />
              <KPICard
                title="Opción más Usada"
                value={topOpcion ? topOpcion.nombre_opcion : "—"}
                subtitle={topOpcion ? `${topOpcion.cantidad} veces` : undefined}
                icon={Star}
                highlight
              />
            </div>
          )}

          {/* Resumen por tipo */}
          {!loading && tiposUnicos.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Resumen por tipo
              </h3>
              <div className="flex flex-wrap gap-3">
                {tiposUnicos.map((tipo) => {
                  const tipoOpciones = opciones.filter(
                    (o) => o.tipo_opcion === tipo,
                  );
                  const totalTipo = tipoOpciones.reduce(
                    (acc, o) => acc + o.cantidad,
                    0,
                  );
                  return (
                    <div
                      key={tipo}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${getTipoClass(tipo)}`}
                    >
                      <span className="capitalize">{tipo}</span>
                      <span className="ml-2 font-bold">{totalTipo}</span>
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
                <BarChart3 className="h-4 w-4 text-primary" />
                Detalle de opciones
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
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Opción
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {opciones.length ? (
                      opciones.map((o, idx) => (
                        <tr
                          key={`${o.nombre_opcion}-${idx}`}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTipoClass(o.tipo_opcion)}`}
                            >
                              {o.tipo_opcion}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            <div className="flex items-center gap-2">
                              {o.nombre_opcion}
                              {idx === 0 && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {o.cantidad}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            ${o.total_adicional.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No hay opciones registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {opciones.length > 0 && (
                    <tfoot>
                      <tr className="bg-secondary/30 font-semibold">
                        <td colSpan={2} className="px-4 py-3 text-foreground">
                          Total
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {totalUsos}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          ${totalIngresos.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
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
            className={`text-2xl font-bold truncate ${highlight ? "text-primary" : "text-foreground"}`}
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
