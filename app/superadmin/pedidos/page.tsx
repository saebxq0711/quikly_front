"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";

type Summary = {
  total_pedidos: number;
  total_vendido: number;
  ticket_promedio: number;
  estados: Record<string, number>; // ahora las claves vienen como strings del backend
};

type Pedido = {
  id_pedido: number;
  restaurante: string;
  cliente: string;
  total: number;
  estado_id: number;
  fecha: string;
};

type Restaurante = {
  id_restaurante: number;
  nombre: string;
};

// Estados con IDs reales del frontend
const estadoMap: Record<number, { label: string; className: string }> = {
  4: { label: "En preparación", className: "bg-blue-100 text-blue-700" },
  5: { label: "Pendiente", className: "bg-orange-100 text-orange-700" },
  6: { label: "Rechazado", className: "bg-red-100 text-red-700" },
  7: { label: "Entregado", className: "bg-green-100 text-green-700" },
};

// Mapeo de claves del backend a IDs frontend
const estadoKeyToId: Record<string, number> = {
  en_preparacion: 4,
  pendiente: 5,
  rechazado: 6,
  entregado: 7,
};

export default function PedidosPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState("2026-01-31");
  const [restauranteId, setRestauranteId] = useState<number | null>(null);
  const [estadoId, setEstadoId] = useState<number | null>(null);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(true);
  const [openRest, setOpenRest] = useState(false);

  const fetchRestaurantes = async () => {
    const res = await fetch(`${API}/superadmin/restaurantes`);
    const data = await res.json();
    setRestaurantes(data.items ?? []);
  };

  const fetchPedidos = async () => {
    const restQuery = restauranteId ? `&restaurante_id=${restauranteId}` : "";
    const estadoQuery = estadoId ? `&estado_id=${estadoId}` : "";
    const res = await fetch(
      `${API}/superadmin/pedidos?from_date=${fromDate}&to_date=${toDate}${restQuery}${estadoQuery}`,
    );
    const data = await res.json();
    setPedidos(data.items ?? []);
  };

  const fetchDashboard = async () => {
    setLoading(true);
    const restQuery = restauranteId ? `&restaurante_id=${restauranteId}` : "";
    const estadoQuery = estadoId ? `&estado_id=${estadoId}` : "";

    try {
      const res = await fetch(
        `${API}/superadmin/pedidos/summary?from_date=${fromDate}&to_date=${toDate}${restQuery}${estadoQuery}`,
      );
      setSummary(await res.json());
      await fetchPedidos();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    const restQuery = restauranteId ? `&restaurante_id=${restauranteId}` : "";
    const estadoQuery = estadoId ? `&estado_id=${estadoId}` : "";
    window.open(
      `${API}/superadmin/pedidos/export/excel?from_date=${fromDate}&to_date=${toDate}${restQuery}${estadoQuery}`,
      "_blank",
    );
  };

  const exportPDF = () => {
    const restQuery = restauranteId ? `&restaurante_id=${restauranteId}` : "";
    const estadoQuery = estadoId ? `&estado_id=${estadoId}` : "";
    window.open(
      `${API}/superadmin/pedidos/export/pdf?from_date=${fromDate}&to_date=${toDate}${restQuery}${estadoQuery}`,
      "_blank",
    );
  };

  useEffect(() => {
    fetchRestaurantes();
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">
        Cargando dashboard de pedidos…
      </p>
    );

  return (
    <div className="space-y-8 px-4 md:px-8">
      {/* FILTROS */}
      <Card className="p-6 flex flex-col md:flex-row md:items-end gap-4 shadow-md">
        {/* Fechas */}
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Desde</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Hasta</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>

        {/* Restaurante */}
        <div className="flex flex-col w-full md:w-64">
          <label className="text-sm font-medium mb-1">Restaurante</label>
          <Popover open={openRest} onOpenChange={setOpenRest}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {restauranteId
                  ? restaurantes.find((r) => r.id_restaurante === restauranteId)
                      ?.nombre
                  : "Todos los restaurantes…"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar por nombre o ID…" />
                <CommandEmpty>No encontrado.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  <CommandItem
                    value="0"
                    onSelect={() => {
                      setRestauranteId(null);
                      setOpenRest(false);
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${restauranteId === null ? "opacity-100" : "opacity-0"}`}
                    />
                    Todos los restaurantes
                  </CommandItem>
                  {restaurantes.map((r) => (
                    <CommandItem
                      key={r.id_restaurante}
                      value={`${r.nombre} ${r.id_restaurante}`}
                      onSelect={() => {
                        setRestauranteId(r.id_restaurante);
                        setOpenRest(false);
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${restauranteId === r.id_restaurante ? "opacity-100" : "opacity-0"}`}
                      />
                      {r.nombre}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Estado */}
        <div className="flex flex-col w-full md:w-48">
          <label className="text-sm font-medium mb-1">Estado</label>
          <select
            value={estadoId ?? 0}
            onChange={(e) => setEstadoId(Number(e.target.value) || null)}
            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            <option value={0}>Todos</option>
            {Object.entries(estadoMap).map(([id, { label }]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mt-2 md:mt-0">
          <Button onClick={fetchDashboard}>Aplicar</Button>
          <Button variant="outline" onClick={exportExcel}>
            Excel
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            PDF
          </Button>
        </div>
      </Card>

      {/* KPI CARDS */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
            <p className="text-gray-600 font-medium">Total pedidos</p>
            <p className="text-2xl font-bold">{summary.total_pedidos}</p>
          </Card>
          <Card className="p-5 bg-gradient-to-r from-green-50 to-green-100 shadow-lg">
            <p className="text-gray-600 font-medium">Total vendido</p>
            <p className="text-2xl font-bold">
              ${summary.total_vendido.toLocaleString()}
            </p>
          </Card>
          <Card className="p-5 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-lg">
            <p className="text-gray-600 font-medium">Ticket promedio</p>
            <p className="text-2xl font-bold">
              ${summary.ticket_promedio.toFixed(0)}
            </p>
          </Card>
          <Card className="p-5 bg-white shadow-lg space-y-2">
            <p className="text-gray-600 font-medium">Estados</p>
            {Object.entries(summary.estados).map(([key, count]) => {
              const id = estadoKeyToId[key] ?? 0;
              return (
                <div key={key} className="flex justify-between text-sm">
                  <span>{estadoMap[id]?.label || "Desconocido"}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* TABLA PEDIDOS */}
      <Card className="p-6 shadow-md overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 text-gray-600 font-medium uppercase text-sm">
            <tr>
              <th className="px-4 py-3 text-left">Pedido</th>
              <th className="px-4 py-3 text-left">Restaurante</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400">
                  No hay pedidos para los filtros seleccionados
                </td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr key={p.id_pedido} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 text-left">#{p.id_pedido}</td>
                  <td className="px-4 py-3 text-left">{p.restaurante}</td>
                  <td className="px-4 py-3 text-left">{p.cliente}</td>
                  <td className="px-4 py-3 text-right">
                    ${p.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-left">
                    <Badge
                      className={
                        estadoMap[p.estado_id]?.className ||
                        "bg-gray-100 text-gray-700"
                      }
                    >
                      {estadoMap[p.estado_id]?.label || "Desconocido"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-left">{p.fecha}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
