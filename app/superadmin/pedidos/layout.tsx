import { ReactNode } from "react";

export default function PedidosLayout({ children }: { children: ReactNode }) {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-800">
          Gestión de Pedidos
        </h1>
        <p className="text-sm text-gray-500">
          Visualiza y controla los pedidos de todos los restaurantes
        </p>
      </header>

      {children}
    </section>
  );
}
