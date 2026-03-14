"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";

/* =====================
   TIPOS
===================== */

type UsuarioKiosco = {
  id_usuario: number;
  documento: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  estado_id: number; // 1 activo, 2 inactivo
  img_restaurante?: string;
};

/* =====================
   PAGE
===================== */

export default function UsuarioKioscoPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL!;
  const token = () => localStorage.getItem("access_token");

  const [usuario, setUsuario] = useState<UsuarioKiosco | null>(null);
  const [loading, setLoading] = useState(true);

  // form crear
  const [form, setForm] = useState({
    documento: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  /* =====================
     DATA
  ===================== */

  const cargarUsuario = async () => {
    setLoading(true);
    const res = await fetch(`${API}/admin/kiosco/usuario`, {
      headers: { Authorization: `Bearer ${token()}` },
    });

    if (res.status === 404) {
      setUsuario(null);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setUsuario(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarUsuario();
  }, []);

  /* =====================
     ACTIONS
  ===================== */

  const crearUsuario = async () => {
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    await fetch(`${API}/admin/kiosco/usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        tipo_documento_id: 3, // NIT fijo
        documento: form.documento,
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono,
        correo: form.correo,
        contrasena: form.password,
      }),
    });

    cargarUsuario();
  };

  const toggleEstado = async () => {
    if (!usuario) return;

    await fetch(`${API}/admin/kiosco/usuario/estado`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
    });

    cargarUsuario();
  };

  const cambiarPassword = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    await fetch(`${API}/admin/kiosco/usuario/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ password: form.password }),
    });

    setForm({ ...form, password: "", confirmPassword: "" });
  };

  /* =====================
     RENDER
  ===================== */

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="p-8 max-w-4xl space-y-8">
          <h1 className="text-3xl font-semibold text-zinc-900">
            Usuario del kiosco
          </h1>

          {loading ? (
            <p className="text-zinc-500">Cargando…</p>
          ) : !usuario ? (
            /* =====================
               NO EXISTE
            ===================== */
            <div className="bg-white border rounded-xl p-6 space-y-4">
              <p className="text-zinc-600">
                Aún no has creado el usuario para el kiosco.
              </p>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <FormInput
                label="NIT"
                value={form.documento}
                onChange={(v) => setForm({ ...form, documento: v })}
              />
              <FormInput
                label="Nombres"
                value={form.nombres}
                onChange={(v) => setForm({ ...form, nombres: v })}
              />
              <FormInput
                label="Apellidos"
                value={form.apellidos}
                onChange={(v) => setForm({ ...form, apellidos: v })}
              />
              <FormInput
                label="Teléfono"
                value={form.telefono}
                onChange={(v) => setForm({ ...form, telefono: v })}
              />
              <FormInput
                label="Correo"
                value={form.correo}
                onChange={(v) => setForm({ ...form, correo: v })}
              />

              <FormInput
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={(v) => setForm({ ...form, password: v })}
              />
              <FormInput
                label="Confirmar contraseña"
                type="password"
                value={form.confirmPassword}
                onChange={(v) => setForm({ ...form, confirmPassword: v })}
              />

              <button
                onClick={crearUsuario}
                className="bg-zinc-900 text-white px-5 py-2 rounded-lg"
              >
                Crear usuario del kiosco
              </button>
            </div>
          ) : (
            /* =====================
               EXISTE
            ===================== */
            <div className="bg-white border rounded-xl p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-zinc-900">
                    {usuario.nombres} {usuario.apellidos}
                  </p>
                  <p className="text-sm text-zinc-500">{usuario.correo}</p>
                </div>

                <button
                  onClick={toggleEstado}
                  className={`px-4 py-1 rounded-full text-sm ${
                    usuario.estado_id === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {usuario.estado_id === 1 ? "Activo" : "Inactivo"}
                </button>
              </div>

              {usuario.img_restaurante && (
                <img
                  src={`${FILES}${usuario.img_restaurante}`}
                  alt="Restaurante"
                  className="w-40 rounded-lg border"
                />
              )}

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-medium text-zinc-900">
                  Cambiar contraseña
                </h3>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <FormInput
                  label="Nueva contraseña"
                  type="password"
                  value={form.password}
                  onChange={(v) => setForm({ ...form, password: v })}
                />
                <FormInput
                  label="Confirmar contraseña"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(v) => setForm({ ...form, confirmPassword: v })}
                />

                <button
                  onClick={cambiarPassword}
                  className="bg-zinc-900 text-white px-4 py-2 rounded-lg"
                >
                  Cambiar contraseña
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* =====================
   COMPONENTS
===================== */

function FormInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
