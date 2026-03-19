"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";

type ProductoVendido = {
  producto_id: number;
  nombre: string;
  cantidad: number;
  total: number;
};

export default function ReporteProductosPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();
  const token = () => localStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<ProductoVendido[]>([]);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/reportes/productos`, {
        headers: { Authorization: `Bearer ${token()}` },
      });

      if (!res.ok) {
        console.error("Error API:", res.status);
        setProductos([]);
        return;
      }

      const data = await res.json();
      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos", err);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const exportarExcel = () => {
    if (!productos.length) return;

    const data = productos.map((p) => ({
      Producto: p.nombre,
      "Cantidad Vendida": p.cantidad,
      "Total Generado": p.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

    XLSX.writeFile(workbook, "productos_mas_vendidos.xlsx");
  };

  const totalUnidades = productos.reduce((acc, p) => acc + p.cantidad, 0);
  const topProducto = productos[0];

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
                Productos más vendidos
              </h1>
              <p className="text-gray-400 text-sm">
                Ranking de productos por volumen e ingresos
              </p>
            </div>
          </div>

          {/* KPIs */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI
                title="Productos distintos"
                value={productos.length.toString()}
              />
              <KPI
                title="Unidades vendidas"
                value={totalUnidades.toString()}
              />
              <KPI
                title="Top producto"
                value={topProducto ? topProducto.nombre : "—"}
              />
            </div>
          )}

          {/* TABLA */}
          <div className="bg-[#11162A] rounded-xl p-4">
            <h3 className="font-medium mb-4">Detalle</h3>

            {loading ? (
              <p className="text-sm text-gray-400">Cargando datos…</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-gray-400 border-b border-gray-700">
                  <tr>
                    <th className="py-2 text-left">Producto</th>
                    <th className="py-2 text-right">Cantidad</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.length ? (
                    productos.map((p) => (
                      <tr
                        key={p.producto_id}
                        className="border-b border-gray-800 hover:bg-white/5 transition"
                      >
                        <td className="py-2">{p.nombre}</td>
                        <td className="py-2 text-right">{p.cantidad}</td>
                        <td className="py-2 text-right font-medium">
                          ${p.total.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="py-4 text-center text-gray-400"
                      >
                        No hay ventas registradas
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
              disabled={!productos.length}
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
