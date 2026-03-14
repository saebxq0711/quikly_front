export function StatsSection() {
  const stats = [
    {
      value: "95%",
      label: "Reducción en tiempos de espera",
      company: "Retail",
    },
    {
      value: "24/7",
      label: "Disponibilidad continua",
      company: "Servicios",
    },
    {
      value: "3x",
      label: "Aumento en eficiencia",
      company: "Tecnología",
    },
    {
      value: "85%",
      label: "Satisfacción del cliente",
      company: "Finanzas",
    },
  ]

  return (
    <section id="beneficios" className="py-16 lg:py-24 px-4 lg:px-8 bg-secondary/50">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow">
              <div className="text-4xl lg:text-5xl font-bold text-accent mb-2">{stat.value}</div>
              <div className="text-base lg:text-lg font-medium text-foreground mb-2">{stat.label}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.company}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
