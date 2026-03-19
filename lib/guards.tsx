"use client";

import { ReactNode, useEffect, useState } from "react";
import { isAuthenticated, getRole, redirectToRolePage, logout } from "./auth";

interface GuardProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function Guard({ children, allowedRoles }: GuardProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = isAuthenticated();
    const rol = getRole();

    // Página pública
    if (!allowedRoles) {
      if (auth) {
        redirectToRolePage();
      } else {
        setLoading(false);
      }
      return;
    }

    // Página privada
    if (!auth) {
      logout();
      return;
    }

    if (!rol || !allowedRoles.includes(rol)) {
      redirectToRolePage();
      return;
    }

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--primary)]"></div>

          <p className="text-sm text-gray-500">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}