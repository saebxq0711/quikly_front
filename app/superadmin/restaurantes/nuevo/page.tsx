"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type TipoDocumento = {
  id_tipo_documento: number;
  nombre: string;
};

export default function NuevoRestaurantePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);

  const [form, setForm] = useState({
    nit: "",
    nombre: "",
    logo: null as File | null,
    admin_nombres: "",
    admin_apellidos: "",
    admin_documento: "",
    admin_telefono: "",
    admin_correo: "",
    admin_contrasena: "",
    admin_tipo_documento_id: "", // nuevo campo
  });

  // Traer tipos de documento al montar
  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/tipo-documento`
        );
        if (!res.ok)
          throw new Error("No se pudieron cargar los tipos de documento");
        const data: TipoDocumento[] = await res.json();
        setTiposDocumento(data);
        if (data.length > 0)
          setForm((f) => ({
            ...f,
            admin_tipo_documento_id: data[0].id_tipo_documento.toString(),
          }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTipos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, logo: e.target.files[0] });
      setLogoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("nit", form.nit);
      formData.append("admin_nombres", form.admin_nombres);
      formData.append("admin_apellidos", form.admin_apellidos);
      formData.append("admin_documento", form.admin_documento);
      formData.append("admin_telefono", form.admin_telefono);
      formData.append("admin_correo", form.admin_correo);
      formData.append("admin_contrasena", form.admin_contrasena);
      formData.append("admin_tipo_documento_id", form.admin_tipo_documento_id);

      if (form.logo instanceof File) {
        formData.append("logo", form.logo);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/restaurantes`,
        { method: "POST", body: formData }
      );

      if (!res.ok) throw new Error("Error creando restaurante");

      const data = await res.json();
      router.push(`/superadmin/restaurantes/${data.id_restaurante}`);
    } catch (err) {
      console.error(err);
      alert("Hubo un error creando el restaurante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/superadmin/restaurantes")}
        >
          ← Volver a restaurantes
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Nuevo Restaurante
        </h2>

        <form
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          {/* Datos restaurante */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del restaurante</Label>
              <Input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="nit">NIT</Label>
              <Input
                id="nit"
                name="nit"
                value={form.nit}
                onChange={(e) =>
                  setForm({ ...form, nit: e.target.value.replace(/\D/g, "") })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="Preview Logo"
                  className="mt-2 w-32 h-32 object-contain border"
                />
              )}
            </div>
          </div>

          {/* Datos admin */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin_nombres">Nombre del admin</Label>
              <Input
                id="admin_nombres"
                name="admin_nombres"
                value={form.admin_nombres}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin_apellidos">Apellido del admin</Label>
              <Input
                id="admin_apellidos"
                name="admin_apellidos"
                value={form.admin_apellidos}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin_tipo_documento_id">Tipo de documento</Label>
              <select
                id="admin_tipo_documento_id"
                name="admin_tipo_documento_id"
                value={form.admin_tipo_documento_id}
                onChange={(e) =>
                  setForm({ ...form, admin_tipo_documento_id: e.target.value })
                }
                required
              >
                {tiposDocumento.map((tipo) => (
                  <option
                    key={tipo.id_tipo_documento}
                    value={tipo.id_tipo_documento}
                  >
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="admin_documento">Documento</Label>
              <Input
                id="admin_documento"
                name="admin_documento"
                value={form.admin_documento}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin_telefono">Teléfono</Label>
              <Input
                id="admin_telefono"
                name="admin_telefono"
                value={form.admin_telefono}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin_correo">Correo</Label>
              <Input
                id="admin_correo"
                type="email"
                name="admin_correo"
                value={form.admin_correo}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="admin_contrasena">Contraseña</Label>
              <Input
                id="admin_contrasena"
                type="password"
                name="admin_contrasena"
                value={form.admin_contrasena}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Botón submit full width */}
          <div className="md:col-span-2 text-center mt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creando…" : "+ Crear Restaurante"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
