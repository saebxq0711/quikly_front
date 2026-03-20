import { logout, refreshToken, getToken } from "./auth";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token = getToken();

  const makeRequest = async () => {
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  let res = await makeRequest();

  // 💥 SIEMPRE intenta refresh (incluido kiosco)
  if (res.status === 401) {
    const refreshed = await refreshToken();

    if (!refreshed) {
      logout(); // aquí podrías customizar kiosco luego
      throw new Error("Sesión expirada");
    }

    token = getToken();
    res = await makeRequest();

    if (res.status === 401) {
      logout();
      throw new Error("Sesión inválida");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Error en la API");
  }

  if (res.status === 204) return null;

  return res.json();
}
