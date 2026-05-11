import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function MemoPanel({ memo }: { memo: string }) {
  return (
    <Card className="shadow-hard-pink">
      <div className="flex items-center justify-between gap-4 border-b-4 border-ink pb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">Generated research</div>
          <h3 className="mt-2 font-display text-4xl font-black tracking-tighter">MEMO PANEL</h3>
        </div>
        <Badge className="bg-acid">Gemini</Badge>
      </div>
      <div className="mt-6 whitespace-pre-wrap text-sm leading-8 text-gray-800">{memo}</div>
    </Card>
  );
}
