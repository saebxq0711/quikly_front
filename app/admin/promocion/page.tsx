"use client";

import { useEffect, useState, useMemo } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Percent,
  Plus,
  Clock,
  Calendar,
  ImageIcon,
  Tag,
  DollarSign,
  Search,
  Package,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Power,
  PowerOff,
  Info,
  Eye,
  ChevronRight,
} from "lucide-react";

const FILES = process.env.NEXT_PUBLIC_FILES_URL!;
const API = process.env.NEXT_PUBLIC_API_URL!;

const DIAS_SEMANA = [
  { label: "Lun", fullLabel: "Lunes", value: "1" },
  { label: "Mar", fullLabel: "Martes", value: "2" },
  { label: "Mié", fullLabel: "Miércoles", value: "3" },
  { label: "Jue", fullLabel: "Jueves", value: "4" },
  { label: "Vie", fullLabel: "Viernes", value: "5" },
  { label: "Sáb", fullLabel: "Sábado", value: "6" },
  { label: "Dom", fullLabel: "Domingo", value: "7" },
];

type ProductoSeleccionado = {
  id: number;
  nombre: string;
  precio: number;
  tipo_descuento: "porcentaje" | "monto";
  descuento: number;
};

type Toast = {
  id: string;
  type: "success" | "error" | "warning";
  message: string;
};

type ConflictoProducto = {
  productoId: number;
  productoNombre: string;
  promoTitulo: string;
  promoDescuento: string;
  promoDias: string;
  promoHorario: string;
};

