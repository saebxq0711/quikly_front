"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, LogOut, Bell, Search, Settings, Menu } from "lucide-react";
import { logout } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Mobile menu button */}
      <button className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
        <Menu className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Logo for mobile */}
      <Link href="/superadmin" className="lg:hidden flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="font-bold text-primary-foreground text-sm">Q</span>
        </div>
      </Link>

      {/* Search - Desktop */}
      <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar restaurantes, pedidos..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border-0 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search mobile */}
        <button className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <span className="hidden sm:block text-sm font-medium text-foreground">SuperAdmin</span>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-scale-in">
              <div className="p-3 border-b border-border">
                <p className="font-medium text-sm text-card-foreground">Super Administrador</p>
                <p className="text-xs text-muted-foreground">Acceso completo</p>
              </div>
              <div className="p-1">
                <Link
                  href="/superadmin/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm text-card-foreground"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Configuracion
                </Link>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 transition-colors text-sm text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar sesion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
