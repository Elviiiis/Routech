export const siteConfig = {
  name: 'Routech Automation',
  description:
    'Catálogo administrável de máquinas CNC Router e soluções de automação industrial da Routech.',
  email: 'contato@routechautomation.com',
  whatsappNumber: '5545999819677',
  whatsappDisplay: '(45) 99981-9677',
  whatsappLink:
    'https://wa.me/5545999819677?text=' +
    encodeURIComponent('Olá! Gostaria de falar com a Routech Automation.'),
  navItems: [
    { label: 'Início', href: '#inicio' },
    { label: 'Máquinas', href: '#maquinas' },
    { label: 'Galeria', href: '#galeria' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Contato', href: '#contato' },
  ],
} as const
