"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRestaurante } from "../context/RestauranteContext";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Percent,
  Monitor,
  BarChart3,
  User,
  ChevronRight,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/menu", label: "Menú", icon: UtensilsCrossed },
  { href: "/admin/promocion", label: "Promociones", icon: Percent },
  { href: "/admin/kiosco", label: "Kiosco", icon: Monitor },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/perfil", label: "Perfil", icon: User },
];

export default function SidebarAdmin() {
  const { restaurante } = useRestaurante();
  const pathname = usePathname();

  const nombre = restaurante?.nombre || "Restaurante";
  const inicial = nombre.charAt(0) || "R";

  return (
    <aside className="w-72 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center overflow-hidden ring-2 ring-sidebar-primary/20">
              {restaurante?.logo ? (
                <img
                  src={restaurante.logo}
                  alt={nombre}
                  className="object-contain w-full h-full p-1"
                />
              ) : (
                <span className="text-lg font-bold text-sidebar-primary">
                  {inicial}
                </span>
              )}
            </div>

            {/* status dot */}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-sidebar" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              Restaurante
            </p>
            <p className="font-semibold text-sidebar-foreground truncate">
              {nombre}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="px-3 mb-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
          Menú principal
        </p>

        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 ease-out
                ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }
              `}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "" : "group-hover:scale-110"
                }`}
              />
              <span className="flex-1">{link.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="px-4 py-3 rounded-xl bg-sidebar-accent/50">
          <p className="text-xs text-sidebar-foreground/50 mb-1">Powered by</p>
          <p className="text-sm font-semibold text-sidebar-primary">Quikly</p>
        </div>
      </div>
    </aside>
  );
}
