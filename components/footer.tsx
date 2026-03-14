import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Image src="/images/logo.png" alt="Quikly" width={120} height={40} className="h-8 w-auto mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Revolucionando la autoatención con inteligencia artificial y tecnología de vanguardia.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Producto</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Casos de éxito
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Integraciones
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Empresa</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Acerca de
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Soporte</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Centro de ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Documentación
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
                  Estado del servicio
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2026 Quikly Autoatención. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Términos
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
