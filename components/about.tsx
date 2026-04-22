import { Target, Zap, Shield } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Precisão",
    description: "Usinagem e acabamento consistentes para resultados profissionais.",
  },
  {
    icon: Zap,
    title: "Produtividade",
    description: "Processos otimizados para ganhar ritmo sem perder qualidade.",
  },
  {
    icon: Shield,
    title: "Suporte",
    description: "Equipamentos robustos com atendimento próximo para operação contínua.",
  },
]

export function About() {
  return (
    <section id="sobre" className="py-16 lg:py-24 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
            Sobre a Empresa
          </h2>
          <p className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight text-balance">
            Especialistas em tecnologia CNC para aplicações industriais
          </p>
        </div>

        <div className="mt-8 lg:mt-12 max-w-3xl">
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            A Routech Automation é especializada no desenvolvimento de máquinas CNC
            Router e soluções de automação para aplicações industriais e comerciais.
            Nossas máquinas são projetadas para entregar precisão, produtividade e
            confiabilidade, ajudando empresas e empreendedores a elevar o nível de
            seus processos com uma operação mais segura e previsível.
          </p>
        </div>

        <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
