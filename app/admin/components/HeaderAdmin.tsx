"use client";

import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { useRestaurante } from "../context/RestauranteContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Search,
  LogOut,
  Settings,
  User,
  HelpCircle,
  ChevronDown,
  Calendar,
} from "lucide-react";

export default function HeaderAdmin() {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const { restaurante } = useRestaurante();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-20 px-8 bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {restaurante.nombre || "Dashboard"}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground capitalize">{today}</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* Divider */}
        <div className="w-px h-8 bg-border mx-2" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-12 px-3 rounded-xl hover:bg-muted"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">Admin</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2">
            <DropdownMenuItem
              onClick={logout}
              className="gap-3 py-2.5 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
