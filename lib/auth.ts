export function saveSession(token: string, rol: string) {
  localStorage.setItem("access_token", token);
  localStorage.setItem("rol", rol);
}

export function getToken() {
  return localStorage.getItem("access_token");
}

export function getRole() {
  return localStorage.getItem("rol");
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.clear();
  window.location.href = "/login";
}


export function redirectToRolePage() {
  const rol = getRole();

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
  }
}
