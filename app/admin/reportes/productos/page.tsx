"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Download,
  Package,
  Hash,
  Trophy,
  RefreshCw,
  Layers,
} from "lucide-react";

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
  const totalIngresos = productos.reduce((acc, p) => acc + p.total, 0);
  const topProducto = productos[0];

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
                  Productos más vendidos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Ranking de productos por volumen e ingresos
                </p>
              </div>
            </div>

            <button
              onClick={exportarExcel}
              disabled={!productos.length}
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
                title="Productos Distintos"
                value={productos.length.toString()}
                icon={Layers}
              />
              <KPICard
                title="Unidades Vendidas"
                value={totalUnidades.toString()}
                icon={Hash}
              />
              <KPICard
                title="Top Producto"
                value={topProducto ? topProducto.nombre : "—"}
                icon={Trophy}
                highlight
              />
            </div>
          )}

          {/* Tabla */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Detalle de productos
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
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">
                        #
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Producto
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
                    {productos.length ? (
                      productos.map((p, index) => (
                        <tr
                          key={p.producto_id}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            {index < 3 ? (
                              <span
                                className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                                  index === 0
                                    ? "bg-amber-100 text-amber-700"
                                    : index === 1
                                      ? "bg-gray-200 text-gray-700"
                                      : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {index + 1}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {index + 1}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {p.nombre}
                          </td>
                          <td className="px-4 py-3 text-right text-foreground">
                            {p.cantidad}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-foreground">
                            ${p.total.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No hay ventas registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {productos.length > 0 && (
                    <tfoot>
                      <tr className="bg-secondary/30 font-semibold">
                        <td colSpan={2} className="px-4 py-3 text-foreground">
                          Total
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {totalUnidades}
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
  icon: Icon,
  highlight,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-5 ${highlight ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent" : "border-border"}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <p
            className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}
          >
            {value}
          </p>
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
