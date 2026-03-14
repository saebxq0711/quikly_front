"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Restaurante = {
  id_restaurante: number;
  nombre: string;
  logo?: string | null;
  estado_id: number;
  fecha_creacion: string;
};

const estadoMap: Record<number, { label: string; className: string }> = {
  1: { label: "Activo", className: "bg-green-100 text-green-700" },
  2: { label: "Inactivo", className: "bg-yellow-100 text-yellow-700" },
  3: { label: "Eliminado", className: "bg-red-100 text-red-700" },
};

export default function RestaurantesPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const FILES_BASE = process.env.NEXT_PUBLIC_FILES_URL;

  // Estado principal
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<null | number>(null);

  // Paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const fetchRestaurantes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);
      if (estadoFilter) params.append("estado", estadoFilter.toString());

      const res = await fetch(`${API}/superadmin/restaurantes?${params}`);
      const data = await res.json();

      // Siempre asegurar un array
      setRestaurantes(data?.items ?? []);
      setTotalPages(data?.total_pages ?? 1);
    } catch (e) {
      console.error("Error cargando restaurantes", e);
      setRestaurantes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurantes();
  }, [page, search, estadoFilter]);

  if (loading) return <p className="text-gray-500">Cargando restaurantes…</p>;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Buscar por nombre o ID…"
          className="max-w-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={estadoFilter ?? ""}
          onChange={(e) =>
            setEstadoFilter(e.target.value ? Number(e.target.value) : null)
          }
          className="border rounded px-2 py-1"
        >
          <option value="">Todos los estados</option>
          <option value={1}>Activos</option>
          <option value={2}>Inactivos</option>
          <option value={3}>Eliminados</option>
        </select>

        <Link href="/superadmin/restaurantes/nuevo">
          <Button>+ Nuevo restaurante</Button>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {restaurantes.length > 0 ? (
          restaurantes.map((r) => (
            <Link
              key={r.id_restaurante}
              href={`/superadmin/restaurantes/${r.id_restaurante}`}
            >
              <Card className="p-4 hover:shadow-md transition cursor-pointer">
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <div className="w-14 h-14 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                    {r.logo ? (
                      <img
                        src={`${FILES_BASE}${r.logo}`}
                        alt={r.nombre}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Logo</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold">{r.nombre}</p>
                    <p className="text-xs text-gray-400">
                      ID #{r.id_restaurante}
                    </p>
                  </div>

                  {/* Estado */}
                  <Badge className={estadoMap[r.estado_id]?.className}>
                    {estadoMap[r.estado_id]?.label ?? "Desconocido"}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-gray-400 col-span-full text-center py-10">
            No se encontraron restaurantes
          </p>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="flex items-center px-2">
            {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
