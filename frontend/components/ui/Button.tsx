import { ButtonHTMLAttributes } from 'react';
import { cls } from '@/lib/utils';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cls(
        'min-h-11 rounded-md border-2 border-ink bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] transition hover:bg-ink hover:text-white disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
