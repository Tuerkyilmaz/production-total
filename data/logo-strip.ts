export type LogoStripItem = {
  id: number
  file: string
  alt: string
  href?: string
  pad5?: boolean
  imgClass?: string
}

export const logoStripItems: LogoStripItem[] = [
  { id: 1, file: 'talents-total-logo.png', alt: 'Talents Total Logo', href: 'https://www.talentstotal.com/' },
  { id: 2, file: 'salzburgring_logo.png', alt: 'Salzburgring Logo', href: 'https://www.nuerburgring.de/' },
  { id: 3, file: 'porsche-logo.png', alt: 'Porsche Logo', href: 'https://www.porsche.com/germany/' },
  { id: 4, file: 'loco-chicken-logo.png', alt: 'Loco Chicken Logo', href: 'https://loco-chicken.com/' },
  { id: 5, file: 'gym-tools-24-logo.png', alt: 'Gym Tools 24 Logo', href: 'https://gymtools24.de/' },
  { id: 6, file: 'goenrgy-logo.webp', alt: 'Goenrgy Logo', href: 'https://goenrgy.de/' },
  { id: 7, file: 'amazon-logo.png', alt: 'Amazon Logo', href: 'https://www.amazon.de/', imgClass: 'pt-[10px] pb-0' },
  { id: 8, file: 'twitch-logo.png', alt: 'Twitch Logo', href: 'https://www.twitch.tv/', pad5: true },
  { id: 9, file: 'pimp-your-ride-logo.png', alt: 'Pimp Your Ride Logo', href: 'https://pimpyourride.online/' }
]
