"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

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
        {
          headers: {
            Authorization: `Bearer ${token()}`,
          },
        }
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
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pedidos");

    const rango =
      desde || hasta ? `_${desde || "inicio"}_${hasta || "hoy"}` : "";

    XLSX.writeFile(workbook, `reporte_pedidos${rango}.xlsx`);
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F1A] text-gray-100">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="p-6 space-y-8">
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Reporte de Pedidos</h1>
              <p className="text-gray-400 text-sm">
                Seguimiento operativo y estados de pedidos
              </p>
            </div>

            <button
              onClick={() => router.back()}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Volver
            </button>
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
              onClick={cargarPedidos}
              className="ml-auto bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 rounded-lg text-sm font-medium"
            >
              Aplicar filtros
            </button>
          </div>

          {/* KPIs */}
          {reporte && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI
                title="Total Pedidos"
                value={reporte.total_pedidos.toString()}
              />
              <KPI
                title="Ingresos Totales"
                value={`$${reporte.total_ingresos.toFixed(2)}`}
              />
              <KPI
                title="Estados Activos"
                value={reporte.por_estado.length.toString()}
              />
            </div>
          )}

          {/* ESTADOS */}
          {reporte && (
            <div className="bg-[#11162A] rounded-xl p-4">
              <h3 className="font-medium mb-3">Pedidos por estado</h3>
              <div className="flex flex-wrap gap-3">
                {reporte.por_estado.map((e) => (
                  <div
                    key={e.estado}
                    className="bg-[#0B0F1A] px-4 py-2 rounded-lg text-sm"
                  >
                    <span className="text-gray-400">{e.estado}</span>
                    <span className="ml-2 font-semibold">{e.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TABLA */}
          <div className="bg-[#11162A] rounded-xl p-4">
            <h3 className="font-medium mb-4">Detalle de pedidos</h3>

            {loading ? (
              <p className="text-sm text-gray-400">Cargando datos…</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 text-left">ID</th>
                    <th className="py-2 text-left">Fecha</th>
                    <th className="py-2 text-left">Cliente</th>
                    <th className="py-2 text-left">Estado</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte?.detalle.length ? (
                    reporte.detalle.map((p) => (
                      <tr
                        key={p.id_pedido}
                        className="border-b border-gray-800 hover:bg-white/5"
                      >
                        <td className="py-2">{p.id_pedido}</td>
                        <td className="py-2">{p.fecha}</td>
                        <td className="py-2">{p.cliente}</td>
                        <td className="py-2">{p.estado}</td>
                        <td className="py-2 text-right font-medium">
                          ${p.total.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 text-center text-gray-400"
                      >
                        No hay pedidos para el rango seleccionado
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
              disabled={!reporte?.detalle.length}
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
