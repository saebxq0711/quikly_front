"use client";

import { useRouter } from "next/navigation";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { BarChart3, ShoppingCart, Package, Clock, Users, TrendingUp } from "lucide-react";

const REPORTES = [
  {
    title: "Ventas",
    description:
      "Análisis de ingresos, pedidos, ticket promedio y comparación por periodos.",
    icon: TrendingUp,
    href: "/admin/reportes/ventas",
    highlight: true,
  },
  {
    title: "Productos",
    description:
      "Productos más y menos vendidos, rendimiento por categoría y rotación.",
    icon: Package,
    href: "/admin/reportes/productos",
  },
  {
    title: "Opciones & Toppings",
    description:
      "Uso de tamaños, extras y toppings. Identifica combinaciones populares.",
    icon: BarChart3,
    href: "/admin/reportes/opciones",
  },
  {
    title: "Horarios",
    description:
      "Demanda por franja horaria y días pico para optimizar operación.",
    icon: Clock,
    href: "/admin/reportes/horarios",
  },
  {
    title: "Clientes",
    description:
      "Frecuencia de compra, recurrencia y patrones de consumo.",
    icon: Users,
    href: "/admin/reportes/clientes",
  },
  {
    title: "Pedidos",
    description:
      "Estados de pedidos, tiempos de preparación y eficiencia operativa.",
    icon: ShoppingCart,
    href: "/admin/reportes/pedidos",
  },
];

export default function ReportesHubPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-white">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="p-8 space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Reportes & Analítica
            </h1>
            <p className="text-sm text-white/60 max-w-2xl">
              Información estratégica para la toma de decisiones del restaurante.
              Todos los reportes permiten filtrar por fechas y exportar datos.
            </p>
          </div>

          {/* Grid */}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {REPORTES.map((r) => (
              <button
                key={r.title}
                onClick={() => router.push(r.href)}
                className={`group relative rounded-2xl border border-white/10 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 ${
                  r.highlight
                    ? "bg-gradient-to-br from-indigo-600/20 to-indigo-400/10"
                    : "bg-white/5"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                      <r.icon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h2 className="text-lg font-semibold">{r.title}</h2>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {r.description}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 text-xs text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
                  Ver reporte →
                </div>
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
            <strong className="text-white">Tip:</strong> Usa los reportes para
            identificar horarios pico, optimizar precios y reducir cuellos de
            botella operativos.
          </div>
        </main>
      </div>
    </div>
  );
}
