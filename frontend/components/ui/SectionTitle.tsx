export function SectionTitle({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">{eyebrow}</p>
      <h2 className="font-display text-4xl font-black leading-none tracking-tighter md:text-6xl">{title}</h2>
      {subtitle ? <p className="max-w-2xl text-sm leading-7 text-gray-700">{subtitle}</p> : null}
    </div>
  );
}
