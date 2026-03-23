"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import {
  User,
  Mail,
  Phone,
  FileText,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Shield,
  Loader2,
  UserPlus,
  KeyRound,
  Building2,
} from "lucide-react";

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
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="space-y-2 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/25">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                    Usuario del Kiosco
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Gestiona las credenciales de acceso al sistema de kiosco
                  </p>
                </div>
              </div>
            </div>

            {/* Alertas */}
            <div className="space-y-3">
              {error && (
                <Alert
                  type="error"
                  message={error}
                  onClose={() => setError(null)}
                />
              )}
              {success && (
                <Alert
                  type="success"
                  message={success}
                  onClose={() => setSuccess(null)}
                />
              )}
            </div>

            {loading ? (
              <LoadingState />
            ) : !usuario ? (
              <CreateUserForm
                form={form}
                setForm={setForm}
                onSubmit={crearUsuario}
                saving={saving}
              />
            ) : (
              <UserDetails
                usuario={usuario}
                filesUrl={FILES}
                form={form}
                setForm={setForm}
                onToggleEstado={toggleEstado}
                onChangePassword={cambiarPassword}
                saving={saving}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =====================
   COMPONENTS
===================== */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-muted-foreground font-medium">
        Cargando información...
      </p>
    </div>
  );
}

function Alert({
  type,
  message,
  onClose,
}: {
  type: "error" | "success";
  message: string;
  onClose: () => void;
}) {
  const isError = type === "error";

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 animate-scale-in ${
        isError
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : "bg-primary/10 text-foreground border-primary/20"
      }`}
    >
      <div
        className={`flex-shrink-0 p-1 rounded-full ${isError ? "bg-destructive/20" : "bg-primary/20"}`}
      >
        {isError ? (
          <AlertCircle className="w-5 h-5 text-destructive" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-primary" />
        )}
      </div>
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
          isError ? "hover:bg-destructive/20" : "hover:bg-primary/20"
        }`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

function PasswordRules() {
  const rules = [
    "Mínimo 6 caracteres",
    "No repetir la contraseña actual",
    "No usar las últimas contraseñas",
  ];

  return (
    <div className="bg-muted/50 border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          Requisitos de seguridad
        </span>
      </div>
      <ul className="space-y-1.5">
        {rules.map((rule, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  icon?: React.ElementType;
  placeholder?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full bg-background border border-border rounded-xl text-foreground text-sm
            placeholder:text-muted-foreground
            focus:border-primary focus:ring-4 focus:ring-primary/10
            transition-all duration-200 outline-none
            ${Icon ? "pl-11" : "pl-4"} 
            ${isPassword ? "pr-11" : "pr-4"} 
            py-3
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function CreateUserForm({
  form,
  setForm,
  onSubmit,
  saving,
}: {
  form: {
    documento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    correo: string;
    password: string;
    confirmPassword: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onSubmit: () => void;
  saving: boolean;
}) {
  return (
    <div className="glass border border-border rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden animate-fade-in-up">
      {/* Card Header */}
      <div className="bg-muted/30 border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-md shadow-primary/25">
            <UserPlus className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Crear usuario de kiosco
            </h2>
            <p className="text-sm text-muted-foreground">
              Completa el formulario para crear las credenciales de acceso
            </p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-6">
        {/* Info Notice */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex-shrink-0 p-1 bg-primary/10 rounded-full">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Este usuario tendrá acceso exclusivo al sistema de kiosco para
            gestionar pedidos y operaciones del punto de venta.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid gap-5">
          <FormInput
            label="NIT"
            value={form.documento}
            onChange={(v) => setForm({ ...form, documento: v })}
            icon={FileText}
            placeholder="Ingresa el NIT"
          />

          <div className="grid sm:grid-cols-2 gap-5">
            <FormInput
              label="Nombres"
              value={form.nombres}
              onChange={(v) => setForm({ ...form, nombres: v })}
              icon={User}
              placeholder="Nombres completos"
            />
            <FormInput
              label="Apellidos"
              value={form.apellidos}
              onChange={(v) => setForm({ ...form, apellidos: v })}
              icon={User}
              placeholder="Apellidos completos"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <FormInput
              label="Teléfono"
              value={form.telefono}
              onChange={(v) => setForm({ ...form, telefono: v })}
              icon={Phone}
              placeholder="+57 300 000 0000"
            />
            <FormInput
              label="Correo electrónico"
              value={form.correo}
              onChange={(v) => setForm({ ...form, correo: v })}
              icon={Mail}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-sm font-medium text-muted-foreground">
              Seguridad
            </span>
          </div>
        </div>

        {/* Password Section */}
        <PasswordRules />

        <div className="grid sm:grid-cols-2 gap-5">
          <FormInput
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(v) => setForm({ ...form, password: v })}
            icon={Lock}
            placeholder="••••••••"
          />
          <FormInput
            label="Confirmar contraseña"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => setForm({ ...form, confirmPassword: v })}
            icon={Lock}
            placeholder="••••••••"
          />
        </div>
      </div>

      {/* Card Footer */}
      <div className="bg-muted/30 border-t border-border px-6 py-4 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={saving}
          className="
            inline-flex items-center justify-center gap-2
            bg-primary hover:bg-primary/90
            text-primary-foreground font-semibold
            px-6 py-3 rounded-xl
            shadow-lg shadow-primary/25
            hover:shadow-xl hover:shadow-primary/30
            disabled:opacity-60 disabled:cursor-not-allowed
            transform hover:-translate-y-0.5
            transition-all duration-200
            touch-target
          "
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creando usuario...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>Crear usuario</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function UserDetails({
  usuario,
  filesUrl,
  form,
  setForm,
  onToggleEstado,
  onChangePassword,
  saving,
}: {
  usuario: UsuarioKiosco;
  filesUrl: string;
  form: {
    password: string;
    confirmPassword: string;
    documento: string;
    nombres: string;
    apellidos: string;
    telefono: string;
    correo: string;
  };
  setForm: React.Dispatch<React.SetStateAction<typeof form>>;
  onToggleEstado: () => void;
  onChangePassword: () => void;
  saving: boolean;
}) {
  const isActive = usuario.estado_id === 1;

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="glass border border-border rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden animate-fade-in-up">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden ring-2 ring-border/20">
                {usuario.img_restaurante ? (
                  <img
                    src={usuario.img_restaurante}
                    alt="Logo restaurante"
                    className="object-contain w-full h-full p-1"
                  />
                ) : (
                  <User className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  {usuario.nombres} {usuario.apellidos}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{usuario.correo}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onToggleEstado}
              className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                transition-all duration-200 transform hover:scale-105 touch-target
                ${
                  isActive
                    ? "bg-primary/10 text-foreground hover:bg-primary/20 border border-primary/30"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                }
              `}
            >
              <div
                className={`w-2 h-2 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-muted-foreground"}`}
              />
              {isActive ? "Activo" : "Inactivo"}
            </button>
          </div>

          {/* User Details Grid */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid sm:grid-cols-3 gap-4">
              <InfoItem
                icon={FileText}
                label="Documento"
                value={usuario.documento}
              />
              <InfoItem
                icon={Phone}
                label="Teléfono"
                value={usuario.telefono}
              />
              <InfoItem icon={Mail} label="Correo" value={usuario.correo} />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="glass border border-border rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden animate-fade-in-up delay-100">
        <div className="bg-muted/30 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground shadow-md">
              <KeyRound className="w-5 h-5 text-background" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Cambiar contraseña
              </h3>
              <p className="text-sm text-muted-foreground">
                Actualiza las credenciales de acceso del usuario
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <PasswordRules />

          <div className="grid sm:grid-cols-2 gap-5">
            <FormInput
              label="Nueva contraseña"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              icon={Lock}
              placeholder="••••••••"
            />
            <FormInput
              label="Confirmar contraseña"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => setForm({ ...form, confirmPassword: v })}
              icon={Lock}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="bg-muted/30 border-t border-border px-6 py-4 flex justify-end">
          <button
            onClick={onChangePassword}
            disabled={saving}
            className="
              inline-flex items-center justify-center gap-2
              bg-foreground hover:bg-foreground/90
              text-background font-semibold
              px-6 py-3 rounded-xl
              shadow-lg shadow-foreground/10
              hover:shadow-xl hover:shadow-foreground/20
              disabled:opacity-60 disabled:cursor-not-allowed
              transform hover:-translate-y-0.5
              transition-all duration-200
              touch-target
            "
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                <span>Cambiar contraseña</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-background shadow-sm border border-border">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-foreground truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
