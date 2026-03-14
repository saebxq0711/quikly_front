import { Bot, Clock, BarChart3, Shield, Sparkles, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: Bot,
      title: "IA Conversacional",
      description:
        "Chatbots inteligentes que comprenden y responden en lenguaje natural, ofreciendo una experiencia personalizada.",
    },
    {
      icon: Clock,
      title: "Disponibilidad 24/7",
      description: "Atiende a tus clientes en cualquier momento del día sin necesidad de personal adicional.",
    },
    {
      icon: BarChart3,
      title: "Analytics Avanzado",
      description: "Obtén insights profundos sobre el comportamiento y necesidades de tus clientes en tiempo real.",
    },
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Cumplimiento total con normativas de protección de datos y encriptación de extremo a extremo.",
    },
    {
      icon: Sparkles,
      title: "Integración Sencilla",
      description: "Conecta con tus sistemas existentes en minutos. Compatible con las principales plataformas.",
    },
    {
      icon: Users,
      title: "Multicanal",
      description: "Web, móvil, redes sociales y más. Una experiencia consistente en todos los canales.",
    },
  ]

  return (
    <section id="soluciones" className="py-20 lg:py-32 px-4 lg:px-8">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-balance mb-6">
            Soluciones diseñadas para <span className="text-accent">impulsar tu negocio</span>
          </h2>
          <p className="text-lg lg:text-xl text-muted-foreground text-balance leading-relaxed">
            Herramientas poderosas que transforman la manera en que interactúas con tus clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border-border hover:border-accent transition-colors group">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
