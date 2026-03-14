"use client";

import { ReactNode, useEffect, useState } from "react";
import { isAuthenticated, getRole, redirectToRolePage, logout } from "./auth";

interface GuardProps {
  children: ReactNode;
  allowedRoles?: string[]; // Si no se pasa, es página pública
}

export default function Guard({ children, allowedRoles }: GuardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = isAuthenticated();
    const rol = getRole();

    // Página pública (login, index)
    if (!allowedRoles) {
      if (auth) {
        redirectToRolePage(); // ya tiene sesión → lo mando a su home
      } else {
        setLoading(false); // puede ver la página pública
      }
      return;
    }

    // Página privada
    if (!auth) {
      logout(); // fuerza a login
      return;
    }

    if (!rol || !allowedRoles.includes(rol)) {
      redirectToRolePage(); // no tiene permiso → lo mando a su home
      return;
    }

    setLoading(false); // todo ok, puede ver la página
  }, []);

  if (loading) return <div>Cargando...</div>;

  return <>{children}</>;
}
