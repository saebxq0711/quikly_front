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
  Utensils,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const [openModal, setOpenModal] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);

  const [categoria, setCategoria] = useState<CategoriaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getToken = () => localStorage.getItem("access_token");

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

  useEffect(() => {
    load();
  }, [id]);

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.append("categoria_id", id); // 👈 CLAVE

    const token = getToken();

    try {
      const res = await fetch(`${API}/admin/restaurante/menu/producto`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      console.log("Producto creado:", data);

      setOpenModal(false);
      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const updateProductoImagen = async (id_producto: number, file: File) => {
    const token = getToken();
    if (!token) return;

    const formData = new FormData();
    formData.append("imagen", file);

    try {
      const res = await fetch(
        `${API}/admin/restaurante/menu/producto/${id_producto}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!res.ok) throw new Error(await res.text());

      await load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImagePreview(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const filteredProducts =
    categoria?.productos.filter((p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const activeCount =
    categoria?.productos.filter((p) => p.estado_id === 1).length ?? 0;

  const toggleProductoEstado = async (id_producto: number) => {
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(
        `${API}/admin/restaurante/menu/producto/${id_producto}/estado`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) throw new Error(await res.text());

      await load();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!openModal) {
      setImagePreview(null);
    }
  }, [openModal]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">
                Cargando productos...
              </p>
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
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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
            <Button
              onClick={() => setOpenModal(true)}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
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
                  <p className="text-sm font-medium text-muted-foreground">
                    Total productos
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {categoria?.productos.length ?? 0}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Activos
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {activeCount}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <EyeOff className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Inactivos
                  </p>
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
                <p className="text-lg font-medium text-foreground mb-1">
                  No hay productos
                </p>
                <p className="text-muted-foreground">
                  Agrega productos a esta categoría
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p) => (
                <Card
                  key={p.id_producto}
                  onClick={() =>
                    router.push(
                      `/admin/menu/producto/${p.id_producto}?categoria=${id}`,
                    )
                  }
                  className={`group bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                    p.estado_id !== 1 ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex gap-4 p-5">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                      {/* Fallback */}
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground z-0">
                        <Utensils className="w-5 h-5 opacity-50" />
                      </div>

                      {/* Imagen */}
                      {p.img_producto ? (
                        <img
                          key={p.img_producto} // 👈 importante
                          src={p.img_producto}
                          alt={`Imagen de ${p.nombre}`}
                          className="w-full h-full object-cover z-10 relative"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null}

                      {/* Upload overlay */}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const preview = URL.createObjectURL(file);

                          // 🔥 update inmediato en UI
                          setCategoria((prev) => {
                            if (!prev) return prev;

                            return {
                              ...prev,
                              productos: prev.productos.map((prod) =>
                                prod.id_producto === p.id_producto
                                  ? { ...prod, img_producto: preview }
                                  : prod,
                              ),
                            };
                          });

                          updateProductoImagen(p.id_producto, file);
                        }}
                      />
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
                          <span className="font-bold text-foreground">
                            {p.precio_base}
                          </span>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // 🧠 CLAVE
                              toggleProductoEstado(p.id_producto);
                            }}
                            className="p-2 rounded-lg hover:bg-muted"
                          >
                            {p.estado_id === 1 ? (
                              <Eye className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-red-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Crear nuevo producto
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Agrega un producto atractivo a tu menú
              </p>
            </DialogHeader>
          </div>

          <form onSubmit={handleCreateProduct} className="p-6 space-y-6">
            {/* Layout principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT: imagen */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Imagen del producto
                </label>

                <div className="relative w-full h-48 rounded-xl border-2 border-dashed border-muted flex items-center justify-center overflow-hidden bg-muted/30 hover:bg-muted/50 transition">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Subir imagen
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    name="imagen"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) =>
                      handleImageChange(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </div>

              {/* RIGHT: inputs */}
              <div className="space-y-4">
                {/* Nombre */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    name="nombre"
                    required
                    placeholder="Ej: Hamburguesa BBQ"
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  />
                </div>

                {/* Precio */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Precio</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="precio_base"
                      type="number"
                      required
                      placeholder="0.00"
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/50 border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Descripción</label>
                  <textarea
                    name="descripcion"
                    placeholder="Describe el producto..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenModal(false)}
              >
                Cancelar
              </Button>
              <Button
                disabled={creating}
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {creating ? "Creando..." : "Crear producto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
