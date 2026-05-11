import { Card } from '@/components/ui/Card';
import { SignalItem } from '@/lib/types';

export function SignalCard({ signal }: { signal: SignalItem }) {
  return (
    <Card className="h-full min-h-40 shadow-none">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{signal.title}</div>
      <div className="mt-3 whitespace-nowrap font-display text-xl font-black tracking-tighter sm:text-2xl">{signal.value}</div>
      <p className="mt-3 text-sm leading-7 text-gray-700">{signal.interpretation}</p>
    </Card>
  );
}
