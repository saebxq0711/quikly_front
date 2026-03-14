"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type Admin = {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  estado_id: number;
  restaurante: string;
};

type Restaurante = {
  id_restaurante: number;
  nombre: string;
};

const estadoMap: Record<number, { label: string; className: string }> = {
  1: { label: "Activo", className: "bg-green-100 text-green-800" },
  2: { label: "Inactivo", className: "bg-yellow-100 text-yellow-800" },
  3: { label: "Eliminado", className: "bg-red-100 text-red-800" },
};

export default function AdministradoresPage() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<null | number>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    contrasena: "",
    restaurante_id: 0,
  });

  const limit = 12;

  // ======================
  // Fetch admins
  // ======================
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);
      if (estadoFilter) params.append("estado", estadoFilter.toString());

      const res = await fetch(`${API}/superadmin/administradores?${params}`);
      const data = await res.json();
      setAdmins(data.items ?? []);
      setTotalPages(data.total_pages ?? 1);
    } catch {
      setAdmins([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantes = async () => {
    try {
      const res = await fetch(`${API}/superadmin/administradores/restaurantes`);
      const data = await res.json();
      setRestaurantes(Array.isArray(data) ? data : []);
    } catch {
      setRestaurantes([]);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchRestaurantes();
  }, [page, search, estadoFilter]);

  const handleCreateAdmin = async () => {
    try {
      const res = await fetch(`${API}/superadmin/administradores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error creando administrador");
      setModalOpen(false);
      setForm({
        nombres: "",
        apellidos: "",
        correo: "",
        telefono: "",
        contrasena: "",
        restaurante_id: 0,
      });
      fetchAdmins();
    } catch {
      alert("No se pudo crear el administrador");
    }
  };

  if (loading)
    return (
      <p className="text-gray-500 text-center mt-12">
        Cargando administradores…
      </p>
    );

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Input
          placeholder="Buscar por nombre, correo o teléfono…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />

        <div className="flex flex-wrap gap-2 items-center">
          {/* Filtro por estado */}
          <Select
            value={estadoFilter?.toString() ?? "0"}
            onValueChange={(val) =>
              setEstadoFilter(val === "0" ? null : Number(val))
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todos</SelectItem>
              <SelectItem value="1">Activo</SelectItem>
              <SelectItem value="2">Inactivo</SelectItem>
              <SelectItem value="3">Eliminado</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setModalOpen(true)}
            className="ml-auto sm:ml-0"
          >
            + Nuevo Administrador
          </Button>
        </div>
      </div>

      {/* Admin cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {admins.length === 0 && (
          <p className="text-gray-400 text-center col-span-full py-12">
            No se encontraron administradores
          </p>
        )}

        {admins.map((a) => (
          <Card
            key={a.id_usuario}
            className="p-4 shadow hover:shadow-lg transition rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {a.nombres} {a.apellidos}
                </h3>
                <p className="text-sm text-gray-500">{a.correo}</p>
                <p className="text-sm text-gray-500">{a.telefono}</p>
                <p className="text-sm text-gray-500 font-medium">
                  {a.restaurante || "Sin restaurante"}
                </p>
              </div>

              <Badge className={estadoMap[a.estado_id].className}>
                {estadoMap[a.estado_id].label}
              </Badge>
            </div>

            <div className="mt-3 flex justify-end">
              <select
                value={a.estado_id}
                onChange={async (e) => {
                  const newEstado = Number(e.target.value);
                  try {
                    const res = await fetch(
                      `${API}/superadmin/administradores/${a.id_usuario}/estado`,
                      {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ estado: newEstado }),
                      },
                    );
                    if (!res.ok) throw new Error("Error actualizando estado");
                    setAdmins((prev) =>
                      prev.map((adm) =>
                        adm.id_usuario === a.id_usuario
                          ? { ...adm, estado_id: newEstado }
                          : adm,
                      ),
                    );
                  } catch {
                    alert("No se pudo actualizar el estado");
                  }
                }}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={1}>Activo</option>
                <option value={2}>Inactivo</option>
                <option value={3}>Eliminado</option>
              </select>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-4">
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

      {/* Modal Crear Admin */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Administrador</DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            <Input
              placeholder="Nombres"
              value={form.nombres}
              onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            />
            <Input
              placeholder="Apellidos"
              value={form.apellidos}
              onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            />
            <Input
              placeholder="Correo"
              type="email"
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
            <Input
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
            <Input
              placeholder="Contraseña"
              type="password"
              value={form.contrasena}
              onChange={(e) =>
                setForm({ ...form, contrasena: e.target.value })
              }
            />

            {/* Select Restaurante */}
            <div>
              <Label>Restaurante</Label>
              <Select
                value={form.restaurante_id ? form.restaurante_id.toString() : "0"}
                onValueChange={(val) =>
                  setForm({ ...form, restaurante_id: val === "0" ? 0 : Number(val) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccione un restaurante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Seleccione un restaurante</SelectItem>
                  {restaurantes.map((r) => (
                    <SelectItem
                      key={r.id_restaurante}
                      value={r.id_restaurante.toString()}
                    >
                      {r.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAdmin}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
