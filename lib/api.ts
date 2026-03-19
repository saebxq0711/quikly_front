import { logout, getRole, isTokenExpiringSoon, refreshToken } from "./auth";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const rol = getRole();

  if (rol !== "kiosco" && isTokenExpiringSoon()) {
    await refreshToken();
  }

  let token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // 💥 SI EXPIRÓ → INTENTO DE RECUPERACIÓN
  if (res.status === 401 && rol !== "kiosco") {
    await refreshToken();

    token = localStorage.getItem("access_token");

    res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // 🔴 si vuelve a fallar → logout real
    if (res.status === 401) {
      logout();
      throw new Error("Sesión expirada");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error en la API");
  }

  if (res.status === 204) return null;

  return res.json();
}
