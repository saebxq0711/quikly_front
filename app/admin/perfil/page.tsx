"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";
import { useRestaurante } from "../context/RestauranteContext";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ImageIcon,
  Building2,
  KeyRound,
} from "lucide-react";

export default function PerfilAdminPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL!;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const [showPwd, setShowPwd] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const loadPerfil = async () => {
    try {
      const res = await fetch(`${API}/admin/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPerfil(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const cambiarContrasena = async () => {
    if (pwd.nueva !== pwd.confirmar) {
      showAlert("error", "Las contraseñas no coinciden");
      return;
    }

    if (pwd.nueva.length < 6) {
      showAlert("error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSaving(true);

    const res = await fetch(`${API}/admin/perfil/contrasena`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contrasena_actual: pwd.actual,
        nueva_contrasena: pwd.nueva,
        confirmar_contrasena: pwd.confirmar,
      }),
    });

    setSaving(false);

    if (res.ok) {
      showAlert("success", "Contraseña actualizada correctamente");
      setPwd({ actual: "", nueva: "", confirmar: "" });
    } else {
      showAlert("error", await res.text());
    }
  };

  const cambiarLogo = async () => {
    if (!logo) return;

    setSaving(true);

    const form = new FormData();
    form.append("logo", logo);

    const res = await fetch(`${API}/admin/perfil/logo`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    setSaving(false);

    if (res.ok) {
      const data = await res.json();

      // actualizas vista local
      setPerfil((p: any) => ({
        ...p,
        restaurante: { ...p.restaurante, logo: data.logo },
      }));

      // 🔥 ESTA ES LA CLAVE
      await reloadRestaurante();

      showAlert("success", "Logo actualizado correctamente");
      setLogo(null);
      setPreview(null);
    } else {
      showAlert("error", "Error al actualizar el logo");
    }
  };

  const { reloadRestaurante } = useRestaurante();

  useEffect(() => {
    loadPerfil();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2 animate-fade-in-up">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/25">
                  <User className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight">
                    Perfil del administrador
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Gestiona tu informacion personal y seguridad
                  </p>
                </div>
              </div>
            </div>

            {/* Alert */}
            {alert && (
              <div
                className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 animate-scale-in ${
                  alert.type === "error"
                    ? "bg-destructive/10 text-destructive border-destructive/20"
                    : "bg-primary/10 text-foreground border-primary/20"
                }`}
              >
                <div
                  className={`flex-shrink-0 p-1 rounded-full ${
                    alert.type === "error"
                      ? "bg-destructive/20"
                      : "bg-primary/20"
                  }`}
                >
                  {alert.type === "error" ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="flex-1 text-sm font-medium leading-relaxed">
                  {alert.message}
                </p>
                <button
                  onClick={() => setAlert(null)}
                  className={`flex-shrink-0 p-1 rounded-lg transition-colors ${
                    alert.type === "error"
                      ? "hover:bg-destructive/20"
                      : "hover:bg-primary/20"
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
            )}

            {loading ? (
              <LoadingState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Info Card */}
                  <section className="glass border border-border rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden animate-fade-in-up">
                    <div className="bg-muted/30 border-b border-border px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-md shadow-primary/25">
                          <User className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">
                            Informacion personal
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Datos de tu cuenta de administrador
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem
                          icon={User}
                          label="Nombre completo"
                          value={`${perfil.usuario.nombres} ${perfil.usuario.apellidos}`}
                        />
                        <InfoItem
                          icon={Mail}
                          label="Correo electronico"
                          value={perfil.usuario.correo}
                        />
                        <InfoItem
                          icon={Phone}
                          label="Telefono"
                          value={perfil.usuario.telefono}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Logo Card */}
                  <section className="glass border border-border rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden animate-fade-in-up delay-100">
                    <div className="bg-muted/30 border-b border-border px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-foreground shadow-md">
                          <Building2 className="w-5 h-5 text-background" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">
                            Identidad del restaurante
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Logo y marca visual de tu negocio
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Logo Preview */}
                        <div className="relative group">
                          <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                            {preview || perfil.restaurante.logo ? (
                              <img
                                src={
                                  preview
                                    ? preview
                                    : `${FILES}${perfil.restaurante.logo}`
                                }
                                className="w-full h-full object-contain p-2"
                                alt="Logo del restaurante"
                              />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-muted-foreground" />
                            )}
                          </div>
                          <label className="absolute inset-0 flex items-center justify-center bg-foreground/60 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity">
                            <Camera className="w-8 h-8 text-background" />
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setLogo(file);
                                setPreview(URL.createObjectURL(file));
                              }}
                            />
                          </label>
                        </div>

                        {/* Upload Info */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-foreground">
                              Actualizar logo
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Sube una imagen para representar tu restaurante.
                              Formatos aceptados: PNG, JPG o WEBP. Tamanio
                              maximo: 2MB.
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted/50 cursor-pointer transition-colors touch-target">
                              <Upload className="w-4 h-4" />
                              Seleccionar archivo
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  setLogo(file);
                                  setPreview(URL.createObjectURL(file));
                                }}
                              />
                            </label>

                            {logo && (
                              <button
                                onClick={cambiarLogo}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold shadow-md shadow-primary/25 disabled:opacity-60 transition-all touch-target"
                              >
                                {saving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-4 h-4" />
                                )}
                                Guardar logo
                              </button>
                            )}
                          </div>

                          {logo && (
                            <p className="text-xs text-primary font-medium">
                              Archivo seleccionado: {logo.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right Column - Security */}
                <aside className="space-y-6">
                  <section className="glass border border-border rounded-2xl shadow-xl shadow-foreground/5 overflow-hidden animate-fade-in-up delay-200">
                    <div className="bg-muted/30 border-b border-border px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary shadow-md shadow-primary/25">
                          <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-foreground">
                            Seguridad
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            Cambiar contrasena
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Password Rules */}
                      <div className="bg-muted/50 border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <KeyRound className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            Requisitos
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {[
                            "Minimo 6 caracteres",
                            "Diferente a la actual",
                            "No puedes reutilizar las últimas contraseñas",
                          ].map((rule, i) => (
                            <li
                              key={i}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <div className="w-1 h-1 rounded-full bg-primary" />
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Password Fields */}
                      <div className="space-y-4">
                        <PasswordInput
                          label="Contrasena actual"
                          value={pwd.actual}
                          onChange={(v) => setPwd({ ...pwd, actual: v })}
                          show={showPwd.actual}
                          onToggle={() =>
                            setShowPwd({ ...showPwd, actual: !showPwd.actual })
                          }
                          placeholder="Ingresa tu contrasena actual"
                        />
                        <PasswordInput
                          label="Nueva contrasena"
                          value={pwd.nueva}
                          onChange={(v) => setPwd({ ...pwd, nueva: v })}
                          show={showPwd.nueva}
                          onToggle={() =>
                            setShowPwd({ ...showPwd, nueva: !showPwd.nueva })
                          }
                          placeholder="Ingresa la nueva contrasena"
                        />
                        <PasswordInput
                          label="Confirmar contrasena"
                          value={pwd.confirmar}
                          onChange={(v) => setPwd({ ...pwd, confirmar: v })}
                          show={showPwd.confirmar}
                          onToggle={() =>
                            setShowPwd({
                              ...showPwd,
                              confirmar: !showPwd.confirmar,
                            })
                          }
                          placeholder="Confirma la nueva contrasena"
                        />
                      </div>

                      <button
                        onClick={cambiarContrasena}
                        disabled={
                          saving || !pwd.actual || !pwd.nueva || !pwd.confirmar
                        }
                        className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 touch-target"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Actualizando...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Actualizar contrasena
                          </>
                        )}
                      </button>
                    </div>
                  </section>
                </aside>
              </div>
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
      <p className="text-muted-foreground font-medium">Cargando perfil...</p>
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
    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background shadow-sm border border-border">
        <Icon className="w-5 h-5 text-muted-foreground" />
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

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
          <Lock className="w-4 h-4" />
        </div>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-background border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none pl-10 pr-10 py-3"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
