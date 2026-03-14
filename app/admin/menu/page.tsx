"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ArrowUpDown,
  FolderOpen,
  Package,
  ImageIcon,
  ChevronRight,
  Utensils,
  X,
} from "lucide-react";

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

export default function MenuAdminPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newCategoria, setNewCategoria] = useState({
    nombre: "",
    img_categoria: "",
  });
  const [creating, setCreating] = useState(false);

  const getToken = () => localStorage.getItem("access_token");

  const loadMenu = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/restaurante/menu`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCategorias(data.categorias ?? []);
    } catch (err) {
      console.error("Error cargando menú:", err);
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async () => {
    const token = getToken();
    if (!token || !newCategoria.nombre.trim()) return;

    setCreating(true);
    const res = await fetch(`${API}/admin/restaurante/menu/categoria`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newCategoria),
    });

    if (res.ok) {
      setShowModal(false);
      setNewCategoria({ nombre: "", img_categoria: "" });
      loadMenu();
    } else {
      console.error(await res.text());
    }
    setCreating(false);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const filtered = categorias
    .filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.orden - b.orden);

  const totalProductos = categorias.reduce((acc, c) => acc + c.productos.length, 0);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">Cargando menú...</p>
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Menú del Restaurante</h1>
              <p className="text-muted-foreground mt-1">
                Administra las categorías y productos de tu menú
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/menu/orden")}
                className="gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                Reordenar
              </Button>
              <Button onClick={() => setShowModal(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4" />
                Nueva categoría
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categorías</p>
                  <p className="text-2xl font-bold text-foreground">{categorias.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Productos</p>
                  <p className="text-2xl font-bold text-foreground">{totalProductos}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <Utensils className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {categorias.filter((c) => c.estado_id === 1).length}
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
                placeholder="Buscar categoría..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </Card>

          {/* Categories Grid */}
          {filtered.length === 0 ? (
            <Card className="p-12 bg-card border-0 shadow-sm">
              <div className="text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">No hay categorías</p>
                <p className="text-muted-foreground">Crea tu primera categoría para comenzar</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((cat) => (
                <Card
                  key={cat.id_categoria}
                  onClick={() => router.push(`/admin/menu/categoria/${cat.id_categoria}`)}
                  className="group bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  {/* Category Image */}
                  <div className="relative h-32 bg-muted/50 overflow-hidden">
                    {cat.img_categoria ? (
                      <img
                        src={cat.img_categoria}
                        alt={cat.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-card/90 backdrop-blur-sm text-foreground">
                        #{cat.orden}
                      </span>
                    </div>
                  </div>

                  {/* Category Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {cat.nombre}
                      </h2>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    {cat.productos.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin productos</p>
                    ) : (
                      <div className="space-y-2">
                        {cat.productos.slice(0, 3).map((p) => (
                          <div
                            key={p.id_producto}
                            className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0"
                          >
                            <span className="text-foreground truncate max-w-[60%]">{p.nombre}</span>
                            <span className="font-semibold text-foreground">${p.precio_base}</span>
                          </div>
                        ))}
                        {cat.productos.length > 3 && (
                          <p className="text-xs text-muted-foreground pt-1">
                            +{cat.productos.length - 3} productos más
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {cat.productos.length} producto{cat.productos.length !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          cat.estado_id === 1
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {cat.estado_id === 1 ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nueva categoría</DialogTitle>
            <DialogDescription>
              Agrega una nueva categoría a tu menú
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <input
                placeholder="Ej: Bebidas, Postres, Entradas..."
                value={newCategoria.nombre}
                onChange={(e) => setNewCategoria({ ...newCategoria, nombre: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URL de imagen (opcional)</label>
              <input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={newCategoria.img_categoria}
                onChange={(e) => setNewCategoria({ ...newCategoria, img_categoria: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={createCategoria}
              disabled={creating || !newCategoria.nombre.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creating ? "Creando..." : "Crear categoría"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}