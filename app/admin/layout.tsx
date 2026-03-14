"use client";

import Guard from "@/lib/guards";
import { RestauranteProvider } from "./context/RestauranteContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Guard allowedRoles={["admin_restaurante"]}>
      <RestauranteProvider>
        {children}
      </RestauranteProvider>
    </Guard>
  );
}
