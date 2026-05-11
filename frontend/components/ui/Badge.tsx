import { cls } from '@/lib/utils';

export function Badge({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={cls('inline-block border-2 border-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em]', className)}>{children}</span>;
}
