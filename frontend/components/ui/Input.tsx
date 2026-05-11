import { InputHTMLAttributes } from 'react';
import { cls } from '@/lib/utils';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cls(
        'min-h-11 w-full rounded-md border-2 border-ink bg-white px-4 py-3 text-sm uppercase tracking-[0.12em] outline-none focus:ring-2 focus:ring-electric',
        className,
      )}
      {...props}
    />
  );
}
