"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import * as XLSX from "xlsx";

type OpcionReporte = {
  tipo_opcion: string;
  nombre_opcion: string;
  cantidad: number;
  total_adicional: number;
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
  const totalIngresos = opciones.reduce(
    (acc, o) => acc + o.total_adicional,
    0
  );
  const topOpcion = opciones[0];

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
                Opciones y Toppings
              </h1>
              <p className="text-gray-400 text-sm">
                Uso e impacto económico de opciones adicionales
              </p>
            </div>
          </div>

          {/* KPIs */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPI
                title="Opciones seleccionadas"
                value={totalUsos.toString()}
              />
              <KPI
                title="Ingreso adicional"
                value={`$${totalIngresos.toFixed(2)}`}
              />
              <KPI
                title="Opción más usada"
                value={topOpcion ? topOpcion.nombre_opcion : "—"}
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
                    <th className="py-2 text-left">Tipo</th>
                    <th className="py-2 text-left">Opción</th>
                    <th className="py-2 text-right">Cantidad</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {opciones.length ? (
                    opciones.map((o, idx) => (
                      <tr
                        key={`${o.nombre_opcion}-${idx}`}
                        className="border-b border-gray-800 hover:bg-white/5 transition"
                      >
                        <td className="py-2 capitalize">
                          {o.tipo_opcion}
                        </td>
                        <td className="py-2">{o.nombre_opcion}</td>
                        <td className="py-2 text-right">{o.cantidad}</td>
                        <td className="py-2 text-right font-medium">
                          ${o.total_adicional.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-4 text-center text-gray-400"
                      >
                        No hay opciones registradas
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
              disabled={!opciones.length}
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
