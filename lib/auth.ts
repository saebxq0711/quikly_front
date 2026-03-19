// lib/auth.ts

const TOKEN_KEY = "access_token";
const ROLE_KEY = "rol";

// ===============================
// SESSION
// ===============================
export function saveSession(token: string, rol: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, rol);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): string | null {
  return localStorage.getItem(ROLE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ===============================
// LOGOUT
// ===============================
export function logout(redirect: boolean = true) {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);

  // ⚠️ Evita romper SSR o cosas raras
  if (redirect && typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

// ===============================
// REDIRECCIONES
// ===============================
export function redirectToRolePage() {
  const rol = getRole();

  if (typeof window === "undefined") return;

  switch (rol) {
    case "superadmin":
      window.location.href = "/superadmin";
      break;

    case "admin_restaurante":
      window.location.href = "/admin";
      break;

    case "kiosco":
      window.location.href = "/kiosco";
      break;

    default:
      window.location.href = "/login";
      break;
  }
}

export function isTokenExpiringSoon(): boolean {
  const token = getToken();
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();

    // ⏳ 5 minutos antes de morir
    return exp - now < 5 * 60 * 1000;
  } catch {
    return true;
  }
}

export async function refreshToken() {
  const token = getToken();
  if (!token) return;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) {
    logout();
    return;
  }

  const data = await res.json();
  saveSession(data.access_token, data.rol);
}
