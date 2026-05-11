import { AlertItem } from '@/lib/types';
import { Card } from '@/components/ui/Card';

export function AlertCard({ alert }: { alert: AlertItem }) {
  return (
    <Card className={alert.severity === 'high' ? 'shadow-hard-pink' : alert.severity === 'medium' ? 'shadow-hard-blue' : 'shadow-hard-green'}>
      <div className="text-xs font-bold uppercase tracking-[0.25em] text-gray-500">{alert.alert_type}</div>
      <div className="mt-2 font-display text-3xl font-black tracking-tighter">{alert.ticker} // {alert.company_name}</div>
      <p className="mt-4 text-sm leading-7 text-gray-700">{alert.message}</p>
      <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">{alert.timestamp}</div>
    </Card>
  );
}
