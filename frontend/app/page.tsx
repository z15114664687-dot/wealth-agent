import Link from 'next/link';
import { Hero } from '@/components/home/Hero';
import { MarqueeStrip } from '@/components/home/MarqueeStrip';
import { CapabilityGrid } from '@/components/home/CapabilityGrid';
import { AgentWorkflow } from '@/components/home/AgentWorkflow';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <MarqueeStrip />
      <CapabilityGrid />
      <AgentWorkflow />
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl border-4 border-ink bg-white p-10 shadow-hard-blue">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">/// FINAL CALL TO ACTION</p>
          <h2 className="mt-4 font-display text-5xl font-black leading-none tracking-tighter md:text-7xl">
            把碎片化市场信息变成结构化研究判断。
          </h2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/workspace"><Button className="shadow-hard-green">开始研究</Button></Link>
            <Link href="/watchlist"><Button className="shadow-hard-pink">查看观察列表</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
