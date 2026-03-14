"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Percent,
  Plus,
  Clock,
  Calendar,
  ImageIcon,
  Tag,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Search,
  Package,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
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

  const loadData = async () => {
    setLoading(true);
    try {
      const resPromos = await fetch(`${API}/admin/restaurante/promocion/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const promos = await resPromos.json();
      setPromociones(Array.isArray(promos) ? promos : []);

      const resProd = await fetch(`${API}/admin/restaurante/productos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const prods = await resProd.json();
      setProductos(Array.isArray(prods) ? prods : []);
    } catch (e) {
      console.error(e);
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
      loadData();
    } catch {
      setErrors({ form: "Error de red o servidor" });
    } finally {
      setCreating(false);
    }
  };

  const toggleEstadoPromo = async (id: number, estado: number) => {
    setPromociones((prev) =>
      prev.map((p) =>
        p.id_promocion === id ? { ...p, estado_id: estado === 1 ? 2 : 1 } : p,
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
          body: JSON.stringify({ estado_id: estado === 1 ? 2 : 1 }),
        },
      );
      if (!res.ok) {
        setPromociones((prev) =>
          prev.map((p) =>
            p.id_promocion === id ? { ...p, estado_id: estado } : p,
          ),
        );
      }
    } catch {
      setPromociones((prev) =>
        prev.map((p) =>
          p.id_promocion === id ? { ...p, estado_id: estado } : p,
        ),
      );
    }
  };

  const filteredProductos = productos.filter((p) =>
    p.nombre.toLowerCase().includes(searchProducto.toLowerCase()),
  );

  const activePromos = promociones.filter((p) => p.estado_id === 1).length;

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
                Cargando promociones...
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
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Promociones</h1>
            <p className="text-muted-foreground mt-1">
              Crea y gestiona las promociones de tu restaurante
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Percent className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total promociones
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {promociones.length}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Activas
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {activePromos}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 bg-card border-0 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Productos disponibles
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {productos.length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create Promotion Form */}
          <Card className="bg-card border-0 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Crear nueva promoción
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Configura los detalles de tu promoción
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Title and Description */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Título de la promoción
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 2x1 en pizzas, Happy Hour..."
                    value={nuevaPromo.titulo}
                    onChange={(e) =>
                      setNuevaPromo({ ...nuevaPromo, titulo: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.titulo ? "ring-2 ring-destructive/50" : ""
                    }`}
                  />
                  {errors.titulo && (
                    <p className="text-xs text-destructive">{errors.titulo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Descripción (opcional)
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
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Days Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Días de la semana
                </label>
                <div className="flex flex-wrap gap-2">
                  {DIAS_SEMANA.map((d) => {
                    const isSelected = nuevaPromo.dias_semana.includes(d.value);
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => toggleDia(d.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
                {errors.dias_semana && (
                  <p className="text-xs text-destructive">
                    {errors.dias_semana}
                  </p>
                )}
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Hora de inicio
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
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.hora_inicio ? "ring-2 ring-destructive/50" : ""
                    }`}
                  />
                  {errors.hora_inicio && (
                    <p className="text-xs text-destructive">
                      {errors.hora_inicio}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Hora de fin
                  </label>
                  <input
                    type="time"
                    value={nuevaPromo.hora_fin}
                    onChange={(e) =>
                      setNuevaPromo({ ...nuevaPromo, hora_fin: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl bg-muted/50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.hora_fin ? "ring-2 ring-destructive/50" : ""
                    }`}
                  />
                  {errors.hora_fin && (
                    <p className="text-xs text-destructive">
                      {errors.hora_fin}
                    </p>
                  )}
                </div>
              </div>

              {/* Flyer Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  Flyer de la promoción (opcional)
                </label>
                <div className="flex items-start gap-4">
                  <label
                    className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      preview
                        ? "border-primary/30 bg-primary/5"
                        : "border-muted-foreground/20 hover:border-primary/30 hover:bg-muted/30"
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
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">
                      Haz clic para subir
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG hasta 5MB
                    </p>
                  </label>

                  {preview && (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFlyer(null);
                          setPreview(null);
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
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
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Productos y descuentos
                  </label>
                  <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                    {productosSeleccionados.length} seleccionados
                  </span>
                </div>

                {/* Search Products */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchProducto}
                    onChange={(e) => setSearchProducto(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {errors.productos && (
                  <p className="text-xs text-destructive">{errors.productos}</p>
                )}

                {/* Products List */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {filteredProductos.map((prod) => {
                    const sel = productosSeleccionados.find(
                      (p) => p.id === prod.id,
                    );
                    const precioFinal = sel
                      ? sel.tipo_descuento === "porcentaje"
                        ? ((prod.precio * (100 - sel.descuento)) / 100).toFixed(
                            2,
                          )
                        : (prod.precio - sel.descuento).toFixed(2)
                      : null;

                    return (
                      <div
                        key={prod.id}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                          sel
                            ? "bg-primary/5 ring-1 ring-primary/20"
                            : "bg-muted/30 hover:bg-muted/50"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleProducto(prod)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            sel
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted border-2 border-muted-foreground/20"
                          }`}
                        >
                          {sel && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {prod.nombre}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${prod.precio}
                          </p>
                        </div>

                        {sel && (
                          <div className="flex items-center gap-2">
                            <select
                              value={sel.tipo_descuento}
                              onChange={(e) =>
                                handleDescuento(
                                  prod.id,
                                  e.target.value as any,
                                  sel.descuento,
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                              className="w-20 px-3 py-1.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span className="text-sm font-semibold">
                                {precioFinal}
                              </span>
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
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {errors.form}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-border">
                <Button
                  onClick={crearPromocion}
                  disabled={creating}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Crear promoción
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Existing Promotions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Promociones existentes
              </h2>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                {promociones.length} promociones
              </span>
            </div>

            {promociones.length === 0 ? (
              <Card className="p-12 bg-card border-0 shadow-sm">
                <div className="text-center">
                  <Percent className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-1">
                    No hay promociones
                  </p>
                  <p className="text-muted-foreground">
                    Crea tu primera promoción para atraer más clientes
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {promociones.map((p) => (
                  <Card
                    key={p.id_promocion}
                    className="group bg-card border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Promo Image */}
                    <div className="relative h-40 bg-muted/50 overflow-hidden">
                      {p.img_flyer ? (
                        <img
                          src={`${FILES}${p.img_flyer}`}
                          alt={p.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <Percent className="w-12 h-12 text-primary/30" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                            p.estado_id === 1
                              ? "bg-emerald-500/90 text-white"
                              : "bg-red-500/90 text-white"
                          }`}
                        >
                          {p.estado_id === 1 ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                    </div>

                    {/* Promo Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          {p.titulo}
                        </h3>
                        {p.descripcion && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {p.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Schedule Info */}
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.dias_semana}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5" />
                          {p.hora_inicio} - {p.hora_fin}
                        </div>
                      </div>

                      {/* Toggle Button */}
                      <Button
                        variant="outline"
                        onClick={() =>
                          toggleEstadoPromo(p.id_promocion, p.estado_id)
                        }
                        className={`w-full gap-2 ${
                          p.estado_id === 1
                            ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            : "text-muted-foreground"
                        }`}
                      >
                        {p.estado_id === 1 ? (
                          <>
                            <ToggleRight className="w-5 h-5" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-5 h-5" />
                            Activar
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
