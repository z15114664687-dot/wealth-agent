export function WatchlistTable({ items }: { items: Array<Record<string, string | number>> }) {
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
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={String(item.ticker)} className={index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
              <td className="px-4 py-3">{String(item.ticker)}</td>
              <td className="px-4 py-3">{String(item.company_name)}</td>
              <td className="px-4 py-3">{Number(item.last_price).toFixed(2)}</td>
              <td className="px-4 py-3">{Number(item.daily_move).toFixed(2)}%</td>
              <td className="px-4 py-3">{String(item.trend_status)}</td>
              <td className="px-4 py-3">{String(item.alert_status)}</td>
              <td className="px-4 py-3">{String(item.source)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
