"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { AlertTriangle, CheckCircle } from "lucide-react";

type Profile = {
  id_usuario: number;
  nombres: string | null;
  apellidos: string | null;
  correo: string;
  telefono: string | null;
  estado_id: number;
};

type Errors = {
  correo?: string;
  contrasena?: string;
  confirmarContrasena?: string;
};

export default function SuperAdminProfilePage() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const superadminId = 1; // TODO: reemplaza con el ID real del superadmin logueado

  const [profile, setProfile] = useState<Profile | null>(null);
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/superadmin/profile/?superadmin_id=${superadminId}`);
      if (!res.ok) throw new Error("No se pudo cargar el perfil");
      const data = await res.json();
      setProfile(data);
      setCorreo(data.correo ?? "");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar tu perfil. Intenta recargar la página.", { duration: 5000 });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const validate = (): boolean => {
    const errs: Errors = {};
    if (!correo) errs.correo = "El correo es obligatorio";

    if (contrasena) {
      if (contrasena !== confirmarContrasena) errs.confirmarContrasena = "Las contraseñas no coinciden";
      if (contrasena.length < 8) errs.contrasena = "Debe tener al menos 8 caracteres";
      if (!/[A-Z]/.test(contrasena)) errs.contrasena = "Debe contener al menos una mayúscula";
      if (!/[0-9]/.test(contrasena)) errs.contrasena = "Debe contener al menos un número";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setLoading(true);
    setSuccessMsg("");
    try {
      const body: any = { correo };
      if (contrasena) {
        body.contrasena = contrasena;
        body.confirmar_contrasena = confirmarContrasena;
      }

      const res = await fetch(`${API}/superadmin/profile/?superadmin_id=${superadminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "No se pudo actualizar tu perfil");
      }

      const data = await res.json();
      setProfile(data);
      setContrasena("");
      setConfirmarContrasena("");
      setErrors({});
      setSuccessMsg("Perfil actualizado correctamente");
      toast.success("Perfil actualizado con éxito");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error inesperado al actualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p className="text-gray-500">Cargando perfil…</p>;

  const inputClass = (hasError: boolean) =>
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200";

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Perfil SuperAdmin</h2>

      <div className="space-y-2">
        <Input value={profile.nombres ?? ""} disabled placeholder="Nombres" autoComplete="off" />
        <Input value={profile.apellidos ?? ""} disabled placeholder="Apellidos" autoComplete="off" />
        <Input value={profile.telefono ?? ""} disabled placeholder="Teléfono" autoComplete="off" />

        {/* Correo */}
        <div className="relative">
          <Input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="Correo"
            autoComplete="off"
            className={inputClass(!!errors.correo)}
          />
          {errors.correo && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {errors.correo}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div className="relative">
          <Input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            className={inputClass(!!errors.contrasena)}
          />
          {errors.contrasena && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {errors.contrasena}
            </p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="relative">
          <Input
            type="password"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            placeholder="Confirmar contraseña"
            autoComplete="new-password"
            className={inputClass(!!errors.confirmarContrasena)}
          />
          {errors.confirmarContrasena && (
            <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {errors.confirmarContrasena}
            </p>
          )}
        </div>
      </div>

      <Button
        className="mt-4"
        onClick={handleUpdate}
        disabled={loading || (!contrasena && correo === profile.correo)}
      >
        {loading ? "Actualizando..." : "Actualizar Perfil"}
      </Button>

      {successMsg && (
        <p className="text-green-600 mt-2 font-medium flex items-center gap-1">
          <CheckCircle className="w-5 h-5" /> {successMsg}
        </p>
      )}
    </div>
  );
}
