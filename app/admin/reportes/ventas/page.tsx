"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

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
        {
          headers: { Authorization: `Bearer ${token()}` },
        }
      );

      if (!res.ok) {
        console.error("Error API:", res.status);
        setVentas(null);
        return;
      }

      const data: VentasResponse = await res.json();

      // 🔐 Validación mínima de contrato
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
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-100">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="p-6 space-y-8">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              ← Volver
            </button>

            <div>
              <h1 className="text-2xl font-semibold">Reporte de Ventas</h1>
              <p className="text-gray-400 text-sm">
                Análisis de ingresos y rendimiento del restaurante
              </p>
            </div>
          </div>

          {/* FILTROS */}
          <div className="bg-[#11162A] rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Desde</label>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="bg-[#0B0F1A] border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Hasta</label>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="bg-[#0B0F1A] border border-gray-700 rounded px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={cargarVentas}
              className="ml-auto bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg text-sm font-medium"
            >
              Aplicar filtros
            </button>
          </div>

          {/* KPIs */}
          {ventas && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI
                title="Ingresos Totales"
                value={`$${(ventas.total_ingresos ?? 0).toFixed(2)}`}
              />
              <KPI title="Pedidos" value={ventas.total_pedidos.toString()} />
              <KPI
                title="Ticket Promedio"
                value={`$${(ventas.ticket_promedio ?? 0).toFixed(2)}`}
              />
            </div>
          )}

          {/* TABLA */}
          <div className="bg-[#11162A] rounded-xl p-4">
            <h3 className="font-medium mb-4">Detalle por día</h3>

            {loading ? (
              <p className="text-sm text-gray-400">Cargando datos…</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 text-left">Fecha</th>
                    <th className="py-2 text-right">Pedidos</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventas?.detalle?.length ? (
                    ventas.detalle.map((d) => (
                      <tr
                        key={d.fecha}
                        className="border-b border-gray-800 hover:bg-white/5"
                      >
                        <td className="py-2">{d.fecha}</td>
                        <td className="py-2 text-right">{d.pedidos}</td>
                        <td className="py-2 text-right font-medium">
                          ${(d.total ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-400"
                      >
                        No hay datos para el rango seleccionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* EXPORT */}
          <div className="flex justify-end">
            <button
              onClick={exportarExcel}
              disabled={!ventas || !ventas.detalle?.length}
              className="text-sm text-green-400 hover:text-green-300 disabled:text-gray-500"
            >
              Exportar Excel
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================
   COMPONENTES
========================= */

function KPI({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-[#11162A] rounded-xl p-4">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}
