import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export function WatchlistTable({
  items,
  onRemove,
}: {
  items: Array<Record<string, string | number>>;
  onRemove?: (ticker: string) => void;
}) {
  return (
    <div className="overflow-x-auto border-4 border-ink bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b-4 border-ink bg-cloud uppercase tracking-[0.2em]">
          <tr>
            <th className="px-4 py-3">代码</th>
            <th className="px-4 py-3">名称</th>
            <th className="px-4 py-3">最新价</th>
            <th className="px-4 py-3">日涨跌</th>
            <th className="px-4 py-3">趋势</th>
            <th className="px-4 py-3">告警</th>
            <th className="px-4 py-3">来源</th>
            {onRemove ? <th className="px-4 py-3">操作</th> : null}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-4 py-8 text-center text-sm text-gray-500" colSpan={onRemove ? 8 : 7}>
                暂无观察标的。
              </td>
            </tr>
          ) : (
            items.map((item, index) => {
              const ticker = String(item.ticker);

              return (
                <tr key={ticker} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                  <td className="px-4 py-3">{ticker}</td>
                  <td className="px-4 py-3">{String(item.company_name)}</td>
                  <td className="px-4 py-3">{Number(item.last_price).toFixed(2)}</td>
                  <td className="px-4 py-3">{Number(item.daily_move).toFixed(2)}%</td>
                  <td className="px-4 py-3">{String(item.trend_status)}</td>
                  <td className="px-4 py-3">{String(item.alert_status)}</td>
                  <td className="px-4 py-3">{String(item.source)}</td>
                  {onRemove ? (
                    <td className="px-4 py-3">
                      <Button
                        aria-label={`删除 ${ticker}`}
                        title={`删除 ${ticker}`}
                        className="min-h-9 px-3 py-2"
                        onClick={() => onRemove(ticker)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </td>
                  ) : null}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
