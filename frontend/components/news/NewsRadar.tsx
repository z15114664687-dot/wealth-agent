'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bot,
  Building2,
  Car,
  ChevronDown,
  Download,
  Dna,
  ExternalLink,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { downloadAiHotSummary, getAiHotNews, summarizeAiHotNews } from '@/lib/api';
import {
  AiHotCategory,
  AiHotFocus,
  AiHotMode,
  AiHotNewsItem,
  AiHotNewsResponse,
} from '@/lib/types';
import { cls } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const categories: Array<{ key: AiHotCategory; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'ai-models', label: '模型' },
  { key: 'ai-products', label: '产品' },
  { key: 'industry', label: '行业' },
  { key: 'paper', label: '论文' },
  { key: 'tip', label: '观点' },
];

const focuses: Array<{ key: AiHotFocus; label: string; icon: LucideIcon }> = [
  { key: 'all', label: '全部重点', icon: Sparkles },
  { key: 'robotics', label: '机器人', icon: Bot },
  { key: 'autonomous', label: '自动驾驶', icon: Car },
  { key: 'bio-health', label: '生物医疗', icon: Dna },
  { key: 'enterprise', label: 'B端智能化', icon: Building2 },
];

const categoryOrder = ['模型发布/更新', '产品发布/更新', '行业动态', '论文研究', '技巧与观点', '未分类'];

