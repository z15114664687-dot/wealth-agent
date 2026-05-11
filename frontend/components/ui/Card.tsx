import { cls } from '@/lib/utils';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cls(
        'relative isolate overflow-hidden rounded-md border-2 border-ink bg-white p-5 md:p-6',
        className
      )}
    >
      {children}
    </div>
  );
}
