import { Card } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">/// PRODUCT ARCHITECTURE</p>
          <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">系统设计</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-hard-blue">
            <h2 className="font-display text-3xl font-black">为什么使用 Agentic AI</h2>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              WealthAgent AI 被设计成研究助手，而不是自动交易系统。工作流把数据获取、财务与信号分析、报告生成、个性化适配和护栏反思拆成可观察阶段。
            </p>
          </Card>
          <Card className="shadow-hard-green">
            <h2 className="font-display text-3xl font-black">架构</h2>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              Next.js 前端 -&gt; FastAPI 后端 -&gt; Tushare / fallback 数据层 -&gt; Gemini 报告引擎 -&gt; 结构化 JSON -&gt; 中文研究界面。
            </p>
          </Card>
          <Card className="shadow-hard-pink">
            <h2 className="font-display text-3xl font-black">数据策略</h2>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              后端优先使用 Tushare，其次尝试 yfinance，最后使用 mock 数据，保证演示在外部数据不可用时仍能稳定运行。
            </p>
          </Card>
          <Card>
            <h2 className="font-display text-3xl font-black">免责声明</h2>
            <p className="mt-4 text-sm leading-7 text-gray-700">
              本系统仅用于研究与教学展示，不构成投资建议。原型输出可解释研究内容，不提供下单执行或自动化买卖建议。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
