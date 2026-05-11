import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function ReportPanel({ report }: { report: string }) {
  return (
    <Card className="border-t-4 border-t-punch shadow-none">
      <div className="flex items-center justify-between gap-4 border-b-2 border-ink pb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">生成式研究摘要</div>
          <h3 className="mt-2 font-display text-3xl font-black tracking-tighter md:text-4xl">研究报告</h3>
        </div>
        <Badge className="bg-acid">Gemini</Badge>
      </div>
      <div className="mt-6 whitespace-pre-wrap text-sm leading-8 text-gray-800">{report}</div>
    </Card>
  );
}
