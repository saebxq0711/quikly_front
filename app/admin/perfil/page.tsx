"use client";

import { useEffect, useState } from "react";
import SidebarAdmin from "../components/SidebarAdmin";
import HeaderAdmin from "../components/HeaderAdmin";

export default function PerfilAdminPage() {
  const API = process.env.NEXT_PUBLIC_API_URL!;
  const FILES = process.env.NEXT_PUBLIC_FILES_URL!;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState<any>(null);

  const [pwd, setPwd] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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

    if (res.ok) {
      alert("Contraseña actualizada");
      setPwd({ actual: "", nueva: "", confirmar: "" });
    } else {
      alert(await res.text());
    }
  };

  const cambiarLogo = async () => {
    if (!logo) return;

    const form = new FormData();
    form.append("logo", logo);

    const res = await fetch(`${API}/admin/perfil/logo`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (res.ok) {
      const data = await res.json();
      setPerfil((p: any) => ({
        ...p,
        restaurante: { ...p.restaurante, logo: data.logo },
      }));
      alert("Logo actualizado");
      setPreview(null);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin />

      <div className="flex-1 flex flex-col">
        <HeaderAdmin />

        <main className="p-8 overflow-y-auto">
          <h1 className="text-2xl font-semibold mb-6">
            Perfil del administrador
          </h1>

          {loading ? (
            <p>Cargando...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* COLUMNA IZQUIERDA */}
              <div className="lg:col-span-2 space-y-6">
                {/* INFO */}
                <section className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Información personal
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nombre</p>
                      <p className="font-medium">
                        {perfil.usuario.nombres}{" "}
                        {perfil.usuario.apellidos}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Correo</p>
                      <p className="font-medium">
                        {perfil.usuario.correo}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-500">Teléfono</p>
                      <p className="font-medium">
                        {perfil.usuario.telefono}
                      </p>
                    </div>
                  </div>
                </section>

                {/* LOGO */}
                <section className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-semibold mb-4">
                    Identidad del restaurante
                  </h2>

                  <div className="flex items-center gap-6">
                    <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-gray-50">
                      <img
                        src={
                          preview
                            ? preview
                            : `${FILES}${perfil.restaurante.logo}`
                        }
                        className="max-h-24 object-contain"
                        alt="Logo"
                      />
                    </div>

                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setLogo(file);
                          setPreview(URL.createObjectURL(file));
                        }}
                      />

                      <button
                        onClick={cambiarLogo}
                        disabled={!logo}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-40"
                      >
                        Guardar logo
                      </button>

                      <p className="text-xs text-gray-400">
                        PNG, JPG o WEBP · Máx 2MB
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* COLUMNA DERECHA */}
              <aside className="bg-white rounded-xl shadow-sm p-6 h-fit">
                <h2 className="text-lg font-semibold mb-4">
                  Seguridad
                </h2>

                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Contraseña actual"
                    className="w-full border rounded-lg p-2"
                    value={pwd.actual}
                    onChange={(e) =>
                      setPwd({ ...pwd, actual: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    placeholder="Nueva contraseña"
                    className="w-full border rounded-lg p-2"
                    value={pwd.nueva}
                    onChange={(e) =>
                      setPwd({ ...pwd, nueva: e.target.value })
                    }
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nueva contraseña"
                    className="w-full border rounded-lg p-2"
                    value={pwd.confirmar}
                    onChange={(e) =>
                      setPwd({ ...pwd, confirmar: e.target.value })
                    }
                  />

                  <button
                    onClick={cambiarContrasena}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg"
                  >
                    Actualizar contraseña
                  </button>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
