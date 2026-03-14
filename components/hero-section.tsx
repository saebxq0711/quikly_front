import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 lg:pt-40 pb-20 lg:pb-32 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8">
            <Zap className="h-4 w-4 text-accent" />
            <span>Automatización inteligente para tu negocio</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-balance mb-6">
            Revoluciona tu atención al cliente con <span className="text-accent">autoservicio</span>
          </h1>

          <p className="text-xl lg:text-2xl text-muted-foreground text-balance max-w-3xl mx-auto mb-12 leading-relaxed">
            Transforma la experiencia de tus clientes con soluciones de autoatención inteligente. Reduce tiempos de
            espera y aumenta la satisfacción hasta un 95%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6">
              Comenzar ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
              Ver demo en vivo
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
