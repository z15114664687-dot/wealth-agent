import { SectionTitle } from '@/components/ui/SectionTitle';

const steps = [
  ['数据代理', '收集选定 A 股的实时或兜底行情，并补充公司上下文。'],
  ['分析代理', '计算趋势、收益、波动率、财务质量和技术信号。'],
  ['报告代理', '把结构化证据转成中文研究报告和可读结论。'],
  ['个性化代理', '根据稳健、均衡或成长偏好调整关注重点。'],
];

export function AgentWorkflow() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-7xl space-y-10">
        <SectionTitle eyebrow="/// AGENT WORKFLOW" title="不是聊天框，是研究流水线。" subtitle="系统按规划、数据、分析、生成和护栏反思分阶段运行，而不是单次提示词输出。" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map(([title, desc], idx) => (
            <div key={title} className="border-4 border-ink bg-white p-6">
              <div className="mb-6 flex h-12 w-12 items-center justify-center border-4 border-ink font-display text-2xl font-black">{idx + 1}</div>
              <h3 className="font-display text-3xl font-black tracking-tighter">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-gray-700">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
