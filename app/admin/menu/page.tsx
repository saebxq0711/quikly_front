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
} from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ArrowUpDown,
  FolderOpen,
  Package,
  Eye,
  EyeOff,
  Pencil,
  Upload,
  Utensils,
  LayoutGrid,
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
  const FILES = process.env.NEXT_PUBLIC_FILES_URL!;
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newCategoria, setNewCategoria] = useState({
    nombre: "",
    imagen: null as File | null,
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

    const formData = new FormData();
    formData.append("nombre", newCategoria.nombre);

    if (newCategoria.imagen) {
      formData.append("imagen", newCategoria.imagen);
    }

    const res = await fetch(`${API}/admin/restaurante/menu/categoria`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      setShowModal(false);
      setNewCategoria({ nombre: "", imagen: null });
      loadMenu();
    } else {
      console.error(await res.text());
    }

    setCreating(false);
  };

  useEffect(() => {
    loadMenu();
  }, []);

  const [editImageModal, setEditImageModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(
    null,
  );
  const [newImage, setNewImage] = useState<File | null>(null);
  const [updatingImage, setUpdatingImage] = useState(false);

  const toggleCategoriaEstado = async (cat: Categoria) => {
    const token = getToken();
    if (!token) return;

    const nuevoEstado = cat.estado_id === 1 ? 2 : 1;

    try {
      const res = await fetch(
        `${API}/admin/restaurante/menu/categoria/${cat.id_categoria}/estado`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado_id: nuevoEstado }),
        },
      );

      if (!res.ok) throw new Error("Error cambiando estado");

      const updated = await res.json();

      setCategorias((prev) =>
        prev.map((c) =>
          c.id_categoria === updated.id_categoria
            ? { ...c, estado_id: updated.estado_id }
            : c,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const updateCategoriaImagen = async () => {
    if (!selectedCategoria) return;

    const token = getToken();
    if (!token) return;

    setUpdatingImage(true);

    const formData = new FormData();
    formData.append("nombre", selectedCategoria.nombre);

    if (newImage) {
      formData.append("imagen", newImage);
    }

    try {
      const res = await fetch(
        `${API}/admin/restaurante/menu/categoria/${selectedCategoria.id_categoria}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!res.ok) throw new Error(await res.text());

      await loadMenu();

      setEditImageModal(false);
      setNewImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingImage(false);
    }
  };

  const filtered = categorias
    .filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.orden - b.orden);

  const totalProductos = categorias.reduce(
    (acc, c) => acc + c.productos.filter((p) => p.estado_id === 1).length,
    0,
  );

  const formatCOP = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando menú...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Menú del Comercio
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Administra las categorías y productos de tu menú
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/menu/orden")}
                className="h-10 gap-2"
              >
                <ArrowUpDown className="w-4 h-4" />
                Reordenar
              </Button>
              <Button
                onClick={() => setShowModal(true)}
                className="h-10 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                Nueva categoría
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Categorías
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {categorias.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Productos
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {totalProductos}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Activas
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {categorias.filter((c) => c.estado_id === 1).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search */}
          <div className="relative max-w-sm mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Buscar categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Categories Grid */}
          {filtered.length === 0 ? (
            <Card className="p-12 border border-dashed border-border bg-card/50">
              <div className="text-center">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground mb-1">
                  No hay categorías
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tu primera categoría para comenzar
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                  Crear categoría
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((cat) => {
                const productosActivos = cat.productos.filter(
                  (p) => Number(p.estado_id) === 1,
                );

                return (
                  <Card
                    key={cat.id_categoria}
                    onClick={() =>
                      router.push(`/admin/menu/categoria/${cat.id_categoria}`)
                    }
                    className={`group border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer overflow-hidden ${
                      cat.estado_id !== 1 ? "opacity-60" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-50 bg-muted bottom-6">
                      {cat.img_categoria ? (
                        <img
                          src={`${FILES}${cat.img_categoria}`}
                          alt={cat.nombre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                          <Utensils className="w-8 h-8 opacity-40" />
                        </div>
                      )}

                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium bg-background/90 text-foreground">
                        #{cat.orden}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategoria(cat);
                          setEditImageModal(true);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/90 hover:bg-background text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      <span
                        className={`absolute bottom-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                          cat.estado_id === 1
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {cat.estado_id === 1 ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                        {cat.estado_id === 1 ? "Activa" : "Inactiva"}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {cat.nombre}
                          </h2>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {productosActivos.length} producto
                            {productosActivos.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      {/* Products preview */}
                      {productosActivos.length === 0 ? (
                        <div className="py-3 px-3 rounded-md bg-muted/50 text-center">
                          <p className="text-xs text-muted-foreground">
                            Sin productos
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {productosActivos.slice(0, 2).map((p) => (
                            <div
                              key={p.id_producto}
                              className="flex items-center justify-between py-1.5 px-2 rounded-md bg-muted/50"
                            >
                              <span className="text-xs text-foreground truncate max-w-[60%]">
                                {p.nombre}
                              </span>
                              <span className="text-xs font-semibold text-primary">
                                {formatCOP(p.precio_base)}
                              </span>
                            </div>
                          ))}
                          {productosActivos.length > 2 && (
                            <p className="text-[10px] text-muted-foreground text-center pt-1">
                              +{productosActivos.length - 2} más
                            </p>
                          )}
                        </div>
                      )}

                      {/* Action */}
                      <div className="mt-3 pt-3 border-t border-border">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategoriaEstado(cat);
                          }}
                          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                            cat.estado_id === 1
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          }`}
                        >
                          {cat.estado_id === 1 ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              Activar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Create Category Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Nueva categoría
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Organiza tu menú creando una nueva categoría
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Nombre
              </label>
              <input
                placeholder="Ej: Bebidas, Postres..."
                value={newCategoria.nombre}
                onChange={(e) =>
                  setNewCategoria({ ...newCategoria, nombre: e.target.value })
                }
                className="w-full h-10 px-3 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Imagen (opcional)
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors bg-card">
                {newCategoria.imagen ? (
                  <img
                    src={URL.createObjectURL(newCategoria.imagen)}
                    className="w-full h-full object-cover rounded-lg"
                    alt="Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Subir imagen</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewCategoria({
                      ...newCategoria,
                      imagen: e.target.files?.[0] || null,
                    })
                  }
                  className="hidden"
                />
              </label>
              {newCategoria.imagen && (
                <button
                  onClick={() =>
                    setNewCategoria({ ...newCategoria, imagen: null })
                  }
                  className="text-xs text-red-500 hover:text-red-600 hover:underline"
                >
                  Quitar imagen
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
              className="h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={createCategoria}
              disabled={creating || !newCategoria.nombre.trim()}
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creating ? "Creando..." : "Crear categoría"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Image Modal */}
      <Dialog open={editImageModal} onOpenChange={setEditImageModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Cambiar imagen
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Actualiza la imagen de la categoría
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedCategoria?.img_categoria && !newImage && (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={`${FILES}${selectedCategoria.img_categoria}`}
                  className="w-full h-36 object-cover"
                  alt="Current"
                />
                <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                  <span className="text-background text-xs font-medium">
                    Imagen actual
                  </span>
                </div>
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors bg-card">
              {newImage ? (
                <img
                  src={URL.createObjectURL(newImage)}
                  className="w-full h-full object-cover rounded-lg"
                  alt="New"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Nueva imagen</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {newImage && (
              <button
                onClick={() => setNewImage(null)}
                className="text-xs text-red-500 hover:text-red-600 hover:underline"
              >
                Quitar imagen
              </button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setEditImageModal(false)}
              className="h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={updateCategoriaImagen}
              disabled={updatingImage}
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {updatingImage ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
