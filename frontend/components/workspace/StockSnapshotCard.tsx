import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StockSnapshot } from '@/lib/types';
import { formatPct } from '@/lib/utils';

export function StockSnapshotCard({ snapshot }: { snapshot: StockSnapshot }) {
  return (
    <Card className="border-t-4 border-t-acid shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">标的快照</div>
          <h3 className="mt-2 break-words font-display text-3xl font-black leading-none tracking-tighter md:text-4xl">{snapshot.company_name}</h3>
          <div className="mt-3 text-sm uppercase tracking-[0.14em]">{snapshot.ticker}</div>
        </div>
        <Badge className="shrink-0">{snapshot.data_source}</Badge>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Metric title="最新价" value={snapshot.last_price.toFixed(2)} />
        <Metric title="30日收益" value={formatPct(snapshot.return_30d)} />
        <Metric title="MA20" value={snapshot.ma20.toFixed(2)} />
        <Metric title="MA60" value={snapshot.ma60.toFixed(2)} />
      </div>
    </Card>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border-2 border-ink bg-cloud p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">{title}</div>
      <div className="mt-2 break-words font-display text-2xl font-black leading-tight tabular-nums">{value}</div>
    </div>
  );
}
