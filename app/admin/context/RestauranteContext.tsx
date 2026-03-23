// app/context/RestauranteContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Restaurante = {
  nombre: string;
  logo?: string | null;
};

type RestauranteContextType = {
  restaurante: Restaurante;
  reloadRestaurante: () => Promise<void>;
};

const RestauranteContext = createContext<RestauranteContextType>({
  restaurante: { nombre: "", logo: null },
  reloadRestaurante: async () => {},
});

export function RestauranteProvider({ children }: { children: ReactNode }) {
  const [restaurante, setRestaurante] = useState<Restaurante>({
    nombre: "",
    logo: null,
  });

  const loadRestaurante = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const API = process.env.NEXT_PUBLIC_API_URL!;

    try {
      const res = await fetch(`${API}/admin/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      setRestaurante({
        nombre: data.restaurante.nombre,
        logo: data.restaurante.logo || null,
      });
    } catch (err) {
      console.error("Error cargando restaurante:", err);
    }
  };

  useEffect(() => {
    loadRestaurante();
  }, []);

  return (
    <RestauranteContext.Provider
      value={{ restaurante, reloadRestaurante: loadRestaurante }}
    >
      {children}
    </RestauranteContext.Provider>
  );
}

export const useRestaurante = () => useContext(RestauranteContext);
