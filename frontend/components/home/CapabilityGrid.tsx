import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';

const items = [
  ['数据接入', '接入 A 股价格、公司画像、估值字段和结构化市场上下文。'],
  ['财务与基本面', '拆解收入、利润率、ROE、现金流、增长驱动和风险观察点。'],
  ['竞争格局', '比较行业位置、护城河、可比公司与相对优势。'],
  ['持续监控', '观察列表、阈值目标、告警记录和组合风险护栏。'],
];

export function CapabilityGrid() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionTitle eyebrow="/// CORE CAPABILITIES" title="像现代研究台一样组织信息" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {items.map(([title, desc], idx) => (
            <Card key={title} className={idx % 3 === 0 ? 'shadow-hard-blue' : idx % 3 === 1 ? 'shadow-hard-green' : 'shadow-hard-pink'}>
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">0{idx + 1}</div>
              <h3 className="mt-4 font-display text-3xl font-black leading-none tracking-tighter">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-gray-700">{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
