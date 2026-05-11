'use client';

import { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { AlertCard } from '@/components/watchlist/AlertCard';
import { MonitoringStatus } from '@/components/watchlist/MonitoringStatus';
import { WatchlistTable } from '@/components/watchlist/WatchlistTable';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const initialWatchlist = [
  { ticker: '600519', company_name: '贵州茅台', last_price: 1407.24, daily_move: -3.8, trend_status: '混合', alert_status: '中', source: 'tushare' },
  { ticker: '300750', company_name: '宁德时代', last_price: 444.2, daily_move: -2.15, trend_status: '偏强', alert_status: '低', source: 'tushare' },
  { ticker: '000001', company_name: '平安银行', last_price: 11.01, daily_move: -0.72, trend_status: '混合', alert_status: '无', source: 'tushare' },
];

const alerts = [
  { ticker: '600519', company_name: '贵州茅台', alert_type: 'VOLATILITY_SPIKE', message: '短期波动率高于配置阈值，需要复核价格与成交量变化。', severity: 'medium' as const, timestamp: '2026-04-21 17:00:54' },
  { ticker: '300750', company_name: '宁德时代', alert_type: 'TREND_BREAK', message: '动量边际转弱，价格行为需要更密切跟踪。', severity: 'low' as const, timestamp: '2026-04-21 17:00:54' },
  { ticker: '300750', company_name: '宁德时代', alert_type: 'PRICE_ABOVE', message: '价格高于 440 观察阈值，进入恢复跟踪区间。', severity: 'high' as const, timestamp: '2026-04-21 17:00:54' },
];

const initialGoals = [
  { id: '300750-PRICE_ABOVE-440', ticker: '300750', type: 'PRICE_ABOVE', title: '监控突破阈值', threshold: 'THRESHOLD 440' },
  { id: '600519-PRICE_ABOVE-1700', ticker: '600519', type: 'PRICE_ABOVE', title: '监控突破持仓观察线', threshold: 'THRESHOLD 1700' },
  { id: '600276-TREND_BREAK-MA20', ticker: '600276', type: 'TREND_BREAK', title: '监控趋势转弱', threshold: 'MA20 BREAK' },
];

export default function WatchlistPage() {
  const [items, setItems] = useState(initialWatchlist);
  const [goals, setGoals] = useState(initialGoals);
  const [ticker, setTicker] = useState('300750');
  const [ruleType, setRuleType] = useState('PRICE_ABOVE');
  const [threshold, setThreshold] = useState('440');

  const visibleAlerts = useMemo(() => {
    const activeTickers = new Set(items.map((item) => item.ticker));
    return alerts.filter((alert) => activeTickers.has(alert.ticker));
  }, [items]);

  function addGoal() {
    const cleanTicker = ticker.trim().toUpperCase();
    const cleanThreshold = threshold.trim();

    if (!cleanTicker || !cleanThreshold) return;

    setGoals((current) => [
      {
        id: `${cleanTicker}-${ruleType}-${cleanThreshold}-${Date.now()}`,
        ticker: cleanTicker,
        type: ruleType,
        title: ruleType === 'PRICE_ABOVE' ? '监控突破阈值' : ruleType === 'TREND_BREAK' ? '监控趋势转弱' : '监控波动放大',
        threshold: ruleType === 'PRICE_ABOVE' ? `THRESHOLD ${cleanThreshold}` : cleanThreshold.toUpperCase(),
      },
      ...current,
    ]);

    setItems((current) => {
      if (current.some((item) => item.ticker === cleanTicker)) return current;

      return [
        ...current,
        {
          ticker: cleanTicker,
          company_name: '自定义标的',
          last_price: Number(cleanThreshold) || 0,
          daily_move: 0,
          trend_status: '待观察',
          alert_status: '新',
          source: 'manual',
        },
      ];
    });
  }

  function removeTicker(removedTicker: string) {
    setItems((current) => current.filter((item) => item.ticker !== removedTicker));
    setGoals((current) => current.filter((goal) => goal.ticker !== removedTicker));
  }

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-500">/// CONTINUOUS MONITORING</p>
          <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl">观察列表中台</h1>
        </div>
        <MonitoringStatus />
        <WatchlistTable items={items} onRemove={removeTicker} />
        <Card className="shadow-hard-pink">
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">GOAL SETTING</div>
          <h2 className="mt-3 font-display text-4xl font-black">告警规则</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto]">
            <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={ticker} onChange={(event) => setTicker(event.target.value)} />
            <select className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={ruleType} onChange={(event) => setRuleType(event.target.value)}>
              <option>PRICE_ABOVE</option>
              <option>TREND_BREAK</option>
              <option>VOLATILITY_SPIKE</option>
            </select>
            <input className="border-4 border-ink px-4 py-3 text-sm uppercase tracking-[0.18em]" value={threshold} onChange={(event) => setThreshold(event.target.value)} />
            <Button onClick={addGoal}>添加目标</Button>
          </div>
        </Card>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-hard-blue">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">PERSISTED GOALS</div>
            <div className="mt-5 space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-start justify-between gap-4 border-2 border-ink p-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{goal.ticker} / {goal.type}</div>
                    <div className="mt-2 text-sm font-bold">{goal.title}</div>
                    <div className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">{goal.threshold}</div>
                  </div>
                  <Button
                    aria-label={`删除 ${goal.ticker} 规则`}
                    title={`删除 ${goal.ticker} 规则`}
                    className="min-h-9 px-3 py-2"
                    onClick={() => setGoals((current) => current.filter((item) => item.id !== goal.id))}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
              {goals.length === 0 ? <div className="border-2 border-ink p-4 text-sm text-gray-500">暂无告警规则。</div> : null}
            </div>
          </Card>
          <Card className="shadow-hard-green">
            <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">RECENT ALERT HISTORY</div>
            <div className="mt-5 space-y-4">
              {visibleAlerts.map((alert) => (
                <div key={`${alert.ticker}-${alert.alert_type}`} className="border-2 border-ink p-4">
                  <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{alert.ticker} / {alert.alert_type} / {alert.severity}</div>
                  <p className="mt-2 text-sm leading-7">{alert.message}</p>
                </div>
              ))}
              {visibleAlerts.length === 0 ? <div className="border-2 border-ink p-4 text-sm text-gray-500">暂无告警记录。</div> : null}
            </div>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {visibleAlerts.map((alert) => <AlertCard key={`${alert.ticker}-${alert.alert_type}`} alert={alert} />)}
        </div>
      </div>
    </div>
  );
}
