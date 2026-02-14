import { useEffect, useState } from 'react'
import BlurText from '@/components/BlurText'
import Orb from '@/components/Orb'
import FluidGlass from '@/components/FluidGlass'
import StackSection from '@/components/StackSection'

export function App() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <div className={isDark ? 'bg-black text-white' : 'bg-white text-black'}>
      {/* ── Hero Section: Orb Background ── */}
      <section id="hero" className="relative w-full h-screen overflow-hidden">
        {/* Animated Orb Background */}
        <div className="absolute inset-0 z-0">
          <Orb
            hue={isDark ? 220 : 250}
            hoverIntensity={0.3}
            rotateOnHover={true}
            forceHoverState={false}
            backgroundColor={isDark ? '#000000' : '#ffffff'}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full gap-5 pointer-events-none select-none px-6">
          <BlurText
            text="Sarthak Ghosh"
            className={`text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight drop-shadow-lg ${
              isDark ? 'text-white' : 'text-black'
            }`}
            animateBy="letters"
            delay={40}
          />
          <BlurText
            text="Developer & Builder"
            className={`text-xl md:text-2xl font-light tracking-[0.3em] uppercase ${
              isDark ? 'text-white/60' : 'text-black/60'
            }`}
            animateBy="words"
            delay={200}
          />
          <p className={`text-base md:text-lg max-w-xl text-center mt-4 leading-relaxed animate-[fadeIn_1.5s_ease-out_1s_both] ${
            isDark ? 'text-white/35' : 'text-black/40'
          }`}>
            Building real-world products — from AI-powered tools to
            open-source utilities. Shipping code that matters.
          </p>

          {/* Contact CTA */}
          <button
            onClick={() => { window.location.href = 'https://contact.sarthakg.tech'; }}
            className={`pointer-events-auto mt-6 px-8 py-3 rounded-full text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer animate-[fadeIn_1.5s_ease-out_1.5s_both] ${
              isDark 
                ? 'border border-white/15 bg-white/[0.04] text-white/70 hover:bg-white/[0.1] hover:border-purple-500/40 hover:text-white hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]'
                : 'border border-black/15 bg-black/[0.04] text-black/70 hover:bg-black/[0.1] hover:border-purple-500/40 hover:text-black hover:shadow-[0_0_30px_rgba(124,58,237,0.2)]'
            }`}
          >
            Get in touch
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce opacity-50">
          <svg className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-black/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ── Projects Section: FluidGlass with Glass Dock ── */}
      <section id="projects" className="relative w-full h-screen">
        <FluidGlass
          mode="bar"
          barProps={{
            navItems: [
              { label: 'Home', link: '#hero' },
              { label: 'Projects', link: '#projects' },
              { label: 'Stack', link: '#stack' },
              { label: 'Contact', link: 'https://contact.sarthakg.tech' },
            ],
          }}
        />
      </section>

      {/* ── Stack Section ── */}
      <StackSection isDark={isDark} />
    </div>
  )
}

export default App
