'use client';

import { useMemo, useState } from 'react';
import { Check, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getCompanyProfile, portfolioPositions } from '@/lib/demoData';
import { formatPct } from '@/lib/utils';

type Position = typeof portfolioPositions[number];
type Transaction = { id: string; ticker: string; side: string; qty: number; price: number };

const defaultProfile = {
  user: 'DEMO USER',
  risk: 'BALANCED',
  horizon: 'MEDIUM TERM',
  preferences: 'FINANCIALS, CONSUMER STAPLES',
  notes: '偏好稳定、研究导向的输出；关注组合集中度、行业暴露和回撤风险。',
};

const fallbackNames: Record<string, string> = {
  '002594': '比亚迪',
  '600036': '招商银行',
  '601899': '紫金矿业',
};

function normalizePositions(positions: Position[]) {
  const totalValue = positions.reduce((sum, item) => sum + item.marketValue, 0);

  return positions.map((item) => {
    const pnl = item.marketValue - item.cost;
    return {
      ...item,
      pnl,
      pnlPct: item.cost ? (pnl / item.cost) * 100 : 0,
      weight: totalValue ? (item.marketValue / totalValue) * 100 : 0,
    };
  });
}

function buildPosition(ticker: string, qty: number, price: number): Position {
  const profile = getCompanyProfile(ticker);
  const cost = qty * price;

  return {
    ticker,
    name: fallbackNames[ticker] || (profile.style === '通用研究样本' ? '自定义标的' : ticker),
    sector: profile.sector,
    tags: profile.tags.join('、'),
    qty,
    cost,
    marketValue: cost,
    pnl: 0,
    pnlPct: 0,
    return30d: 0,
    vol: 18,
    weight: 0,
  };
}

