"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarAdmin from "../../../components/SidebarAdmin";
import HeaderAdmin from "../../../components/HeaderAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  ImageIcon,
  DollarSign,
  Eye,
  EyeOff,
  Search,
  Plus,
  ChevronRight,
} from "lucide-react";

type Producto = {
  id_producto: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  img_producto?: string;
  estado_id: number;
};

type CategoriaDetalle = {
  id_categoria: number;
  nombre: string;
  productos: Producto[];
};

export default function CategoriaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL!;

  const [categoria, setCategoria] = useState<CategoriaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getToken = () => localStorage.getItem("access_token");

  useEffect(() => {
    const load = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await fetch(`${API}/admin/restaurante/menu/categoria/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setCategoria(data);
      } catch (err) {
        console.error("Error cargando categoría:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const filteredProducts = categoria?.productos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const activeCount = categoria?.productos.filter((p) => p.estado_id === 1).length ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">Cargando productos...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="flex-1 p-8 space-y-8 overflow-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al menú
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {categoria?.nombre ?? "Categoría"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestiona los productos de esta categoría
              </p>
            </div>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Nuevo producto
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total productos</p>
                  <p className="text-2xl font-bold text-foreground">{categoria?.productos.length ?? 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <EyeOff className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inactivos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(categoria?.productos.length ?? 0) - activeCount}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <Card className="p-4 bg-card border-0 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                placeholder="Buscar producto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Card>

          {/* Products Grid */}
          {!categoria || filteredProducts.length === 0 ? (
            <Card className="p-12 bg-card border-0 shadow-sm">
              <div className="text-center">
                <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">No hay productos</p>
                <p className="text-muted-foreground">Agrega productos a esta categoría</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <Card
                  key={p.id_producto}
                  onClick={() => router.push(`/admin/menu/producto/${p.id_producto}?categoria=${id}`)}
                  className={`group bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                    p.estado_id !== 1 ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex gap-4 p-5">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-xl bg-muted/50 overflow-hidden flex-shrink-0">
                      {p.img_producto ? (
                        <img
                          src={p.img_producto}
                          alt={p.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {p.nombre}
                          </h3>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        {p.descripcion && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {p.descripcion}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-foreground">{p.precio_base}</span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            p.estado_id === 1
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {p.estado_id === 1 ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}