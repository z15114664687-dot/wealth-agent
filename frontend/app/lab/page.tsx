import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { labScreenResults } from '@/lib/demoData';

export default function LabPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">/// AGENT EXPERIMENTS</p>
          <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">Agent 实验室</h1>
          <p className="mt-6 max-w-4xl text-sm leading-8 text-gray-700">
            用于展示筛选、简化回测和系统指标。这里不是交易系统，而是产品评估和研究流程验证区。
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <Card className="shadow-hard-blue">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">SCREENER LAB</div>
            <h2 className="mt-3 font-display text-4xl font-black">股票筛选器</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="PE < 12" />
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="DIVIDEND > 4%" />
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="TOP 300" />
            </div>
            <Button className="mt-4">运行筛选</Button>
            <div className="mt-6 space-y-4">
              {labScreenResults.map((item) => (
                <div key={item.ticker} className="border-2 border-ink bg-cloud p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{item.ticker} / {item.sector}</div>
                  <div className="mt-2 font-display text-2xl font-black">{item.name}</div>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-gray-700">
                    PE {item.pe} / 股息 {item.dividend} / 市值 {item.marketCap} / 30日 {item.return30d}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="shadow-hard-pink">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">BACKTEST SNAPSHOT</div>
            <h2 className="mt-3 font-display text-4xl font-black">简化回测</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Metric label="策略收益" value="-3.66%" />
              <Metric label="基准收益" value="-10.04%" />
              <Metric label="超额收益" value="+6.38%" />
              <Metric label="最大回撤" value="-7.55%" />
              <Metric label="交易次数" value="2" />
              <Metric label="信号" value="震荡 / 防御" />
            </div>
          </Card>
        </div>

        <Card className="shadow-hard-green">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">SYSTEM METRICS</div>
          <h2 className="mt-3 font-display text-4xl font-black">系统评估面板</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="研究运行数" value="128" />
            <Metric label="缓存命中率" value="42%" />
            <Metric label="护栏通过率" value="100%" />
            <Metric label="平均延迟" value="8.7s" />
          </div>
          <p className="mt-6 border-2 border-ink p-4 text-sm leading-8">
            实验室页面复刻视频中的筛选器和回测视图，用于展示 agentic workflow 的可观测性。真实生产环境应接入更完整的因子、交易成本、样本外检验和评价指标。
          </p>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-28 border-2 border-ink bg-cloud p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{label}</div>
      <div className="mt-3 break-words font-display text-3xl font-black leading-tight">{value}</div>
    </div>
  );
}
