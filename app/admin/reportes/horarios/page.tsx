"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";

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
              className="text-sm text-gray-400 hover:text-white transition"
            >
              ← Volver
            </button>

            <div>
              <h1 className="text-2xl font-semibold">Reporte por Horarios</h1>
              <p className="text-gray-400 text-sm">
                Análisis de demanda y ventas por hora
              </p>
            </div>
          </div>

          {/* KPIs */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI title="Pedidos Totales" value={totalPedidos.toString()} />
              <KPI
                title="Ingresos Totales"
                value={`$${totalIngresos.toFixed(2)}`}
              />
              <KPI
                title="Hora Pico"
                value={horaPico ? `${horaPico.hora}:00` : "—"}
              />
            </div>
          )}

          {/* TABLA */}
          <div className="bg-[#11162A] rounded-xl p-4">
            <h3 className="font-medium mb-4">Detalle por hora</h3>

            {loading ? (
              <p className="text-sm text-gray-400">Cargando datos…</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 text-left">Hora</th>
                    <th className="py-2 text-right">Pedidos</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-right">Ticket Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.length ? (
                    horarios.map((h) => (
                      <tr
                        key={h.hora}
                        className="border-b border-gray-800 hover:bg-white/5 transition"
                      >
                        <td className="py-2">{h.hora}:00</td>
                        <td className="py-2 text-right">{h.pedidos}</td>
                        <td className="py-2 text-right font-medium">
                          ${h.total.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          $
                          {h.pedidos
                            ? (h.total / h.pedidos).toFixed(2)
                            : "0.00"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-gray-400"
                      >
                        No hay datos disponibles
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
              disabled={!horarios.length}
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
