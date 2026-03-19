"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarAdmin from "../../../components/SidebarAdmin";
import HeaderAdmin from "../../../components/HeaderAdmin";
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
  ArrowLeft,
  Plus,
  DollarSign,
  Layers,
  Package,
  ToggleLeft,
  ToggleRight,
  Settings2,
  Grip,
} from "lucide-react";

type Opcion = {
  id_opcion_producto: number;
  nombre: string;
  precio_adicional: number;
  estado_id: number;
};

type Grupo = {
  id_grupo_opcion: number;
  nombre: string;
  tipo: "tamaño" | "topping";
  max: number;
  opciones: Opcion[];
};

type Producto = {
  id_producto: number;
  nombre: string;
  precio_base: number;
  grupos: Grupo[];
};

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL!;

  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  const [grupoModal, setGrupoModal] = useState(false);
  const [opcionModal, setOpcionModal] = useState<number | null>(null);

  const [grupoNombre, setGrupoNombre] = useState("");
  const [grupoTipo, setGrupoTipo] = useState<"tamaño" | "topping">("tamaño");
  const [grupoMax, setGrupoMax] = useState(3);
  const [creatingGrupo, setCreatingGrupo] = useState(false);

  const [opcionNombre, setOpcionNombre] = useState("");
  const [opcionPrecio, setOpcionPrecio] = useState(0);
  const [creatingOpcion, setCreatingOpcion] = useState(false);

  const token = () => localStorage.getItem("access_token");

  const cargarProducto = async () => {
    setLoading(true);
    const res = await fetch(`${API}/admin/restaurante/menu/producto/${id}`, {
      headers: { Authorization: `Bearer ${token()}` },
    });
    setProducto(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    cargarProducto();
  }, [id]);

  const crearGrupo = async () => {
    if (!grupoNombre.trim()) return;
    setCreatingGrupo(true);

    await fetch(`${API}/admin/restaurante/menu/producto/${id}/grupo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        nombre: grupoNombre,
        tipo: grupoTipo,
        obligatorio: grupoTipo === "tamaño",
        min_selecciones: grupoTipo === "tamaño" ? 1 : 0,
        max_selecciones: grupoTipo === "tamaño" ? 1 : grupoMax,
      }),
    });

    setGrupoModal(false);
    setGrupoNombre("");
    setGrupoTipo("tamaño");
    setGrupoMax(3);
    setCreatingGrupo(false);
    cargarProducto();
  };

  const crearOpcion = async () => {
    if (!opcionModal || !opcionNombre.trim()) return;
    setCreatingOpcion(true);

    await fetch(`${API}/admin/restaurante/menu/grupo/${opcionModal}/opcion`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        nombre: opcionNombre,
        precio_adicional: opcionPrecio,
      }),
    });

    setOpcionModal(null);
    setOpcionNombre("");
    setOpcionPrecio(0);
    setCreatingOpcion(false);
    cargarProducto();
  };

  const toggleOpcion = async (idOpcion: number) => {
    await fetch(`${API}/admin/restaurante/menu/opcion/${idOpcion}/estado`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
    });
    cargarProducto();
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
              <p className="text-muted-foreground font-medium">Cargando producto...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <Card className="p-8 text-center max-w-md">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Producto no encontrado</h2>
              <p className="text-muted-foreground">El producto solicitado no existe.</p>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  const totalOpciones = producto.grupos.reduce((acc, g) => acc + g.opciones.length, 0);

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
            Volver
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{producto.nombre}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Precio base:</span>
                  <span className="font-semibold text-foreground">${producto.precio_base}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => setGrupoModal(true)} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
              Nuevo grupo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Layers className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Grupos</p>
                  <p className="text-2xl font-bold text-foreground">{producto.grupos.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Settings2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Opciones</p>
                  <p className="text-2xl font-bold text-foreground">{totalOpciones}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <DollarSign className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio base</p>
                  <p className="text-2xl font-bold text-foreground">${producto.precio_base}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Groups */}
          {producto.grupos.length === 0 ? (
            <Card className="p-12 bg-card border-0 shadow-sm">
              <div className="text-center">
                <Layers className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground mb-1">Sin grupos de opciones</p>
                <p className="text-muted-foreground mb-4">
                  Agrega grupos para permitir personalizaciones
                </p>
                <Button onClick={() => setGrupoModal(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Crear primer grupo
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {producto.grupos.map((g) => (
                <Card key={g.id_grupo_opcion} className="bg-card border-0 shadow-sm overflow-hidden">
                  {/* Group Header */}
                  <div className="p-5 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          g.tipo === "tamaño" ? "bg-primary/10" : "bg-amber-50"
                        }`}
                      >
                        <Grip
                          className={`w-5 h-5 ${
                            g.tipo === "tamaño" ? "text-primary" : "text-amber-600"
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{g.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                          {g.tipo === "tamaño"
                            ? "Selección obligatoria (1 opción)"
                            : `Hasta ${g.max} selecciones`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpcionModal(g.id_grupo_opcion)}
                      className="gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar opción
                    </Button>
                  </div>

                  {/* Options List */}
                  <div className="divide-y divide-border">
                    {g.opciones.length === 0 ? (
                      <div className="p-6 text-center">
                        <p className="text-muted-foreground">No hay opciones en este grupo</p>
                      </div>
                    ) : (
                      g.opciones.map((o) => (
                        <div
                          key={o.id_opcion_producto}
                          className={`flex items-center justify-between p-4 hover:bg-muted/30 transition-colors ${
                            o.estado_id === 2 ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center">
                              <span className="text-sm font-medium text-foreground">
                                {o.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{o.nombre}</p>
                              <p className="text-sm text-muted-foreground">
                                +${o.precio_adicional.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOpcion(o.id_opcion_producto)}
                            className={`gap-2 ${
                              o.estado_id === 1
                                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {o.estado_id === 1 ? (
                              <>
                                <ToggleRight className="w-5 h-5" />
                                Activo
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-5 h-5" />
                                Inactivo
                              </>
                            )}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal: New Group */}
      <Dialog open={grupoModal} onOpenChange={setGrupoModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo grupo de opciones</DialogTitle>
            <DialogDescription>
              Define cómo el cliente podrá personalizar este producto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre del grupo</label>
              <input
                placeholder="Ej: Tamaño, Toppings, Extras..."
                value={grupoNombre}
                onChange={(e) => setGrupoNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tipo de grupo</label>
              <select
                value={grupoTipo}
                onChange={(e) => setGrupoTipo(e.target.value as "tamaño" | "topping")}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="tamaño">Tamaños (selección única obligatoria)</option>
                <option value="topping">Toppings (selección múltiple opcional)</option>
              </select>
            </div>

            {grupoTipo === "topping" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Máximo de selecciones</label>
                <input
                  type="number"
                  min={1}
                  value={grupoMax}
                  onChange={(e) => setGrupoMax(+e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGrupoModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={crearGrupo}
              disabled={creatingGrupo || !grupoNombre.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creatingGrupo ? "Creando..." : "Crear grupo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: New Option */}
      <Dialog open={!!opcionModal} onOpenChange={() => setOpcionModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva opción</DialogTitle>
            <DialogDescription>
              Esta opción estará disponible para el cliente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nombre</label>
              <input
                placeholder="Ej: Grande, Extra queso, Sin cebolla..."
                value={opcionNombre}
                onChange={(e) => setOpcionNombre(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Precio adicional</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={opcionPrecio}
                  onChange={(e) => setOpcionPrecio(+e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpcionModal(null)}>
              Cancelar
            </Button>
            <Button
              onClick={crearOpcion}
              disabled={creatingOpcion || !opcionNombre.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {creatingOpcion ? "Creando..." : "Crear opción"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}