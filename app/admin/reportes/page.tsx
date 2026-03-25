"use client";

import { useRouter } from "next/navigation";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  Clock, 
  Users, 
  TrendingUp,
  ArrowRight,
  Lightbulb
} from "lucide-react";

const REPORTES = [
  {
    title: "Ventas",
    description: "Análisis de ingresos, pedidos, ticket promedio y comparación por periodos.",
    icon: TrendingUp,
    href: "/admin/reportes/ventas",
    highlight: true,
  },
  {
    title: "Productos",
    description: "Productos más y menos vendidos, rendimiento por categoría y rotación.",
    icon: Package,
    href: "/admin/reportes/productos",
  },
  {
    title: "Opciones & Toppings",
    description: "Uso de tamaños, extras y toppings. Identifica combinaciones populares.",
    icon: BarChart3,
    href: "/admin/reportes/opciones",
  },
  {
    title: "Horarios",
    description: "Demanda por franja horaria y días pico para optimizar operación.",
    icon: Clock,
    href: "/admin/reportes/horarios",
  },
  {
    title: "Clientes",
    description: "Frecuencia de compra, recurrencia y patrones de consumo.",
    icon: Users,
    href: "/admin/reportes/clientes",
  },
  {
    title: "Pedidos",
    description: "Estados de pedidos, tiempos de preparación y eficiencia operativa.",
    icon: ShoppingCart,
    href: "/admin/reportes/pedidos",
  },
];

export default function ReportesHubPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight text-foreground">
              Reportes y Analítica
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Información estratégica para la toma de decisiones del restaurante.
              Todos los reportes permiten filtrar por fechas y exportar datos.
            </p>
          </div>

          {/* Grid de Reportes */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {REPORTES.map((r) => (
              <button
                key={r.title}
                onClick={() => router.push(r.href)}
                className={`group relative rounded-xl border bg-card p-6 text-left transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${
                  r.highlight
                    ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
                    : "border-border hover:border-primary/20"
                }`}
              >
                <div className="flex flex-col gap-4">
                  {/* Icon */}
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                    r.highlight 
                      ? "bg-primary/10 text-primary" 
                      : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  }`}>
                    <r.icon className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-foreground">{r.title}</h2>
                      {r.highlight && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {r.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                    <span>Ver reporte</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Tip Card */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex gap-4 items-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Consejo</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Usa los reportes para identificar horarios pico, optimizar precios y reducir cuellos de botella operativos.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}