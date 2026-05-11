import {
  AiHotCategory,
  AiHotFocus,
  AiHotMode,
  AiHotNewsResponse,
  ResearchResponse,
  RiskProfile,
  AlertItem,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export async function generateResearch(payload: { ticker: string; risk_profile: RiskProfile }): Promise<ResearchResponse> {
  const res = await fetch(`${API_BASE}/api/research/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to generate report.');
  return res.json();
}

export async function getAlerts(tickers: string[]): Promise<{ alerts: AlertItem[] }> {
  const res = await fetch(`${API_BASE}/api/watchlist/alerts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickers }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load alerts.');
  return res.json();
}

export async function getWatchlist(tickers: string[]) {
  const res = await fetch(`${API_BASE}/api/watchlist/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tickers }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load watchlist.');
  return res.json();
}

export async function getAiHotNews(params: {
  mode?: AiHotMode;
  category?: AiHotCategory;
  focus?: AiHotFocus;
  days?: number;
  take?: number;
  cursor?: string | null;
  q?: string;
}): Promise<AiHotNewsResponse> {
  const search = new URLSearchParams();
  search.set('mode', params.mode || 'selected');
  search.set('category', params.category || 'all');
  search.set('focus', params.focus || 'all');
  search.set('days', String(params.days || 7));
  search.set('take', String(params.take || 50));
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.q?.trim()) search.set('q', params.q.trim());

  const res = await fetch(`${API_BASE}/api/news/aihot?${search.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to load AI news.');
  return res.json();
}

export async function summarizeAiHotNews(payload: {
  items: unknown[];
  context: Record<string, unknown>;
}): Promise<{ summary: string; model: string }> {
  const res = await fetch(`${API_BASE}/api/news/aihot/summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to summarize AI news.');
  return res.json();
}

export async function downloadAiHotSummary(payload: {
  items: unknown[];
  context: Record<string, unknown>;
  summary?: string;
}): Promise<Blob> {
  const res = await fetch(`${API_BASE}/api/news/aihot/summary.docx`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to download AI news summary.');
  return res.blob();
}
