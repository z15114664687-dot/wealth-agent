import { Card } from '@/components/ui/Card';

export function MonitoringStatus() {
  return (
    <Card>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">MARKET DATA</div>
          <div className="mt-2 font-display text-3xl font-black">Tushare</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">INTERFACE</div>
          <div className="mt-2 font-display text-3xl font-black">tushare</div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">COVERAGE</div>
          <div className="mt-2 font-display text-3xl font-black">11</div>
        </div>
      </div>
    </Card>
  );
}
