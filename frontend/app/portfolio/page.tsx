import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { portfolioPositions } from '@/lib/demoData';
import { formatPct } from '@/lib/utils';

const totalValue = portfolioPositions.reduce((sum, item) => sum + item.marketValue, 0);
const invested = portfolioPositions.reduce((sum, item) => sum + item.cost, 0);
const pnl = totalValue - invested;
const top3Weight = portfolioPositions.slice(0, 3).reduce((sum, item) => sum + item.weight, 0);

const sectorExposure: Array<[string, number]> = [
  ['主要消费 / 白酒', 47.25],
  ['工业 / 动力电池', 23.86],
  ['可选消费 / 新能源车', 13.94],
  ['金融 / 商业银行', 7.96],
  ['材料 / 金属矿业', 7.0],
];

const themeExposure: Array<[string, number]> = [
  ['消费', 15.3],
  ['质量', 13.8],
  ['防御', 11.81],
  ['高端', 11.81],
  ['新能源', 9.45],
  ['成长', 9.45],
  ['电池', 5.97],
  ['制造', 5.97],
];

export default function PortfolioPage() {
  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">/// PORTFOLIO INTELLIGENCE</p>
          <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">组合诊断中台</h1>
          <p className="mt-6 max-w-4xl text-sm leading-8 text-gray-700">
            WealthAgent 分析组合结构、行业暴露和风险护栏，仅用于研究辅助，不产生交易指令。
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <Card className="shadow-hard-blue">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">USER PROFILE MEMORY</div>
            <h2 className="mt-3 font-display text-4xl font-black">用户画像存储</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="DEMO USER" />
              <select className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="BALANCED">
                <option>BALANCED</option>
                <option>CONSERVATIVE</option>
                <option>GROWTH</option>
              </select>
              <select className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="MEDIUM TERM">
                <option>SHORT TERM</option>
                <option>MEDIUM TERM</option>
                <option>LONG TERM</option>
              </select>
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="FINANCIALS, CONSUMER STAPLES" />
            </div>
            <textarea className="mt-4 min-h-32 w-full border-4 border-ink p-4 text-sm leading-7" defaultValue="偏好稳定、研究导向的输出；关注组合集中度、行业暴露和回撤风险。" />
            <Button className="mt-4">保存画像</Button>
          </Card>

          <Card className="shadow-hard-pink">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">PORTFOLIO SIMULATOR</div>
            <h2 className="mt-3 font-display text-4xl font-black">持仓账本</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="600519" />
              <select className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="BUY"><option>BUY</option><option>SELL</option></select>
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="100" />
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" defaultValue="1688.5" />
            </div>
            <Button className="mt-4">添加交易</Button>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Metric label="持仓数" value={String(portfolioPositions.length)} />
              <Metric label="投入成本" value={invested.toFixed(0)} />
              <Metric label="市值" value={totalValue.toFixed(0)} />
              <Metric label="浮盈亏" value={`${pnl.toFixed(0)} / ${formatPct((pnl / invested) * 100)}`} />
            </div>
          </Card>
        </div>

        <Card className="shadow-hard-green">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">PORTFOLIO OVERVIEW</div>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Metric label="最大持仓" value="600519" />
            <Metric label="最大权重" value="47.25%" />
            <Metric label="30日收益" value="0.36%" />
            <Metric label="年化波动" value="17.09%" />
            <Metric label="最大回撤" value="8.77%" />
          </div>
        </Card>

        <div className="grid gap-8 xl:grid-cols-2">
          <Card>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">EXPOSURE BREAKDOWN</div>
            <h2 className="mt-3 font-display text-4xl font-black">行业 + 主题地图</h2>
            <ExposureList title="行业暴露" items={sectorExposure} />
            <ExposureList title="主题暴露" items={themeExposure} />
          </Card>
          <Card className="shadow-hard-blue">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">CONCENTRATION AND RISK</div>
            <h2 className="mt-3 font-display text-4xl font-black">组合诊断</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Metric label="前三权重" value={`${top3Weight.toFixed(2)}%`} />
              <Metric label="有效持仓" value="3.22" />
              <Metric label="画像匹配" value="需复核" />
              <Metric label="最大单仓" value="47.25%" />
              <Metric label="30日收益" value="0.36%" />
              <Metric label="回撤" value="8.77%" />
            </div>
          </Card>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <Card className="shadow-hard-pink">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">CONTRIBUTION ANALYSIS</div>
            <h2 className="mt-3 font-display text-4xl font-black">赢家与拖累项</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {portfolioPositions.slice(0, 3).map((item) => <PositionCard key={item.ticker} item={item} positive />)}
              {portfolioPositions.slice(3).map((item) => <PositionCard key={item.ticker} item={item} />)}
            </div>
          </Card>
          <Card>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">DETERMINISTIC RULES ONLY</div>
            <h2 className="mt-3 font-display text-4xl font-black">风险护栏</h2>
            <Guard severity="高" title="单一股票集中度偏高" text="600519 占组合 47.25%，高于均衡型投资者 40% 的护栏阈值。" />
            <Guard severity="中" title="前三持仓主导组合风险" text="前三大持仓占 85.05%，高于 75% 的集中度阈值。" />
            <Guard severity="低" title="行业偏好匹配不足" text="组合中金融偏好暴露不足，需要和用户画像重新对齐。" />
          </Card>
        </div>

        <Card className="shadow-hard-green">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">AI EXPLANATION LAYER</div>
          <h2 className="mt-3 font-display text-4xl font-black">组合摘要</h2>
          <p className="mt-6 border-2 border-ink p-5 text-sm leading-8">
            该组合的主要问题是集中度风险。五只持仓中，前三大持仓贡献 85.05% 的市值，最大单一持仓 600519 占 47.25%。行业上主要暴露于白酒消费和动力电池，组合表现高度依赖少数公司的 idiosyncratic risk。当前诊断建议以研究复核为主，关注单一股票权重、行业偏离和回撤来源。本摘要不输出买卖指令。
          </p>
        </Card>

        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">OPEN POSITIONS</div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b-2 border-ink uppercase tracking-[0.2em]">
                <tr>
                  {['代码', '行业', '数量', '成本', '市值', '盈亏', '30日', '波动', '权重'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {portfolioPositions.map((item) => (
                  <tr key={item.ticker} className="border-b border-gray-200">
                    <td className="px-4 py-4 font-bold">{item.ticker}<div className="text-xs font-normal text-gray-500">{item.name}</div></td>
                    <td className="px-4 py-4">{item.sector}<div className="text-xs text-gray-500">{item.tags}</div></td>
                    <td className="px-4 py-4">{item.qty}</td>
                    <td className="px-4 py-4">{item.cost.toFixed(2)}</td>
                    <td className="px-4 py-4">{item.marketValue.toFixed(2)}</td>
                    <td className="px-4 py-4 text-emerald-700">+{item.pnl.toFixed(2)} ({item.pnlPct.toFixed(2)}%)</td>
                    <td className="px-4 py-4">{formatPct(item.return30d)}</td>
                    <td className="px-4 py-4">{item.vol.toFixed(2)}%</td>
                    <td className="px-4 py-4">{item.weight.toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-28 border-2 border-ink bg-cloud p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-500">{label}</div>
      <div className="mt-3 break-words font-display text-2xl font-black leading-tight xl:text-3xl">{value}</div>
    </div>
  );
}

function ExposureList({ title, items }: { title: string; items: Array<[string, number]> }) {
  return (
    <div className="mt-6">
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{title}</div>
      <div className="space-y-4">
        {items.map(([name, value]) => (
          <div key={name}>
            <div className="flex justify-between gap-4 text-sm font-bold"><span>{name}</span><span>{value.toFixed(2)}%</span></div>
            <div className="mt-2 h-3 border-2 border-ink"><div className="h-full bg-electric" style={{ width: `${Math.min(value, 100)}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PositionCard({ item, positive = false }: { item: typeof portfolioPositions[number]; positive?: boolean }) {
  return (
    <div className="border-2 border-ink p-4">
      <div className="font-bold">{item.ticker} / {item.name}</div>
      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">WEIGHT {item.weight.toFixed(2)}% / MKT VALUE {item.marketValue.toFixed(2)}</div>
      <div className={positive ? 'mt-2 text-emerald-700' : 'mt-2 text-punch'}>Pnl +{item.pnl.toFixed(2)} ({item.pnlPct.toFixed(2)}%)</div>
    </div>
  );
}

function Guard({ severity, title, text }: { severity: string; title: string; text: string }) {
  const color = severity === '高' ? 'border-punch bg-punch/5' : severity === '中' ? 'border-amber-400 bg-amber-50' : 'border-ink';
  return (
    <div className={`mt-4 border-2 p-4 ${color}`}>
      <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{severity}严重度</div>
      <div className="mt-2 font-bold">{title}</div>
      <p className="mt-2 text-sm leading-7">{text}</p>
    </div>
  );
}
