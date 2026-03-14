"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type Restaurante = {
  id_restaurante: number;
  nombre: string;
  logo?: string;
  estado_id: number;
  fecha_creacion: string;
};

type Stats = {
  total_pedidos: number;
  total_vendido: number;
  estados: Record<string, number>;
  top_productos: {
    producto: string;
    cantidad: number;
    total_vendido: number;
  }[];
};

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  img_producto?: string;
  estado_id: number;
};

type Categoria = {
  id_categoria: number;
  nombre: string;
  img_categoria?: string;
  orden: number;
  estado_id: number;
  productos: Producto[];
};

export default function RestaurantePage() {
  const { id } = useParams();
  const API = process.env.NEXT_PUBLIC_API_URL;
  const FILES_BASE = process.env.NEXT_PUBLIC_FILES_URL;

  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [menu, setMenu] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const estadoMap: Record<number, { label: string; className: string }> = {
    1: { label: "Activo", className: "bg-green-100 text-green-700" },
    2: { label: "Inactivo", className: "bg-yellow-100 text-yellow-700" },
    3: { label: "Eliminado", className: "bg-red-100 text-red-700" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resR, resS, resM] = await Promise.all([
          fetch(`${API}/superadmin/restaurantes/${id}`),
          fetch(`${API}/superadmin/restaurantes/${id}/stats`),
          fetch(`${API}/superadmin/restaurantes/${id}/menu`),
        ]);

        setRestaurante(await resR.json());
        setStats(await resS.json());

        const menuData = await resM.json();
        setMenu(menuData.categorias ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading)
    return (
      <p className="mt-10 text-center text-gray-500">Cargando restaurante…</p>
    );
  if (!restaurante)
    return (
      <p className="mt-10 text-center text-red-500">
        Restaurante no encontrado
      </p>
    );

  const handleEstado = (nuevoEstado: number) => {
    if (nuevoEstado === 3) {
      setShowDeleteModal(true);
      return;
    }
    updateEstado(nuevoEstado);
  };

  const updateEstado = async (nuevoEstado: number) => {
    const formData = new FormData();
    formData.append("estado_id", nuevoEstado.toString());
    const res = await fetch(`${API}/superadmin/restaurantes/${id}`, {
      method: "PATCH",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setRestaurante({ ...restaurante, estado_id: data.estado_id });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setLogoFile(e.target.files[0]);
  };

  const handleUploadLogo = async () => {
    if (!logoFile) return;
    const formData = new FormData();
    formData.append("logo", logoFile);
    const res = await fetch(`${API}/superadmin/restaurantes/${id}/logo`, {
      method: "PATCH",
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      setRestaurante({ ...restaurante, logo: data.logo });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-6">
      {/* INFORMACIÓN GENERAL */}
      <Card className="flex flex-col sm:flex-row gap-6 p-6 shadow-lg rounded-xl border border-gray-100">
        {restaurante.logo && (
          <img
            src={`${FILES_BASE}${restaurante.logo}`}
            alt={restaurante.nombre}
            className="w-32 h-32 object-contain rounded-lg border border-gray-200"
          />
        )}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{restaurante.nombre}</h1>
            <p className="text-sm text-gray-500 mb-2">
              ID: {restaurante.id_restaurante}
            </p>
            <Badge
              className={`px-3 py-1 rounded-full ${estadoMap[restaurante.estado_id].className}`}
            >
              {estadoMap[restaurante.estado_id].label}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <Button onClick={() => handleEstado(1)}>Activar</Button>
            <Button onClick={() => handleEstado(2)}>Desactivar</Button>
            <Button variant="destructive" onClick={() => handleEstado(3)}>
              Eliminar
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <Input
              type="file"
              onChange={handleLogoChange}
              className="sm:w-auto w-full"
            />
            <Button onClick={handleUploadLogo}>Actualizar Logo</Button>
          </div>
        </div>
      </Card>

      {/* MODAL DELETE */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>Esta acción es irreversible.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-3">
            <Button onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => updateEstado(3)}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ESTADÍSTICAS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 shadow-md rounded-xl border border-gray-100 flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100">
            <p className="text-sm font-medium text-gray-500">Total pedidos</p>
            <p className="mt-2 text-2xl font-bold">{stats.total_pedidos}</p>
          </Card>
          <Card className="p-6 shadow-md rounded-xl border border-gray-100 flex flex-col items-center justify-center bg-gradient-to-r from-green-50 to-green-100">
            <p className="text-sm font-medium text-gray-500">Total vendido</p>
            <p className="mt-2 text-2xl font-bold">
              ${stats.total_vendido.toFixed(2)}
            </p>
          </Card>
          <Card className="p-6 shadow-md rounded-xl border border-gray-100 flex flex-col items-center justify-center bg-gradient-to-r from-purple-50 to-purple-100">
            <p className="text-sm font-medium text-gray-500">Productos top</p>
            <ul className="mt-2 text-sm text-gray-700">
              {stats.top_productos.map((p) => (
                <li key={p.producto}>
                  {p.producto} - {p.cantidad} uds
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* MENÚ POR CATEGORÍAS */}
      <div className="space-y-12">
        {menu.map((categoria) => (
          <div key={categoria.id_categoria}>
            {/* CABECERA DE CATEGORÍA */}
            <div className="flex items-center gap-4 mb-6">
              {categoria.img_categoria && (
                <img
                  src={`${FILES_BASE}${categoria.img_categoria}`}
                  alt={categoria.nombre}
                  className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                />
              )}
              <h2 className="text-2xl font-bold">{categoria.nombre}</h2>
            </div>

            {/* GRID 100% FLUIDO, TARJETAS COMPACTAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {categoria.productos.map((p) => (
                <Card
                  key={p.id_producto}
                  className="flex flex-col p-3 shadow-sm rounded-lg border border-gray-100 hover:shadow-md hover:scale-105 transition-transform duration-150"
                >
                  {p.img_producto && (
                    <img
                      src={`${FILES_BASE}${p.img_producto}`}
                      alt={p.nombre}
                      className="h-28 w-full object-cover rounded-md mb-2"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-md font-semibold truncate">
                      {p.nombre}
                    </h3>
                    {p.descripcion && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {p.descripcion}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 font-medium text-gray-800">
                    ${p.precio_base}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
