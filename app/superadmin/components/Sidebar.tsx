"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Users, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menu = [
  { name: "Dashboard", href: "/superadmin", icon: LayoutDashboard },
  { name: "Restaurantes", href: "/superadmin/restaurantes", icon: Store },
  { name: "Administradores", href: "/superadmin/administradores", icon: Users },
  { name: "Pedidos", href: "/superadmin/pedidos", icon: ShoppingBag },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
        {collapsed ? (
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <span className="font-bold text-sidebar-primary-foreground">Q</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <span className="font-bold text-sidebar-primary-foreground">Q</span>
            </div>
            <div>
              <p className="font-bold text-sm">Quikly</p>
              <p className="text-xs text-sidebar-foreground/60">SuperAdmin</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {menu.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/superadmin" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/25"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm">Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}
