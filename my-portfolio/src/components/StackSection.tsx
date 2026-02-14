import { useEffect, useRef, useState } from 'react';

const STACK = {
  Frontend: ['React', 'Svelte', 'HTML / CSS / JS'],
  Backend: ['Python', 'Flask', 'REST APIs', 'C', 'C#', 'C++', 'Rust', 'Tauri', 'JS'],
  Mobile: ['Kotlin (Android)', 'Flutter'],
  Systems: ['C / C++', 'GitHub Actions', 'Cloudflare', 'OAuth flows'],
};

function StackItem({ label, delay, isDark }: { label: string; delay: number; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`px-4 py-2 rounded-lg text-sm transition-all duration-500 hover:scale-105 cursor-default ${
        isDark
          ? 'border border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/[0.08] hover:border-purple-500/40 hover:text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]'
          : 'border border-black/10 bg-black/[0.03] text-black/80 hover:bg-black/[0.08] hover:border-purple-500/40 hover:text-black hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]'
      }`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {label}
    </div>
  );
}

export default function StackSection({ isDark = true }: { isDark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  let globalIndex = 0;

  return (
    <section id="stack" className={`relative min-h-screen px-6 py-24 md:px-16 lg:px-32 ${
      isDark ? 'bg-black' : 'bg-white'
    }`}>
      {/* Subtle gradient top fade */}
      <div className={`absolute top-0 left-0 right-0 h-32 pointer-events-none ${
        isDark
          ? 'bg-gradient-to-b from-[#080818] to-transparent'
          : 'bg-gradient-to-b from-[#f5f5f7] to-transparent'
      }`} />

      <div ref={ref} className="max-w-5xl mx-auto">
        <h2
          className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight transition-all duration-700 ${
            isDark ? 'text-white' : 'text-black'
          }`}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(30px)',
          }}
        >
          Stack
        </h2>
        <p
          className={`text-lg mb-16 transition-all duration-700 delay-100 ${
            isDark ? 'text-white/40' : 'text-black/40'
          }`}
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          Technologies I work with
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {Object.entries(STACK).map(([category, items]) => (
            <div key={category}>
              <h3 className={`text-sm font-semibold uppercase tracking-widest mb-4 ${
                isDark ? 'text-purple-400/80' : 'text-purple-600/80'
              }`}>
                {category}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => {
                  const idx = globalIndex++;
                  return <StackItem key={item} label={item} delay={idx * 40} isDark={isDark} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
