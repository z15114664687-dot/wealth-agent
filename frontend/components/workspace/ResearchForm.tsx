'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { InvestmentHorizon, RiskProfile } from '@/lib/types';

const riskLabels: Record<RiskProfile, string> = {
  Conservative: '稳健型',
  Balanced: '均衡型',
  Growth: '成长型',
};

const horizonLabels: Record<InvestmentHorizon, string> = {
  'Short Term': '短期',
  'Medium Term': '中期',
  'Long Term': '长期',
};

export function ResearchForm({
  onSubmit,
  loading,
}: {
  onSubmit: (ticker: string, risk: RiskProfile, horizon: InvestmentHorizon) => void;
  loading: boolean;
}) {
  const [ticker, setTicker] = useState('600519');
  const [risk, setRisk] = useState<RiskProfile>('Balanced');
  const [horizon, setHorizon] = useState<InvestmentHorizon>('Medium Term');

  return (
    <Card className="border-t-4 border-t-electric shadow-none">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">研究参数</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tighter">生成研究报告</h2>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em]">股票代码</label>
          <Input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="600519" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em]">风险偏好</label>
            <select value={risk} onChange={(e) => setRisk(e.target.value as RiskProfile)} className="min-h-11 w-full rounded-md border-2 border-ink bg-white px-4 py-3 text-sm uppercase tracking-[0.12em] outline-none focus:ring-2 focus:ring-electric">
              {Object.entries(riskLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.16em]">投资期限</label>
            <select value={horizon} onChange={(e) => setHorizon(e.target.value as InvestmentHorizon)} className="min-h-11 w-full rounded-md border-2 border-ink bg-white px-4 py-3 text-sm uppercase tracking-[0.12em] outline-none focus:ring-2 focus:ring-electric">
              {Object.entries(horizonLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <Button onClick={() => onSubmit(ticker.trim(), risk, horizon)} disabled={loading} className="w-full !bg-ink !text-white hover:!bg-electric">
          {loading ? '生成中...' : '生成报告'}
        </Button>
      </div>
    </Card>
  );
}
