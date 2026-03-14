"use client";

import { useEffect, useState } from "react";
import Guard from "@/lib/guards";
import HeaderAdmin from "./components/HeaderAdmin";
import SidebarAdmin from "./components/SidebarAdmin";
import { Card } from "@/components/ui/card";
import { useRestaurante } from "./context/RestauranteContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

type PedidoReciente = {
  id_pedido: number;
  total: number;
  estado: string;
  hora: string;
};
type PedidoPorHora = { hora: number; pedidos: number };
type VentaPorHora = { hora: number; ventas: number };

type DashboardData = {
  kpis: {
    pedidos_hoy: number;
    ventas_hoy: number;
    ticket_promedio: number;
    pedidos_activos: number;
  };
  pedidos_recientes: PedidoReciente[];
  pedidos_por_hora: PedidoPorHora[];
  ventas_por_hora: VentaPorHora[];
};

const estadoStyles: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700 border-amber-200",
  preparando: "bg-blue-100 text-blue-700 border-blue-200",
  listo: "bg-green-100 text-green-700 border-green-200",
  entregado: "bg-gray-100 text-gray-700 border-gray-200",
  cancelado: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminRestaurantePage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { restaurante } = useRestaurante();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API}/admin/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("No se pudo cargar el dashboard");

        const json = await res.json();

        const pedidos_recientes: PedidoReciente[] = (
          json.pedidos_recientes || []
        ).map((p: any) => ({
          id_pedido: p.id_pedido,
          total: Number(p.total),
          estado: p.estado,
          hora: p.hora,
        }));

        setData({
          kpis: json.kpis,
          pedidos_recientes,
          pedidos_por_hora: json.pedidos_por_hora || [],
          ventas_por_hora: json.ventas_por_hora || [],
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [API]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <Activity className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error al cargar</h2>
          <p className="text-muted-foreground">
            No se pudo cargar el dashboard. Intenta nuevamente.
          </p>
        </Card>
      </div>
    );
  }

  const pedidosPorHoraData = {
    labels: data.pedidos_por_hora.map((p) => `${p.hora}:00`),
    datasets: [
      {
        label: "Pedidos",
        data: data.pedidos_por_hora.map((p) => p.pedidos),
        backgroundColor: "#5CCFE6",
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  const ventasPorHoraData = {
    labels: data.ventas_por_hora.map((v) => `${v.hora}:00`),
    datasets: [
      {
        label: "Ventas",
        data: data.ventas_por_hora.map((v) => v.ventas),
        backgroundColor: "#0a0a0a",
        borderRadius: 8,
        maxBarThickness: 32,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0a0a0a",
        titleColor: "#fff",
        bodyColor: "#fff",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) =>
            context.dataset.label === "Ventas"
              ? `$${context.raw.toFixed(2)}`
              : `${context.raw} pedidos`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#a3a3a3", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f5f5f5" },
        ticks: { color: "#a3a3a3", font: { size: 11 } },
      },
    },
  };

  const kpiCards = [
    {
      label: "Pedidos hoy",
      value: data.kpis.pedidos_hoy,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Ventas hoy",
      value: `$${data.kpis.ventas_hoy.toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Ticket promedio",
      value: `$${data.kpis.ticket_promedio.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Pedidos activos",
      value: data.kpis.pedidos_activos,
      icon: Activity,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
    },
  ];

  return (
    <Guard allowedRoles={["admin_restaurante"]}>
      <div className="flex min-h-screen bg-muted/30">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 p-8 space-y-8">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Bienvenido de vuelta
                </h2>
                <p className="text-muted-foreground mt-1">
                  Aquí tienes un resumen de la actividad de hoy
                </p>
              </div>
            </div>

            {/* KPIs */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiCards.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <Card
                    key={index}
                    className="p-6 bg-card hover:shadow-lg transition-all duration-300 border-0 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                        <Icon className={`w-6 h-6 ${kpi.color}`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-3xl font-bold text-foreground mt-1 tracking-tight">
                        {kpi.value}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-0 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Pedidos por hora
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Distribución de pedidos durante el día
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    Hoy
                  </div>
                </div>
                <div className="h-64">
                  <Bar data={pedidosPorHoraData} options={chartOptions} />
                </div>
              </Card>

              <Card className="p-6 bg-card border-0 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Ventas por hora
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Ingresos generados durante el día
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground bg-muted px-3 py-1.5 rounded-full">
                    <DollarSign className="w-3.5 h-3.5" />
                    USD
                  </div>
                </div>
                <div className="h-64">
                  <Bar data={ventasPorHoraData} options={chartOptions} />
                </div>
              </Card>
            </section>

            {/* Recent Orders */}
            <section>
              <Card className="bg-card border-0 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Pedidos recientes
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Últimos pedidos realizados
                      </p>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                      {data.pedidos_recientes.length} pedidos
                    </span>
                  </div>
                </div>
                {data.pedidos_recientes.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No hay pedidos recientes
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            ID Pedido
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Hora
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.pedidos_recientes.map((p) => (
                          <tr
                            key={p.id_pedido}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-medium text-foreground">
                                #{p.id_pedido}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                                  estadoStyles[p.estado.toLowerCase()] ||
                                  "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {p.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                {p.hora}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-semibold text-foreground">
                                ${p.total.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </section>
          </main>
        </div>
      </div>
    </Guard>
  );
}
