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
  estado_id: number;
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
  const [saving, setSaving] = useState(false);

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
  const [success, setSuccess] = useState<string | null>(null);

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
     HELPERS
  ===================== */

  const validarPassword = () => {
    if (form.password.length < 6) {
      return "Debe tener al menos 6 caracteres";
    }
    if (form.password !== form.confirmPassword) {
      return "Las contraseñas no coinciden";
    }
    return null;
  };

  /* =====================
     ACTIONS
  ===================== */

  const crearUsuario = async () => {
    setError(null);
    setSuccess(null);

    const err = validarPassword();
    if (err) return setError(err);

    setSaving(true);

    const res = await fetch(`${API}/admin/kiosco/usuario`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({
        tipo_documento_id: 3,
        documento: form.documento,
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono,
        correo: form.correo,
        contrasena: form.password,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Error al crear usuario");
      return;
    }

    setSuccess("Usuario creado correctamente");
    cargarUsuario();
  };

  const toggleEstado = async () => {
    await fetch(`${API}/admin/kiosco/usuario/estado`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token()}` },
    });

    cargarUsuario();
  };

  const cambiarPassword = async () => {
    setError(null);
    setSuccess(null);

    const err = validarPassword();
    if (err) return setError(err);

    setSaving(true);

    const res = await fetch(`${API}/admin/kiosco/usuario/password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token()}`,
      },
      body: JSON.stringify({ password: form.password }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.detail || "Error al cambiar contraseña");
      return;
    }

    setSuccess("Contraseña actualizada correctamente");

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

          {/* ALERTAS */}
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          {loading ? (
            <p className="text-zinc-500">Cargando…</p>
          ) : !usuario ? (
            <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
              <p className="text-zinc-600">
                Aún no has creado el usuario para el kiosco.
              </p>

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

              <PasswordRules />

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
                disabled={saving}
                className="bg-primary text-black px-5 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-6 space-y-6 shadow-sm">
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
                  className="w-40 rounded-lg border"
                />
              )}

              <div className="border-t pt-4 space-y-3">
                <h3 className="font-medium text-zinc-900">
                  Cambiar contraseña
                </h3>

                <PasswordRules />

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
                  disabled={saving}
                  className="bg-primary text-black px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {saving ? "Actualizando..." : "Cambiar contraseña"}
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

function Alert({
  type,
  message,
}: {
  type: "error" | "success";
  message: string;
}) {
  return (
    <div
      className={`p-3 rounded-lg text-sm border ${
        type === "error"
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-green-50 text-green-700 border-green-200"
      }`}
    >
      {message}
    </div>
  );
}

function PasswordRules() {
  return (
    <div className="text-xs text-zinc-500 bg-zinc-100 p-3 rounded-lg">
      <p>• Mínimo 6 caracteres</p>
      <p>• No repetir la contraseña actual</p>
      <p>• No usar las últimas contraseñas</p>
    </div>
  );
}

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
        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
      />
    </div>
  );
}
