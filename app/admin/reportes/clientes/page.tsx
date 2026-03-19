"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";

type ClienteReporte = {
  cliente: string;
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

  useEffect(() => {
    cargarClientes();
  }, []);

  const exportarExcel = () => {
    if (!clientes.length) return;

    const data = clientes.map((c) => ({
      Cliente: c.cliente,
      Pedidos: c.pedidos,
      "Total Gastado": c.total,
      "Ticket Promedio":
        c.pedidos > 0 ? (c.total / c.pedidos).toFixed(2) : 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");

    XLSX.writeFile(workbook, "reporte_clientes.xlsx");
  };

  const totalClientes = clientes.length;
  const recurrentes = clientes.filter((c) => c.pedidos > 1).length;
  const clienteTop = clientes.reduce(
    (max, c) => (c.total > max.total ? c : max),
    clientes[0] ?? { cliente: "—", total: 0 }
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
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              ← Volver
            </button>

            <div>
              <h1 className="text-2xl font-semibold">
                Reporte de Clientes
              </h1>
              <p className="text-gray-400 text-sm">
                Análisis de comportamiento y valor del cliente
              </p>
            </div>
          </div>

          {/* KPIs */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI
                title="Total Clientes"
                value={totalClientes.toString()}
              />
              <KPI
                title="Clientes Recurrentes"
                value={recurrentes.toString()}
              />
              <KPI
                title="Cliente Top"
                value={clienteTop?.cliente ?? "—"}
              />
            </div>
          )}

          {/* TABLA */}
          <div className="bg-[#11162A] rounded-xl p-4">
            <h3 className="font-medium mb-4">Detalle por cliente</h3>

            {loading ? (
              <p className="text-sm text-gray-400">Cargando datos…</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 text-left">Cliente</th>
                    <th className="py-2 text-right">Pedidos</th>
                    <th className="py-2 text-right">Total</th>
                    <th className="py-2 text-right">Ticket Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length ? (
                    clientes.map((c) => (
                      <tr
                        key={c.cliente}
                        className="border-b border-gray-800 hover:bg-white/5 transition"
                      >
                        <td className="py-2">{c.cliente}</td>
                        <td className="py-2 text-right">{c.pedidos}</td>
                        <td className="py-2 text-right font-medium">
                          ${c.total.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          $
                          {c.pedidos
                            ? (c.total / c.pedidos).toFixed(2)
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
              disabled={!clientes.length}
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