export default function PromocionAdminPage() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [loading, setLoading] = useState(true);
  const [promociones, setPromociones] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [searchProducto, setSearchProducto] = useState("");
  const [nuevaPromo, setNuevaPromo] = useState({
    titulo: "",
    descripcion: "",
    dias_semana: [] as string[],
    hora_inicio: "",
    hora_fin: "",
  });
  const [flyer, setFlyer] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    ProductoSeleccionado[]
  >([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [creating, setCreating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Estados para modales
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    promoId: number | null;
    promoTitle: string;
  }>({ open: false, promoId: null, promoTitle: "" });

  const [conflictoAlert, setConflictoAlert] = useState<{
    open: boolean;
    conflictos: ConflictoProducto[];
  }>({ open: false, conflictos: [] });

  const [promoDetailModal, setPromoDetailModal] = useState<{
    open: boolean;
    promo: any | null;
  }>({ open: false, promo: null });

  const [activeTab, setActiveTab] = useState("crear");

  // Toast helpers
  const addToast = (type: Toast["type"], message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helpers para detectar conflictos
  const horariosSeCruzan = (
    inicio1: string,
    fin1: string,
    inicio2: string,
    fin2: string,
  ) => {
    return inicio1 < fin2 && inicio2 < fin1;
  };

  const diasSeCruzan = (dias1: string[], dias2: string) => {
    const set2 = new Set(dias2.split(","));
    return dias1.some((d) => set2.has(d));
  };

  // Detectar conflictos de productos en tiempo real
  const conflictosProductos = useMemo(() => {
    if (
      !nuevaPromo.dias_semana.length ||
      !nuevaPromo.hora_inicio ||
      !nuevaPromo.hora_fin ||
      !productosSeleccionados.length
    ) {
      return [];
    }

    const conflictos: ConflictoProducto[] = [];

    // Para cada producto seleccionado
    productosSeleccionados.forEach((prodSel) => {
      // Revisar cada promoción activa
      promociones
        .filter((p) => p.estado_id === 1) // Solo promociones activas
        .forEach((promo) => {
          // Verificar si el producto está en esta promoción
          const productoEnPromo = promo.productos?.find(
            (pp: any) => pp.producto_id === prodSel.id,
          );

          if (productoEnPromo) {
            // Verificar si los días se cruzan
            if (diasSeCruzan(nuevaPromo.dias_semana, promo.dias_semana)) {
              // Verificar si los horarios se cruzan
              if (
                horariosSeCruzan(
                  nuevaPromo.hora_inicio,
                  nuevaPromo.hora_fin,
                  promo.hora_inicio,
                  promo.hora_fin,
                )
              ) {
                const descuentoTexto =
                  productoEnPromo.tipo_descuento === "porcentaje"
                    ? `${productoEnPromo.valor_descuento}%`
                    : `$${productoEnPromo.valor_descuento}`;

                conflictos.push({
                  productoId: prodSel.id,
                  productoNombre: prodSel.nombre,
                  promoTitulo: promo.titulo,
                  promoDescuento: descuentoTexto,
                  promoDias: promo.dias_semana,
                  promoHorario: `${promo.hora_inicio} - ${promo.hora_fin}`,
                });
              }
            }
          }
        });
    });

    return conflictos;
  }, [
    nuevaPromo.dias_semana,
    nuevaPromo.hora_inicio,
    nuevaPromo.hora_fin,
    productosSeleccionados,
    promociones,
  ]);

  // Obtener conflictos por producto específico (para mostrar alerta en cada producto)
  const getConflictosProducto = (productoId: number) => {
    return conflictosProductos.filter((c) => c.productoId === productoId);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const resPromos = await fetch(`${API}/admin/restaurante/promocion/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const promos = await resPromos.json();
      setPromociones(
        Array.isArray(promos) ? promos.filter((p) => p.estado_id !== 3) : [],
      );

      const resProd = await fetch(`${API}/admin/restaurante/productos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prods = await resProd.json();
      setProductos(Array.isArray(prods) ? prods : []);
    } catch (e) {
      console.error(e);
      addToast("error", "Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleDia = (dia: string) => {
    setNuevaPromo((prev) => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter((d) => d !== dia)
        : [...prev.dias_semana, dia],
    }));
  };

  const toggleProducto = (prod: any) => {
    setProductosSeleccionados((prev) => {
      const exists = prev.find((p) => p.id === prod.id);
      if (exists) return prev.filter((p) => p.id !== prod.id);
      return [
        ...prev,
        {
          id: prod.id,
          nombre: prod.nombre,
          precio: prod.precio,
          tipo_descuento: "porcentaje",
          descuento: 0,
        },
      ];
    });
  };

  const handleDescuento = (
    id: number,
    tipo: "porcentaje" | "monto",
    value: number,
  ) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, tipo_descuento: tipo, descuento: value } : p,
      ),
    );
  };

  const crearPromocion = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!nuevaPromo.titulo.trim())
      newErrors.titulo = "El título es obligatorio";
    if (!nuevaPromo.dias_semana.length)
      newErrors.dias_semana = "Selecciona al menos un día";
    if (!productosSeleccionados.length)
      newErrors.productos = "Selecciona al menos un producto";

    const horaRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!horaRegex.test(nuevaPromo.hora_inicio))
      newErrors.hora_inicio = "Hora de inicio inválida";
    if (!horaRegex.test(nuevaPromo.hora_fin))
      newErrors.hora_fin = "Hora de fin inválida";

    productosSeleccionados.forEach((p) => {
      if (
        p.tipo_descuento === "porcentaje" &&
        (p.descuento < 0 || p.descuento > 100)
      )
        newErrors[`descuento_${p.id}`] = "El % debe estar entre 0 y 100";
      if (p.tipo_descuento === "monto" && p.descuento < 0)
        newErrors[`descuento_${p.id}`] = "El monto no puede ser negativo";
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    // Mostrar alerta de conflictos si existen productos con promociones cruzadas
    if (conflictosProductos.length > 0) {
      setConflictoAlert({ open: true, conflictos: conflictosProductos });
      return;
    }

    await ejecutarCreacion();
  };

  const ejecutarCreacion = async () => {
    setCreating(true);
    const form = new FormData();
    form.append("titulo", nuevaPromo.titulo);
    form.append("descripcion", nuevaPromo.descripcion);
    form.append("dias_semana", nuevaPromo.dias_semana.join(","));
    form.append("hora_inicio", nuevaPromo.hora_inicio);
    form.append("hora_fin", nuevaPromo.hora_fin);
    if (flyer) form.append("flyer", flyer);

    try {
      const res = await fetch(`${API}/admin/restaurante/promocion/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrors({ form: data?.detail || "Error al crear promoción" });
        addToast("error", data?.detail || "Error al crear promoción");
        setCreating(false);
        return;
      }

      const promo = await res.json();

      for (const prod of productosSeleccionados) {
        await fetch(
          `${API}/admin/restaurante/promocion/${promo.id_promocion}/producto`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              producto_id: prod.id,
              tipo_descuento: prod.tipo_descuento,
              valor_descuento: prod.descuento,
            }),
          },
        );
      }

      setNuevaPromo({
        titulo: "",
        descripcion: "",
        dias_semana: [],
        hora_inicio: "",
        hora_fin: "",
      });
      setFlyer(null);
      setPreview(null);
      setProductosSeleccionados([]);
      setErrors({});
      addToast("success", "Promoción creada exitosamente");
      loadData();
      setActiveTab("lista");
    } catch {
      setErrors({ form: "Error de red o servidor" });
      addToast("error", "Error de red o servidor");
    } finally {
      setCreating(false);
    }
  };

  const toggleEstadoPromo = async (id: number, estado: number) => {
    const nuevoEstado = estado === 1 ? 2 : 1;

    setPromociones((prev) =>
      prev.map((p) =>
        p.id_promocion === id ? { ...p, estado_id: nuevoEstado } : p,
      ),
    );

    try {
      const res = await fetch(
        `${API}/admin/restaurante/promocion/${id}/estado`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado_id: nuevoEstado }),
        },
      );
      if (!res.ok) {
        setPromociones((prev) =>
          prev.map((p) =>
            p.id_promocion === id ? { ...p, estado_id: estado } : p,
          ),
        );
        addToast("error", "Error al cambiar el estado");
      } else {
        addToast(
          "success",
          nuevoEstado === 1 ? "Promoción activada" : "Promoción desactivada",
        );
      }
    } catch {
      setPromociones((prev) =>
        prev.map((p) =>
          p.id_promocion === id ? { ...p, estado_id: estado } : p,
        ),
      );
      addToast("error", "Error de conexión");
    }
  };

  const eliminarPromocion = async () => {
    if (!deleteModal.promoId) return;

    try {
      const res = await fetch(
        `${API}/admin/restaurante/promocion/${deleteModal.promoId}/estado`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado_id: 3 }),
        },
      );

      if (res.ok) {
        setPromociones((prev) =>
          prev.filter((p) => p.id_promocion !== deleteModal.promoId),
        );
        addToast("success", "Promoción eliminada correctamente");
      } else {
        addToast("error", "Error al eliminar la promoción");
      }
    } catch {
      addToast("error", "Error de conexión");
    } finally {
      setDeleteModal({ open: false, promoId: null, promoTitle: "" });
    }
  };

  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchProducto.toLowerCase()),
  );

  const activePromos = promociones.filter((p) => p.estado_id === 1).length;
  const inactivePromos = promociones.filter((p) => p.estado_id === 2).length;

  const getDiasLabel = (dias: string) => {
    return dias
      .split(",")
      .map((d) => DIAS_SEMANA.find((ds) => ds.value === d)?.label || d)
      .join(", ");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <SidebarAdmin />
        <div className="flex-1 flex flex-col">
          <HeaderAdmin />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/20 rounded-full" />
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0" />
              </div>
              <p className="text-muted-foreground font-medium">
                Cargando promociones...
              </p>
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

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
          {/* Toast Container */}
          <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-right-5 ${
                  toast.type === "success"
                    ? "bg-emerald-500 text-white"
                    : toast.type === "error"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-amber-500 text-white"
                }`}
              >
                {toast.type === "success" && (
                  <CheckCircle2 className="w-5 h-5" />
                )}
                {toast.type === "error" && <X className="w-5 h-5" />}
                {toast.type === "warning" && (
                  <AlertTriangle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-2 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Gestión de Promociones
              </h1>
              <p className="text-muted-foreground mt-1">
                Crea, administra y controla las promociones de tu restaurante
              </p>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 bg-card border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Percent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {promociones.length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10">
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Activas
                  </p>
                  <p className="text-2xl font-bold text-emerald-500">
                    {activePromos}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <PowerOff className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Inactivas
                  </p>
                  <p className="text-2xl font-bold text-amber-500">
                    {inactivePromos}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-5 bg-card border border-border/50 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <Package className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Productos
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    {productos.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="lista" className="gap-2">
                <Percent className="w-4 h-4" />
                Promociones
              </TabsTrigger>
              <TabsTrigger value="crear" className="gap-2">
                <Plus className="w-4 h-4" />
                Crear Nueva
              </TabsTrigger>
            </TabsList>

            {/* Lista de Promociones */}
            <TabsContent value="lista" className="space-y-6">
              {promociones.length === 0 ? (
                <Card className="p-12 bg-card border border-border/50">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Percent className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-semibold text-foreground mb-2">
                      No hay promociones
                    </p>
                    <p className="text-muted-foreground mb-6">
                      Crea tu primera promoción para atraer más clientes
                    </p>
                    <Button
                      onClick={() => setActiveTab("crear")}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Promoción
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {promociones.map((p) => (
                    <Card
                      key={p.id_promocion}
                      className="group bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Promo Image */}
                      <div className="relative h-44 bg-muted/30 overflow-hidden">
                        {p.img_flyer ? (
                          <img
                            src={`${FILES}${p.img_flyer}`}
                            alt={p.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5">
                            <Percent className="w-16 h-16 text-primary/20" />
                          </div>
                        )}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge
                            className={`${
                              p.estado_id === 1
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-muted-foreground/80 hover:bg-muted-foreground"
                            } text-white border-0`}
                          >
                            {p.estado_id === 1 ? (
                              <>
                                <Power className="w-3 h-3 mr-1" />
                                Activa
                              </>
                            ) : (
                              <>
                                <PowerOff className="w-3 h-3 mr-1" />
                                Inactiva
                              </>
                            )}
                          </Badge>
                        </div>

                        {/* Quick Actions */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              setPromoDetailModal({ open: true, promo: p })
                            }
                            className="p-2 rounded-lg bg-white/90 hover:bg-white text-foreground transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                promoId: p.id_promocion,
                                promoTitle: p.titulo,
                              })
                            }
                            className="p-2 rounded-lg bg-destructive/90 hover:bg-destructive text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Title on image */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="font-bold text-white text-lg truncate">
                            {p.titulo}
                          </h3>
                        </div>
                      </div>

                      {/* Promo Content */}
                      <div className="p-4 space-y-4">
                        {p.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {p.descripcion}
                          </p>
                        )}

                        {/* Schedule Info */}
                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {getDiasLabel(p.dias_semana)}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {p.hora_inicio} - {p.hora_fin}
                          </div>
                        </div>

                        {/* Productos en promoción */}
                        {p.productos && p.productos.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Package className="w-3.5 h-3.5" />
                            <span>{p.productos.length} productos</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              toggleEstadoPromo(p.id_promocion, p.estado_id)
                            }
                            className={`flex-1 gap-2 ${
                              p.estado_id === 1
                                ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                : "border-amber-500/30 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            {p.estado_id === 1 ? (
                              <>
                                <PowerOff className="w-4 h-4" />
                                Desactivar
                              </>
                            ) : (
                              <>
                                <Power className="w-4 h-4" />
                                Activar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDeleteModal({
                                open: true,
                                promoId: p.id_promocion,
                                promoTitle: p.titulo,
                              })
                            }
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Crear Promoción */}
            <TabsContent value="crear" className="space-y-6">
              {/* Alerta de Conflictos de Productos en tiempo real */}
              {conflictosProductos.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-700">
                        Conflicto de productos detectado
                      </p>
                      <p className="text-sm text-amber-600 mt-1">
                        Los siguientes productos ya tienen descuentos en otras
                        promociones que se cruzan con el horario seleccionado:
                      </p>
                      <div className="mt-3 space-y-2">
                        {conflictosProductos.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                          >
                            <Package className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-amber-800 truncate">
                                {c.productoNombre}
                              </p>
                              <p className="text-xs text-amber-600">
                                Ya tiene{" "}
                                <span className="font-semibold">
                                  {c.promoDescuento}
                                </span>{" "}
                                de descuento en "{c.promoTitulo}"
                              </p>
                              <p className="text-xs text-amber-500">
                                Horario: {c.promoHorario}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Card className="bg-card border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        Nueva Promoción
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Completa los detalles para crear una nueva promoción
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Información Básica */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Título de la promoción *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 2x1 en pizzas, Happy Hour..."
                          value={nuevaPromo.titulo}
                          onChange={(e) =>
                            setNuevaPromo({
                              ...nuevaPromo,
                              titulo: e.target.value,
                            })
                          }
                          className={`w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                            errors.titulo
                              ? "border-destructive ring-2 ring-destructive/20"
                              : ""
                          }`}
                        />
                        {errors.titulo && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {errors.titulo}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Descripción{" "}
                          <span className="text-muted-foreground font-normal">
                            (opcional)
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Describe tu promoción..."
                          value={nuevaPromo.descripcion}
                          onChange={(e) =>
                            setNuevaPromo({
                              ...nuevaPromo,
                              descripcion: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Horario */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Días y Horario
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                          Días de la semana *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DIAS_SEMANA.map((d) => {
                            const isSelected = nuevaPromo.dias_semana.includes(
                              d.value,
                            );
                            return (
                              <button
                                key={d.value}
                                type="button"
                                onClick={() => toggleDia(d.value)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                                }`}
                              >
                                {d.fullLabel}
                              </button>
                            );
                          })}
                        </div>
                        {errors.dias_semana && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {errors.dias_semana}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Hora de inicio *
                          </label>
                          <input
                            type="time"
                            value={nuevaPromo.hora_inicio}
                            onChange={(e) =>
                              setNuevaPromo({
                                ...nuevaPromo,
                                hora_inicio: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                              errors.hora_inicio
                                ? "border-destructive ring-2 ring-destructive/20"
                                : ""
                            }`}
                          />
                          {errors.hora_inicio && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {errors.hora_inicio}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Hora de fin *
                          </label>
                          <input
                            type="time"
                            value={nuevaPromo.hora_fin}
                            onChange={(e) =>
                              setNuevaPromo({
                                ...nuevaPromo,
                                hora_fin: e.target.value,
                              })
                            }
                            className={`w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
                              errors.hora_fin
                                ? "border-destructive ring-2 ring-destructive/20"
                                : ""
                            }`}
                          />
                          {errors.hora_fin && (
                            <p className="text-xs text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              {errors.hora_fin}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Flyer Upload */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      Imagen Promocional
                    </h3>
                    <div className="flex items-start gap-4">
                      <label
                        className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          preview
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setFlyer(f);
                            setPreview(URL.createObjectURL(f));
                          }}
                        />
                        <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-foreground">
                          Haz clic para subir una imagen
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG o WebP hasta 5MB
                        </p>
                      </label>

                      {preview && (
                        <div className="relative group">
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-36 w-36 object-cover rounded-xl shadow-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setFlyer(null);
                              setPreview(null);
                            }}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        Productos y Descuentos
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {productosSeleccionados.length} seleccionados
                      </Badge>
                    </div>

                    {/* Search Products */}
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchProducto}
                        onChange={(e) => setSearchProducto(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>

                    {errors.productos && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.productos}
                      </p>
                    )}

                    {/* Products List */}
                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                      {filteredProductos.map((prod) => {
                        const sel = productosSeleccionados.find(
                          (p) => p.id === prod.id,
                        );
                        const precioFinal = sel
                          ? sel.tipo_descuento === "porcentaje"
                            ? (
                                (prod.precio * (100 - sel.descuento)) /
                                100
                              ).toFixed(2)
                            : (prod.precio - sel.descuento).toFixed(2)
                          : null;

                        // Obtener conflictos para este producto específico
                        const conflictosDelProducto = sel
                          ? getConflictosProducto(prod.id)
                          : [];
                        const tieneConflicto = conflictosDelProducto.length > 0;

                        return (
                          <div
                            key={prod.id}
                            className={`p-4 rounded-xl transition-all border ${
                              sel
                                ? tieneConflicto
                                  ? "bg-amber-500/5 border-amber-500/30 shadow-sm"
                                  : "bg-primary/5 border-primary/30 shadow-sm"
                                : "bg-muted/30 border-transparent hover:bg-muted/50 hover:border-border"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => toggleProducto(prod)}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                                  sel
                                    ? tieneConflicto
                                      ? "bg-amber-500 text-white shadow-md"
                                      : "bg-primary text-primary-foreground shadow-md"
                                    : "bg-card border-2 border-border hover:border-primary/50"
                                }`}
                              >
                                {sel && <CheckCircle2 className="w-4 h-4" />}
                              </button>

                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {prod.nombre}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  ${prod.precio.toFixed(2)}
                                </p>
                              </div>

                              {sel && (
                                <div className="flex items-center gap-2 flex-wrap justify-end">
                                  <select
                                    value={sel.tipo_descuento}
                                    onChange={(e) =>
                                      handleDescuento(
                                        prod.id,
                                        e.target.value as any,
                                        sel.descuento,
                                      )
                                    }
                                    className="px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                  >
                                    <option value="porcentaje">%</option>
                                    <option value="monto">$</option>
                                  </select>
                                  <input
                                    type="number"
                                    min={0}
                                    max={
                                      sel.tipo_descuento === "porcentaje"
                                        ? 100
                                        : prod.precio
                                    }
                                    value={sel.descuento}
                                    onChange={(e) =>
                                      handleDescuento(
                                        prod.id,
                                        sel.tipo_descuento,
                                        +e.target.value,
                                      )
                                    }
                                    className="w-20 px-3 py-2 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                  />
                                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-sm font-semibold">
                                      {precioFinal}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Alerta de conflicto para este producto específico */}
                            {sel && tieneConflicto && (
                              <div className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                  <div className="text-xs text-amber-700">
                                    <p className="font-medium">
                                      Este producto ya tiene descuento en:
                                    </p>
                                    {conflictosDelProducto.map((c, i) => (
                                      <p key={i} className="mt-1">
                                        • "{c.promoTitulo}" ({c.promoDescuento}{" "}
                                        off) - {c.promoHorario}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error Message */}
                  {errors.form && (
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      {errors.form}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setNuevaPromo({
                          titulo: "",
                          descripcion: "",
                          dias_semana: [],
                          hora_inicio: "",
                          hora_fin: "",
                        });
                        setFlyer(null);
                        setPreview(null);
                        setProductosSeleccionados([]);
                        setErrors({});
                      }}
                      className="px-6"
                    >
                      Limpiar
                    </Button>
                    <Button
                      onClick={crearPromocion}
                      disabled={creating}
                      className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 shadow-lg shadow-primary/25"
                    >
                      {creating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Crear Promoción
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      <AlertDialog
        open={deleteModal.open}
        onOpenChange={(open) =>
          setDeleteModal({ open, promoId: null, promoTitle: "" })
        }
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center">
              ¿Eliminar promoción?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Estás a punto de eliminar la promoción{" "}
              <span className="font-semibold text-foreground">
                "{deleteModal.promoTitle}"
              </span>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel className="sm:w-32">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={eliminarPromocion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:w-32"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Alerta de Conflictos de Productos */}
      <AlertDialog
        open={conflictoAlert.open}
        onOpenChange={(open) => setConflictoAlert({ open, conflictos: [] })}
      >
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-center">
              Conflicto de Productos
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Algunos productos ya tienen descuentos en otras promociones
              activas que se cruzan con el horario seleccionado:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 max-h-60 overflow-y-auto space-y-2">
            {conflictoAlert.conflictos.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
              >
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">
                      {c.productoNombre}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ya tiene{" "}
                      <span className="font-semibold text-amber-600">
                        {c.promoDescuento}
                      </span>{" "}
                      en "{c.promoTitulo}"
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Horario: {c.promoHorario}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-center text-muted-foreground">
            Si continúas, los clientes podrían ver diferentes descuentos para el
            mismo producto en horarios similares.
          </p>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
            <AlertDialogCancel className="sm:w-32">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConflictoAlert({ open: false, conflictos: [] });
                ejecutarCreacion();
              }}
              className="bg-amber-500 text-white hover:bg-amber-600 sm:w-44"
            >
              Crear de todas formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Detalle de Promoción */}
      <Dialog
        open={promoDetailModal.open}
        onOpenChange={(open) => setPromoDetailModal({ open, promo: null })}
      >
        <DialogContent className="max-w-lg">
          {promoDetailModal.promo && (
            <>
              <DialogHeader>
                <DialogTitle>{promoDetailModal.promo.titulo}</DialogTitle>
                <DialogDescription>Detalles de la promoción</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {promoDetailModal.promo.img_flyer && (
                  <img
                    src={`${FILES}${promoDetailModal.promo.img_flyer}`}
                    alt={promoDetailModal.promo.titulo}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                )}
                {promoDetailModal.promo.descripcion && (
                  <p className="text-muted-foreground">
                    {promoDetailModal.promo.descripcion}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Días
                    </p>
                    <p className="font-medium">
                      {getDiasLabel(promoDetailModal.promo.dias_semana)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Horario
                    </p>
                    <p className="font-medium">
                      {promoDetailModal.promo.hora_inicio} -{" "}
                      {promoDetailModal.promo.hora_fin}
                    </p>
                  </div>
                </div>

                {/* Productos en la promoción */}
                {promoDetailModal.promo.productos &&
                  promoDetailModal.promo.productos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Productos con descuento
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {promoDetailModal.promo.productos.map(
                          (pp: any, idx: number) => {
                            const producto = productos.find(
                              (p) => p.id === pp.producto_id,
                            );
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                              >
                                <span className="font-medium">
                                  {producto?.nombre ||
                                    `Producto ${pp.producto_id}`}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-500/10 text-emerald-600"
                                >
                                  {pp.tipo_descuento === "porcentaje"
                                    ? `${pp.valor_descuento}% OFF`
                                    : `$${pp.valor_descuento} OFF`}
                                </Badge>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>
                  )}

                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Estado
                  </p>
                  <Badge
                    className={
                      promoDetailModal.promo.estado_id === 1
                        ? "bg-emerald-500"
                        : "bg-muted-foreground"
                    }
                  >
                    {promoDetailModal.promo.estado_id === 1
                      ? "Activa"
                      : "Inactiva"}
                  </Badge>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPromoDetailModal({ open: false, promo: null })
                  }
                >
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
