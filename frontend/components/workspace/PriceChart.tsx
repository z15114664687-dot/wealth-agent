'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';

export function PriceChart({
  history,
  compact = false,
}: {
  history: Array<{ date: string; close: number }>;
  compact?: boolean;
}) {
  return (
    <Card className="h-full border-t-4 border-t-electric shadow-none">
      <div className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gray-500">价格走势</div>
      <div className={`${compact ? 'h-80' : 'h-72'} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history}>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
            <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
            <Tooltip />
            <Area type="monotone" dataKey="close" stroke="#0033FF" fill="#CCFF00" fillOpacity={0.35} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
