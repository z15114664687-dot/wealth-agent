import { Card } from '@/components/ui/Card';
import { AgentStatus } from '@/lib/types';

const labels: Array<keyof AgentStatus> = [
  'data_agent',
  'analysis_agent',
  'report_agent',
  'personalization_agent',
];

const labelMap: Record<keyof AgentStatus, string> = {
  data_agent: '数据代理',
  analysis_agent: '分析代理',
  report_agent: '报告代理',
  personalization_agent: '个性化代理',
};

export function AgentStatusRail({ status }: { status: AgentStatus }) {
  return (
    <div className="relative z-30">
      <Card className="relative z-30 border-t-4 border-t-acid bg-white shadow-none">
        <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
          Agent 状态
        </div>

        <div className="mt-5 space-y-3">
          {labels.map((label, idx) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-white font-display text-lg font-black">
                {idx + 1}
              </div>

              <div className="flex-1 rounded-md border-2 border-ink bg-cloud px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                  {labelMap[label]}
                </div>
                <div className="mt-1 break-words text-sm font-bold uppercase tracking-[0.1em]">
                  {status[label]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
