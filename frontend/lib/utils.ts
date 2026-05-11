export function cls(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(' ');
}

export function formatPct(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}
