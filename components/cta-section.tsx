import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section id="contacto" className="py-20 lg:py-32 px-4 lg:px-8 bg-secondary/30">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-balance mb-6">
            ¿Listo para transformar tu atención al cliente?
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground text-balance mb-10 max-w-2xl mx-auto leading-relaxed">
            Únete a las empresas líderes que ya confían en Quikly para ofrecer experiencias excepcionales
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6">
              Solicitar demostración
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              Hablar con ventas
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
