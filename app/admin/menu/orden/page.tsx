"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SidebarAdmin from "../../components/SidebarAdmin";
import HeaderAdmin from "../../components/HeaderAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Save,
  RotateCcw,
  Layers,
} from "lucide-react";

type Categoria = {
  id_categoria: number;
  nombre: string;
  orden: number;
};

export default function OrdenCategoriasPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const router = useRouter();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [originalCategorias, setOriginalCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const getToken = () => localStorage.getItem("access_token");

  const loadCategorias = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    const res = await fetch(`${API}/admin/restaurante/menu`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    const sorted = (data.categorias ?? []).sort((a: Categoria, b: Categoria) => a.orden - b.orden);
    setCategorias(sorted);
    setOriginalCategorias(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    const isEqual = JSON.stringify(categorias.map((c) => c.id_categoria)) ===
      JSON.stringify(originalCategorias.map((c) => c.id_categoria));
    setHasChanges(!isEqual);
  }, [categorias, originalCategorias]);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= categorias.length) return;
    const copy = [...categorias];
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    setCategorias(copy);
  };

  const resetOrder = () => {
    setCategorias([...originalCategorias]);
  };

  const saveOrden = async () => {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    const payload = categorias.map((c, i) => ({
      id_categoria: c.id_categoria,
      orden: i + 1,
    }));

    await fetch(`${API}/admin/restaurante/menu/orden`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    router.push("/admin/menu");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground font-medium">Cargando categorías...</p>
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
              <h1 className="text-2xl font-bold text-foreground">Ordenar Categorías</h1>
              <p className="text-muted-foreground mt-1">
                Arrastra o usa las flechas para cambiar el orden de las categorías
              </p>
            </div>
            <div className="flex items-center gap-3">
              {hasChanges && (
                <Button variant="outline" onClick={resetOrder} className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Restablecer
                </Button>
              )}
              <Button
                onClick={saveOrden}
                disabled={saving || !hasChanges}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4" />
                {saving ? "Guardando..." : "Guardar orden"}
              </Button>
            </div>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-primary/5 border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {categorias.length} categorías en total
                </p>
                <p className="text-xs text-muted-foreground">
                  {hasChanges ? "Tienes cambios sin guardar" : "El orden está actualizado"}
                </p>
              </div>
            </div>
          </Card>

          {/* Categories List */}
          <Card className="bg-card border-0 shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {categorias.map((cat, i) => (
                <div
                  key={cat.id_categoria}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                >
                  {/* Drag Handle */}
                  <div className="text-muted-foreground/50 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Order Number */}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>

                  {/* Category Name */}
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{cat.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      Orden actual: {cat.orden}
                    </p>
                  </div>

                  {/* Move Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === 0}
                      onClick={() => move(i, i - 1)}
                      className="w-9 h-9 rounded-lg"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === categorias.length - 1}
                      onClick={() => move(i, i + 1)}
                      className="w-9 h-9 rounded-lg"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              onClick={saveOrden}
              disabled={saving || !hasChanges}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-4 h-4" />
              {saving ? "Guardando..." : "Guardar orden"}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}