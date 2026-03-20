"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function Header() {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Quikly" width={120} height={40} className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="/#soluciones" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Soluciones
            </a>
            <a href="/#beneficios" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Beneficios
            </a>
            <a href="/#contacto" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {!isLoginPage && (
              <Link href="/login">
                <Button variant="ghost" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Iniciar sesión
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