function toExposure(positions: Position[], selector: (item: Position) => string[]) {
  const totalValue = positions.reduce((sum, item) => sum + item.marketValue, 0);
  const map = new Map<string, number>();

  positions.forEach((item) => {
    selector(item).forEach((name) => map.set(name, (map.get(name) || 0) + item.marketValue));
  });

  return Array.from(map.entries())
    .map(([name, value]) => [name, totalValue ? (value / totalValue) * 100 : 0] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
}

export default function PortfolioPage() {
  const [profile, setProfile] = useState(defaultProfile);
  const [savedProfile, setSavedProfile] = useState(defaultProfile);
  const [profileSaved, setProfileSaved] = useState(false);
  const [positions, setPositions] = useState<Position[]>(portfolioPositions);
  const [tradeTicker, setTradeTicker] = useState('600519');
  const [tradeSide, setTradeSide] = useState('BUY');
  const [tradeQty, setTradeQty] = useState('100');
  const [tradePrice, setTradePrice] = useState('1688.5');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const normalizedPositions = useMemo(() => normalizePositions(positions), [positions]);
  const sortedPositions = useMemo(() => [...normalizedPositions].sort((a, b) => b.weight - a.weight), [normalizedPositions]);
  const totalValue = normalizedPositions.reduce((sum, item) => sum + item.marketValue, 0);
  const invested = normalizedPositions.reduce((sum, item) => sum + item.cost, 0);
  const pnl = totalValue - invested;
  const top3Weight = sortedPositions.slice(0, 3).reduce((sum, item) => sum + item.weight, 0);
  const maxPosition = sortedPositions[0];
  const weightedReturn = normalizedPositions.reduce((sum, item) => sum + item.return30d * (item.weight / 100), 0);
  const weightedVol = normalizedPositions.reduce((sum, item) => sum + item.vol * (item.weight / 100), 0);
  const effectiveHoldings = normalizedPositions.reduce((sum, item) => sum + Math.pow(item.weight / 100, 2), 0);
  const sectorExposure = toExposure(normalizedPositions, (item) => [item.sector]);
  const themeExposure = toExposure(normalizedPositions, (item) => item.tags.split('、').filter(Boolean));
  const profileMatch = savedProfile.preferences.toUpperCase().includes('FINANCIAL') || savedProfile.preferences.includes('金融') ? '部分匹配' : '需复核';

  function saveProfile() {
    setSavedProfile(profile);
    setProfileSaved(true);
  }

  function addTransaction() {
    const ticker = tradeTicker.trim().toUpperCase();
    const qty = Number(tradeQty);
    const price = Number(tradePrice);

    if (!ticker || qty <= 0 || price <= 0) return;

    const transaction = { id: `${ticker}-${tradeSide}-${Date.now()}`, ticker, side: tradeSide, qty, price };
    setTransactions((current) => [transaction, ...current].slice(0, 5));
    setPositions((current) => {
      const index = current.findIndex((item) => item.ticker === ticker);

      if (tradeSide === 'BUY') {
        if (index === -1) return [...current, buildPosition(ticker, qty, price)];

        return current.map((item, itemIndex) => itemIndex === index ? {
          ...item,
          qty: item.qty + qty,
          cost: item.cost + qty * price,
          marketValue: item.marketValue + qty * price,
        } : item);
      }

      if (index === -1) return current;

      return current.flatMap((item, itemIndex) => {
        if (itemIndex !== index) return [item];
        const remainingQty = Math.max(item.qty - qty, 0);
        if (remainingQty === 0) return [];
        const ratio = remainingQty / item.qty;
        return [{ ...item, qty: remainingQty, cost: item.cost * ratio, marketValue: item.marketValue * ratio }];
      });
    });
  }

  function removePosition(ticker: string) {
    setPositions((current) => current.filter((item) => item.ticker !== ticker));
  }

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
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={profile.user} onChange={(event) => setProfile({ ...profile, user: event.target.value })} />
              <select className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={profile.risk} onChange={(event) => setProfile({ ...profile, risk: event.target.value })}>
                <option>BALANCED</option>
                <option>CONSERVATIVE</option>
                <option>GROWTH</option>
              </select>
              <select className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={profile.horizon} onChange={(event) => setProfile({ ...profile, horizon: event.target.value })}>
                <option>SHORT TERM</option>
                <option>MEDIUM TERM</option>
                <option>LONG TERM</option>
              </select>
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={profile.preferences} onChange={(event) => setProfile({ ...profile, preferences: event.target.value })} />
            </div>
            <textarea className="mt-4 min-h-32 w-full border-4 border-ink p-4 text-sm leading-7" value={profile.notes} onChange={(event) => setProfile({ ...profile, notes: event.target.value })} />
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Button onClick={saveProfile}>保存画像</Button>
              {profileSaved ? (
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  已保存：{savedProfile.risk} / {savedProfile.horizon}
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="shadow-hard-pink">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">PORTFOLIO SIMULATOR</div>
            <h2 className="mt-3 font-display text-4xl font-black">持仓账本</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={tradeTicker} onChange={(event) => setTradeTicker(event.target.value)} />
              <select className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={tradeSide} onChange={(event) => setTradeSide(event.target.value)}><option>BUY</option><option>SELL</option></select>
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={tradeQty} onChange={(event) => setTradeQty(event.target.value)} />
              <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={tradePrice} onChange={(event) => setTradePrice(event.target.value)} />
            </div>
            <Button className="mt-4" onClick={addTransaction}>添加交易</Button>
            {transactions.length > 0 ? (
              <div className="mt-4 space-y-2">
                {transactions.map((item) => (
                  <div key={item.id} className="border-2 border-ink px-3 py-2 text-xs font-bold uppercase tracking-[0.16em]">
                    {item.side} {item.ticker} / {item.qty} @ {item.price.toFixed(2)}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Metric label="持仓数" value={String(normalizedPositions.length)} />
              <Metric label="投入成本" value={invested.toFixed(0)} />
              <Metric label="市值" value={totalValue.toFixed(0)} />
              <Metric label="浮盈亏" value={`${pnl.toFixed(0)} / ${invested ? formatPct((pnl / invested) * 100) : '0.00%'}`} />
            </div>
          </Card>
        </div>

        <Card className="shadow-hard-green">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">PORTFOLIO OVERVIEW</div>
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Metric label="最大持仓" value={maxPosition?.ticker || '-'} />
            <Metric label="最大权重" value={maxPosition ? `${maxPosition.weight.toFixed(2)}%` : '0.00%'} />
            <Metric label="30日收益" value={formatPct(weightedReturn)} />
            <Metric label="年化波动" value={`${weightedVol.toFixed(2)}%`} />
            <Metric label="最大回撤" value={`${Math.max(0, weightedVol * 0.36).toFixed(2)}%`} />
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
              <Metric label="有效持仓" value={effectiveHoldings ? (1 / effectiveHoldings).toFixed(2) : '0.00'} />
              <Metric label="画像匹配" value={profileMatch} />
              <Metric label="最大单仓" value={maxPosition ? `${maxPosition.weight.toFixed(2)}%` : '0.00%'} />
              <Metric label="30日收益" value={formatPct(weightedReturn)} />
              <Metric label="回撤" value={`${Math.max(0, weightedVol * 0.36).toFixed(2)}%`} />
            </div>
          </Card>
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <Card className="shadow-hard-pink">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">CONTRIBUTION ANALYSIS</div>
            <h2 className="mt-3 font-display text-4xl font-black">赢家与拖累项</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {sortedPositions.map((item) => (
                <PositionCard key={item.ticker} item={item} positive={item.pnl >= 0} onRemove={removePosition} />
              ))}
              {sortedPositions.length === 0 ? <div className="border-2 border-ink p-4 text-sm text-gray-500">暂无持仓。</div> : null}
            </div>
          </Card>
          <Card>
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">DETERMINISTIC RULES ONLY</div>
            <h2 className="mt-3 font-display text-4xl font-black">风险护栏</h2>
            <Guard severity={maxPosition && maxPosition.weight > 40 ? '高' : '低'} title="单一股票集中度" text={maxPosition ? `${maxPosition.ticker} 占组合 ${maxPosition.weight.toFixed(2)}%，${maxPosition.weight > 40 ? '高于' : '低于'}均衡型投资者 40% 的护栏阈值。` : '当前没有持仓可诊断。'} />
            <Guard severity={top3Weight > 75 ? '中' : '低'} title="前三持仓集中度" text={`前三大持仓占 ${top3Weight.toFixed(2)}%，${top3Weight > 75 ? '高于' : '低于'} 75% 的集中度阈值。`} />
            <Guard severity={profileMatch === '需复核' ? '中' : '低'} title="画像偏好匹配" text={`当前画像偏好为 ${savedProfile.preferences}，组合暴露需要与该偏好持续对齐。`} />
          </Card>
        </div>

        <Card className="shadow-hard-green">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">AI EXPLANATION LAYER</div>
          <h2 className="mt-3 font-display text-4xl font-black">组合摘要</h2>
          <p className="mt-6 border-2 border-ink p-5 text-sm leading-8">
            当前组合共有 {normalizedPositions.length} 只持仓，最大单一持仓为 {maxPosition?.ticker || '-'}，权重 {maxPosition ? maxPosition.weight.toFixed(2) : '0.00'}%。前三大持仓贡献 {top3Weight.toFixed(2)}% 的市值。当前诊断建议以研究复核为主，关注单一股票权重、行业偏离和回撤来源。本摘要不输出买卖指令。
          </p>
        </Card>

        <Card>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">OPEN POSITIONS</div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b-2 border-ink uppercase tracking-[0.2em]">
                <tr>
                  {['代码', '行业', '数量', '成本', '市值', '盈亏', '30日', '波动', '权重', '操作'].map((head) => <th key={head} className="px-4 py-3">{head}</th>)}
                </tr>
              </thead>
              <tbody>
                {normalizedPositions.map((item) => (
                  <tr key={item.ticker} className="border-b border-gray-200">
                    <td className="px-4 py-4 font-bold">{item.ticker}<div className="text-xs font-normal text-gray-500">{item.name}</div></td>
                    <td className="px-4 py-4">{item.sector}<div className="text-xs text-gray-500">{item.tags}</div></td>
                    <td className="px-4 py-4">{item.qty}</td>
                    <td className="px-4 py-4">{item.cost.toFixed(2)}</td>
                    <td className="px-4 py-4">{item.marketValue.toFixed(2)}</td>
                    <td className={`px-4 py-4 ${item.pnl >= 0 ? 'text-emerald-700' : 'text-punch'}`}>{item.pnl >= 0 ? '+' : ''}{item.pnl.toFixed(2)} ({item.pnlPct.toFixed(2)}%)</td>
                    <td className="px-4 py-4">{formatPct(item.return30d)}</td>
                    <td className="px-4 py-4">{item.vol.toFixed(2)}%</td>
                    <td className="px-4 py-4">{item.weight.toFixed(2)}%</td>
                    <td className="px-4 py-4">
                      <Button aria-label={`删除 ${item.ticker}`} title={`删除 ${item.ticker}`} className="min-h-9 px-3 py-2" onClick={() => removePosition(item.ticker)}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {normalizedPositions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={10}>暂无持仓。</td>
                  </tr>
                ) : null}
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
        {items.length === 0 ? <div className="border-2 border-ink p-4 text-sm text-gray-500">暂无暴露数据。</div> : null}
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

function PositionCard({ item, positive = false, onRemove }: { item: Position; positive?: boolean; onRemove: (ticker: string) => void }) {
  return (
    <div className="border-2 border-ink p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold">{item.ticker} / {item.name}</div>
          <div className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">WEIGHT {item.weight.toFixed(2)}% / MKT VALUE {item.marketValue.toFixed(2)}</div>
        </div>
        <Button aria-label={`删除 ${item.ticker}`} title={`删除 ${item.ticker}`} className="min-h-9 px-3 py-2" onClick={() => onRemove(item.ticker)}>
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <div className={positive ? 'mt-2 text-emerald-700' : 'mt-2 text-punch'}>Pnl {item.pnl >= 0 ? '+' : ''}{item.pnl.toFixed(2)} ({item.pnlPct.toFixed(2)}%)</div>
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
