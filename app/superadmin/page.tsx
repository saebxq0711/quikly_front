"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import { Users, Store, ShoppingBag, DollarSign, Clock, XCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

type DashboardData = {
  usuarios: {
    total: number;
    activos: number;
    inactivos: number;
    por_rol: { rol: string; total: number }[];
  };
  restaurantes: {
    total: number;
    activos: number;
    inactivos: number;
    por_restaurante: {
      nombre: string;
      total_pedidos: number;
      pedidos_pendientes: number;
      pedidos_rechazados: number;
      ingresos: number;
      ticket_promedio: number;
    }[];
  };
  pedidos: {
    total: number;
    hoy: number;
    semana: number;
    mes: number;
    ingresos: number;
    ticket_promedio: number;
    por_estado: { estado: string; total: number }[];
  };
  productos_top: {
    producto: string;
    cantidad: number;
    total_vendido: number;
  }[];
};

const COLORS = ["#f97316", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function SuperAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/superadmin/dashboard`);
        if (!res.ok) throw new Error("No se pudo cargar el dashboard");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="p-6 border-destructive/50 bg-destructive/5">
          <p className="text-destructive text-center">{error}</p>
        </Card>
      </div>
    );
  }
  
  if (!data) return null;

  const safeNumber = (v: any) => (typeof v === "number" ? v : 0);

  const usuariosPorRol = Array.isArray(data.usuarios.por_rol) ? data.usuarios.por_rol : [];
  const pedidosPorEstado = Array.isArray(data.pedidos.por_estado) ? data.pedidos.por_estado : [];
  const restaurantes = Array.isArray(data.restaurantes.por_restaurante) ? data.restaurantes.por_restaurante : [];
  const productosTop = Array.isArray(data.productos_top) ? data.productos_top : [];

  const pedidosEstadoData = {
    labels: pedidosPorEstado.map((d) => d.estado),
    datasets: [
      {
        data: pedidosPorEstado.map((d) => safeNumber(d.total)),
        backgroundColor: COLORS,
        borderWidth: 0,
      },
    ],
  };

  const ingresosPorRestauranteData = {
    labels: restaurantes.map((r) => r.nombre),
    datasets: [
      {
        label: "Ingresos",
        data: restaurantes.map((r) => safeNumber(r.ingresos)),
        backgroundColor: "#f97316",
        borderRadius: 8,
      },
    ],
  };

  const productosTopData = {
    labels: productosTop.map((d) => d.producto),
    datasets: [
      {
        label: "Cantidad vendida",
        data: productosTop.map((d) => safeNumber(d.cantidad)),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#10b981",
      },
    ],
  };

  const kpis = [
    { 
      label: "Usuarios totales", 
      value: safeNumber(data.usuarios.total), 
      icon: Users, 
      color: "bg-blue-500/10 text-blue-600",
      trend: "+12%",
      trendUp: true
    },
    { 
      label: "Restaurantes activos", 
      value: safeNumber(data.restaurantes.activos), 
      icon: Store, 
      color: "bg-emerald-500/10 text-emerald-600",
      trend: "+5%",
      trendUp: true
    },
    { 
      label: "Pedidos del mes", 
      value: safeNumber(data.pedidos.mes), 
      icon: ShoppingBag, 
      color: "bg-orange-500/10 text-orange-600",
      trend: "+23%",
      trendUp: true
    },
    { 
      label: "Ingresos totales", 
      value: `$${safeNumber(data.pedidos.ingresos).toLocaleString()}`, 
      icon: DollarSign, 
      color: "bg-green-500/10 text-green-600",
      trend: "+18%",
      trendUp: true
    },
    { 
      label: "Pedidos pendientes", 
      value: restaurantes.reduce((sum, r) => sum + safeNumber(r.pedidos_pendientes), 0), 
      icon: Clock, 
      color: "bg-amber-500/10 text-amber-600",
      trend: "-8%",
      trendUp: false
    },
    { 
      label: "Pedidos rechazados", 
      value: restaurantes.reduce((sum, r) => sum + safeNumber(r.pedidos_rechazados), 0), 
      icon: XCircle, 
      color: "bg-red-500/10 text-red-600",
      trend: "-15%",
      trendUp: false
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de la plataforma</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-accent" />
          <span className="text-sm font-medium text-accent">Rendimiento positivo</span>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-4 hover:shadow-lg transition-shadow border-0 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.trend}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4">Pedidos por estado</h2>
          <div className="h-64 flex items-center justify-center">
            {pedidosPorEstado.length ? (
              <Doughnut 
                data={pedidosEstadoData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } }
                  },
                  cutout: '60%'
                }}
              />
            ) : (
              <p className="text-muted-foreground">No hay datos</p>
            )}
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-sm">
          <h2 className="font-semibold text-foreground mb-4">Ingresos por restaurante</h2>
          <div className="h-64">
            {restaurantes.length ? (
              <Bar 
                data={ingresosPorRestauranteData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true }
                  }
                }}
              />
            ) : (
              <p className="text-muted-foreground">No hay datos</p>
            )}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="font-semibold text-foreground mb-4">Productos mas vendidos</h2>
        <div className="h-72">
          {productosTop.length ? (
            <Line 
              data={productosTopData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true }
                }
              }}
            />
          ) : (
            <p className="text-muted-foreground">No hay datos</p>
          )}
        </div>
      </Card>

      {/* Restaurants Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-semibold text-foreground">Restaurantes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Restaurante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pedidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Pendientes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ingresos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {restaurantes.map((r, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Store className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{r.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-foreground">{safeNumber(r.total_pedidos)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                      {safeNumber(r.pedidos_pendientes)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-foreground font-medium">${safeNumber(r.ingresos).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">${safeNumber(r.ticket_promedio).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