export function NewsRadar() {
  const [mode, setMode] = useState<AiHotMode>('selected');
  const [category, setCategory] = useState<AiHotCategory>('all');
  const [focus, setFocus] = useState<AiHotFocus>('all');
  const [days, setDays] = useState(7);
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [items, setItems] = useState<AiHotNewsItem[]>([]);
  const [summary, setSummary] = useState<AiHotNewsResponse['summary'] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryDownloading, setSummaryDownloading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [summaryModel, setSummaryModel] = useState('');
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [error, setError] = useState('');
  const [summaryError, setSummaryError] = useState('');

  const loadNews = useCallback(
    async (cursor?: string | null, append = false) => {
      setError('');
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await getAiHotNews({
          mode,
          category,
          focus,
          days,
          take: 50,
          cursor,
          q: activeQuery,
        });
        setItems((current) => (append ? [...current, ...data.items] : data.items));
        setSummary(data.summary);
        setNextCursor(data.nextCursor || null);
        setHasNext(data.hasNext);
      } catch {
        setError('资讯暂时加载失败，请稍后重试。');
        if (!append) {
          setItems([]);
          setSummary(null);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeQuery, category, days, focus, mode],
  );

  useEffect(() => {
    loadNews(null, false);
  }, [loadNews]);

  const groupedItems = useMemo(() => {
    const groups = items.reduce<Record<string, AiHotNewsItem[]>>((acc, item) => {
      const label = item.categoryLabel || '未分类';
      acc[label] = acc[label] || [];
      acc[label].push(item);
      return acc;
    }, {});

    return Object.entries(groups).sort(
      ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
    );
  }, [items]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveQuery(query.trim());
  };

  const summaryPayload = () => ({
    items: items.slice(0, 40),
    context: {
      mode,
      category,
      focus,
      days,
      query: activeQuery,
    },
  });

  const generateSummary = async () => {
    if (!items.length) {
      setSummaryError('当前没有可总结的资讯。');
      return;
    }
    setSummaryError('');
    setSummaryLoading(true);
    setSummaryOpen(true);
    try {
      const data = await summarizeAiHotNews(summaryPayload());
      setAiSummary(data.summary);
      setSummaryModel(data.model);
    } catch {
      setSummaryError('AI 总结生成失败，请稍后重试。');
    } finally {
      setSummaryLoading(false);
    }
  };

  const downloadSummary = async () => {
    if (!items.length) {
      setSummaryError('当前没有可下载的总结内容。');
      return;
    }
    setSummaryError('');
    setSummaryDownloading(true);
    try {
      const blob = await downloadAiHotSummary({ ...summaryPayload(), summary: aiSummary || undefined });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ai-news-summary.docx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setSummaryError('Word 文件下载失败，请稍后重试。');
    } finally {
      setSummaryDownloading(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="当前命中" value={String(summary?.total ?? items.length)} />
        <Metric label="重点赛道" value={String(summary?.coreIndustryTotal ?? 0)} />
        <Metric label="时间窗口" value={`近 ${days} 天`} />
        <Metric label="来源" value="AI HOT" />
      </div>

      <Card className="shadow-hard-blue">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
                LIVE INTELLIGENCE FILTER
              </div>
              <h2 className="mt-2 font-display text-3xl font-black tracking-normal">
                信息流筛选
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setMode('selected')}
                className={cls(mode === 'selected' && '!bg-ink !text-white')}
              >
                精选
              </Button>
              <Button
                type="button"
                onClick={() => setMode('all')}
                className={cls(mode === 'all' && '!bg-ink !text-white')}
              >
                全部
              </Button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_auto]">
            <form onSubmit={onSubmit} className="flex min-w-0 gap-3">
              <label className="sr-only" htmlFor="news-search">搜索关键词</label>
              <input
                id="news-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-11 min-w-0 flex-1 rounded-md border-2 border-ink px-4 text-sm outline-none focus:ring-4 focus:ring-acid"
                placeholder="搜索公司、技术或主题"
              />
              <Button type="submit" className="inline-flex items-center gap-2">
                <Search size={16} aria-hidden="true" />
                搜索
              </Button>
            </form>

            <div className="grid grid-cols-3 gap-3">
              <label className="sr-only" htmlFor="news-days">时间窗口</label>
              <select
                id="news-days"
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="min-h-11 rounded-md border-2 border-ink bg-white px-3 text-sm font-bold"
              >
                <option value={1}>近 24 小时</option>
                <option value={3}>近 3 天</option>
                <option value={7}>近 7 天</option>
              </select>
              <Button
                type="button"
                onClick={() => loadNews(null, false)}
                className="inline-flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} aria-hidden="true" />
                刷新
              </Button>
              <Button
                type="button"
                disabled={summaryLoading || !items.length}
                onClick={generateSummary}
                className="inline-flex items-center justify-center gap-2"
              >
                {summaryLoading ? (
                  <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles size={16} aria-hidden="true" />
                )}
                AI总结
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setCategory(item.key)}
                className={cls(
                  'min-h-11 rounded-md border-2 border-ink px-4 text-sm font-bold transition hover:bg-ink hover:text-white focus:outline-none focus:ring-4 focus:ring-acid',
                  category === item.key ? 'bg-ink text-white' : 'bg-white',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {focuses.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setFocus(item.key)}
                  className={cls(
                    'min-h-14 rounded-md border-2 border-ink px-3 text-left text-sm font-bold transition hover:bg-cloud focus:outline-none focus:ring-4 focus:ring-acid',
                    focus === item.key && 'bg-acid',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {(aiSummary || summaryLoading || summaryError) && (
            <div className="rounded-md border-2 border-ink bg-cloud">
              <button
                type="button"
                onClick={() => setSummaryOpen((value) => !value)}
                className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left font-bold focus:outline-none focus:ring-4 focus:ring-acid"
                aria-expanded={summaryOpen}
              >
                <span className="flex items-center gap-2">
                  <Sparkles size={18} aria-hidden="true" />
                  AI 总结
                  {summaryModel && (
                    <span className="text-xs uppercase tracking-[0.14em] text-gray-500">
                      {summaryModel}
                    </span>
                  )}
                </span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={cls('transition', summaryOpen && 'rotate-180')}
                />
              </button>
              {summaryOpen && (
                <div className="border-t-2 border-ink bg-white p-4 md:p-5">
                  {summaryLoading ? (
                    <p className="text-sm font-bold leading-7 text-gray-700">正在生成总结...</p>
                  ) : summaryError ? (
                    <p className="text-sm font-bold leading-7 text-punch">{summaryError}</p>
                  ) : (
                    <>
                      <div className="whitespace-pre-line text-sm leading-8 text-gray-800">
                        {aiSummary}
                      </div>
                      <Button
                        type="button"
                        disabled={summaryDownloading}
                        onClick={downloadSummary}
                        className="mt-5 inline-flex items-center gap-2"
                      >
                        {summaryDownloading ? (
                          <RefreshCw size={16} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <Download size={16} aria-hidden="true" />
                        )}
                        下载 Word
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {error && (
        <div className="rounded-md border-2 border-punch bg-white p-4 text-sm font-bold text-punch">
          {error}
        </div>
      )}

      {loading ? (
        <LoadingList />
      ) : groupedItems.length ? (
        <div className="space-y-6">
          {groupedItems.map(([label, group]) => (
            <section key={label} className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink pb-2">
                <h3 className="font-display text-2xl font-black tracking-normal">{label}</h3>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                  {group.length} ITEMS
                </span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {group.map((item) => (
                  <NewsCard key={item.id || item.url} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card className="shadow-hard-pink">
          <Newspaper size={32} aria-hidden="true" />
          <h3 className="mt-4 font-display text-3xl font-black tracking-normal">没有匹配资讯</h3>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            可以放宽时间窗口、切回精选全部，或换一个关键词重新搜索。
          </p>
        </Card>
      )}

      {hasNext && (
        <div className="flex justify-center">
          <Button
            type="button"
            disabled={loadingMore}
            onClick={() => loadNews(nextCursor, true)}
            className="inline-flex items-center gap-2"
          >
            {loadingMore && <RefreshCw size={16} className="animate-spin" aria-hidden="true" />}
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-28 rounded-md border-2 border-ink bg-white p-4 shadow-hard-green">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">{label}</div>
      <div className="mt-3 break-words font-display text-3xl font-black tracking-normal">{value}</div>
    </div>
  );
}

function NewsCard({ item }: { item: AiHotNewsItem }) {
  return (
    <article className="flex min-h-64 flex-col rounded-md border-2 border-ink bg-white p-5 transition hover:-translate-y-1 hover:shadow-hard-blue">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap gap-2">
          <span className="rounded-md border-2 border-ink bg-cloud px-2 py-1 text-xs font-bold">
            {item.source}
          </span>
          {item.focus_tags.map((tag) => (
            <span key={tag.key} className="rounded-md border-2 border-ink bg-acid px-2 py-1 text-xs font-bold">
              {tag.label}
            </span>
          ))}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md border-2 border-ink px-2 py-1 text-xs font-bold transition hover:bg-ink hover:text-white focus:outline-none focus:ring-4 focus:ring-acid"
          aria-label={`查看原文：${item.title}`}
        >
          原文
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>
      <h4 className="mt-4 font-display text-2xl font-black leading-tight tracking-normal">
        {item.title}
      </h4>
      <div className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
        {formatPublishedAt(item.publishedAt)}
      </div>
      {item.summary && (
        <p className="mt-4 flex-1 text-sm leading-7 text-gray-700">{item.summary}</p>
      )}
    </article>
  );
}

function LoadingList() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="min-h-72 animate-pulse rounded-md border-2 border-ink bg-white p-5">
          <div className="h-7 w-28 bg-cloud" />
          <div className="mt-5 h-9 w-4/5 bg-cloud" />
          <div className="mt-4 h-4 w-1/3 bg-cloud" />
          <div className="mt-6 space-y-3">
            <div className="h-4 bg-cloud" />
            <div className="h-4 bg-cloud" />
            <div className="h-4 w-2/3 bg-cloud" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatPublishedAt(value?: string | null) {
  if (!value) return '发布时间未知';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '发布时间未知';

  const now = Date.now();
  const diffMs = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs >= 0 && diffMs < hour) {
    return `${Math.max(1, Math.floor(diffMs / minute))} 分钟前`;
  }
  if (diffMs >= 0 && diffMs < day) {
    return `${Math.floor(diffMs / hour)} 小时前`;
  }

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
