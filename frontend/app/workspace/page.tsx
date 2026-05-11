'use client';

import { useState } from 'react';
import { ResearchForm } from '@/components/workspace/ResearchForm';
import { StockSnapshotCard } from '@/components/workspace/StockSnapshotCard';
import { SignalCard } from '@/components/workspace/SignalCard';
import { ReportPanel } from '@/components/workspace/ReportPanel';
import { AgentStatusRail } from '@/components/workspace/AgentStatusRail';
import { PriceChart } from '@/components/workspace/PriceChart';
import { generateResearch } from '@/lib/api';
import { CompetitiveLandscape, InvestmentHorizon, ResearchResponse, RiskProfile } from '@/lib/types';
import {
  getCompanyProfile,
  getCompetitiveLandscape,
  getFinancialAnalysis,
  getFundamentalAnalysis,
  getTechnicalStack,
} from '@/lib/demoData';

const starter: ResearchResponse = {
  ticker: '600519',
  company_name: '贵州茅台',
  data_source: 'demo',
  snapshot: {
    ticker: '600519',
    company_name: '贵州茅台',
    data_source: 'demo',
    last_price: 1688.5,
    return_30d: 3.2,
    volatility_annualized: 21.4,
    ma20: 1662.1,
    ma60: 1598.7,
  },
  signals: [
    { title: '趋势', value: '高于 MA20', interpretation: '短期价格结构仍偏建设性。' },
    { title: '中期位置', value: '高于 MA60', interpretation: '股价仍与中期趋势保持一致。' },
    { title: '30日收益', value: '+3.20%', interpretation: '近期表现为正。' },
    { title: '波动率', value: '中等', interpretation: '波动存在但尚未失序。' },
  ],
  report: '【WealthAgent AI 股票研究摘要】\n\n贵州茅台是 A 股高端白酒龙头，核心优势来自品牌稀缺性、渠道议价权和强现金流。当前研究视角下，系统会把行情信号、公司画像、财务质量、基本面驱动和竞争格局合并为一份面向投资者的结构化报告。\n\n本报告仅用于研究和教学展示，不构成投资建议。',
  agent_status: {
    data_agent: 'completed',
    analysis_agent: 'completed',
    report_agent: 'completed',
    personalization_agent: 'completed',
  },
  price_history: Array.from({ length: 60 }).map((_, i) => ({
    date: `2026-01-${String((i % 30) + 1).padStart(2, '0')}`,
    close: 1600 + i * 1.5 + Math.sin(i / 4) * 20,
  })),
  company_profile: getCompanyProfile('600519'),
  technical_stack: getTechnicalStack('600519'),
  financial_analysis: getFinancialAnalysis('600519'),
  fundamental_analysis: getFundamentalAnalysis('600519'),
  competitive_landscape: getCompetitiveLandscape('600519'),
};

function enrichResearch(data: ResearchResponse): ResearchResponse {
  return {
    ...data,
    company_profile: data.company_profile || getCompanyProfile(data.ticker),
    technical_stack: data.technical_stack || getTechnicalStack(data.ticker),
    financial_analysis: data.financial_analysis || getFinancialAnalysis(data.ticker),
    fundamental_analysis: data.fundamental_analysis || getFundamentalAnalysis(data.ticker),
    competitive_landscape: normalizeCompetitiveLandscape(data),
  };
}

function normalizeCompetitiveLandscape(data: ResearchResponse): CompetitiveLandscape {
  const fallback = getCompetitiveLandscape(data.ticker);
  const landscape = data.competitive_landscape || fallback;
  const competitors = Array.isArray(landscape.competitors)
    ? landscape.competitors.filter((item) => item && (item.name || item.relative_position))
    : [];

  return {
    position: landscape.position || fallback.position,
    moat: landscape.moat || fallback.moat,
    competitors: competitors.length > 0 ? competitors.map((item) => ({
      name: item.name || '可比公司待验证',
      ticker: item.ticker || '-',
      angle: item.angle || '同业比较',
      relative_position: item.relative_position || '相对位置需要结合研报和公开资料继续验证。',
    })) : fallback.competitors,
    summary: landscape.summary || fallback.summary,
    source: landscape.source || fallback.source || 'frontend-fallback',
  };
}

export default function WorkspacePage() {
  const [data, setData] = useState<ResearchResponse>(enrichResearch(starter));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horizon, setHorizon] = useState<InvestmentHorizon>('Medium Term');

  async function handleSubmit(ticker: string, risk: RiskProfile, selectedHorizon: InvestmentHorizon) {
    setLoading(true);
    setError(null);
    setHorizon(selectedHorizon);
    try {
      const result = await generateResearch({ ticker, risk_profile: risk });
      setData(enrichResearch(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 bg-white px-4 py-8 md:px-6 md:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="relative z-10 grid gap-5 border-b-2 border-ink pb-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Workspace</p>
            <h1 className="font-display text-4xl font-black tracking-tighter md:text-6xl">
              研究工作台
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-700">
              先生成报告结论，再沿财务分析、基本面分析和竞争格局三条主线下钻；运行状态和技术信号放在辅助区，避免抢占主阅读路径。
            </p>
          </div>
          <div className="grid gap-3 text-xs font-bold uppercase tracking-[0.12em] sm:grid-cols-3 lg:w-[520px]">
            <StatusChip label="数据源" value={data.data_source} />
            <StatusChip label="期限" value={horizon === 'Medium Term' ? '中期' : horizon === 'Short Term' ? '短期' : '长期'} />
            <StatusChip label="引擎" value="Gemini" />
          </div>
        </div>

        {error ? (
          <div className="relative z-20 border-4 border-punch bg-white p-4 text-sm uppercase tracking-[0.18em]">
            {error}
          </div>
        ) : null}

        <section className="relative z-10 grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <ResearchForm onSubmit={handleSubmit} loading={loading} />
            <StockSnapshotCard snapshot={data.snapshot} />
          </div>

          <div className="relative z-20 min-w-0">
            <ReportPanel report={data.report} />
          </div>

          <aside className="space-y-6">
            <WorkflowOps source={data.data_source} horizon={horizon} />
            <AgentStatusRail status={data.agent_status} />
          </aside>
        </section>

        <section className="space-y-6">
          <div className="grid items-stretch gap-6 xl:grid-cols-3">
            <FinancialPanel data={data} />
            <FundamentalPanel data={data} />
            <CompanyProfilePanel data={data} />
          </div>

          <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <CompetitionPanel data={data} />
            <TechnicalPanel data={data} />
          </div>

          <div className="grid items-stretch gap-6 lg:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)]">
            <PriceChart history={data.price_history || []} compact />
            <div className="grid gap-6 sm:grid-cols-2 sm:grid-rows-2">
              {data.signals.slice(0, 4).map((signal) => (
                <SignalCard key={signal.title} signal={signal} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function CompanyProfilePanel({ data }: { data: ResearchResponse }) {
  const profile = data.company_profile!;
  return (
    <Panel eyebrow="RESEARCH CONTEXT" title="公司画像" shadow="shadow-hard-blue">
      <div className="flex flex-wrap gap-2">
        <Tag>{profile.sector}</Tag>
        <Tag>{profile.style}</Tag>
      </div>
      <p className="mt-5 text-sm leading-7 text-gray-800">{profile.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {profile.tags.map((tag) => <Tag key={tag} accent>{tag}</Tag>)}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {profile.valuation.map((item) => <MetricBox key={item.label} label={item.label} value={item.value} />)}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
        <ListBox title="关键观察点" items={profile.watchpoints} />
        <ListBox title="数据说明" items={profile.dataNotes} />
      </div>
    </Panel>
  );
}

function FinancialPanel({ data }: { data: ResearchResponse }) {
  const financial = data.financial_analysis!;
  return (
    <Panel eyebrow="FINANCIAL ANALYSIS" title="财务分析" shadow="shadow-hard-green">
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
        <MetricBox label="收入增长" value={financial.revenue_growth} />
        <MetricBox label="毛利率" value={financial.gross_margin} />
        <MetricBox label="净利率" value={financial.net_margin} />
        <MetricBox label="ROE" value={financial.roe} />
        <MetricBox label="经营现金流" value={financial.operating_cashflow} />
        <MetricBox label="杠杆水平" value={financial.leverage} />
      </div>
      <p className="mt-5 rounded-md border-2 border-ink bg-cloud p-4 text-sm leading-8">{financial.summary}</p>
    </Panel>
  );
}

function FundamentalPanel({ data }: { data: ResearchResponse }) {
  const fundamental = data.fundamental_analysis!;
  return (
    <Panel eyebrow="FUNDAMENTAL LAYER" title="基本面分析" shadow="shadow-hard-pink">
      <div className="grid gap-4">
        <TextBlock title="业务质量" text={fundamental.business_quality} />
        <TextBlock title="估值观察" text={fundamental.valuation_view} />
        <TextBlock title="增长驱动" text={fundamental.growth_driver} />
        <TextBlock title="风险跟踪" text={fundamental.risk_watch} />
        <TextBlock title="结论" text={fundamental.conclusion} />
      </div>
    </Panel>
  );
}

function CompetitionPanel({ data }: { data: ResearchResponse }) {
  const landscape = data.competitive_landscape!;
  const sourceLabel = landscape.source === 'gemini-research-completion'
    ? 'Gemini 补全'
    : landscape.source === 'fallback'
      ? '后端兜底'
      : '本地模板';
  return (
    <Panel eyebrow="COMPETITIVE LANDSCAPE" title="竞争格局" shadow="shadow-hard-blue">
      <div className="mb-5 inline-flex rounded-md border-2 border-ink bg-acid px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">
        {sourceLabel}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TextBlock title="行业位置" text={landscape.position} />
        <TextBlock title="护城河" text={landscape.moat} />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {landscape.competitors.map((item) => (
          <div key={`${item.ticker}-${item.name}`} className="rounded-md border-2 border-ink bg-white p-4">
            <div className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{item.ticker} / {item.angle}</div>
            <div className="mt-2 font-display text-xl font-black">{item.name}</div>
            <p className="mt-2 text-sm leading-7">{item.relative_position}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 rounded-md border-2 border-ink bg-cloud p-4 text-sm leading-8">{landscape.summary}</p>
    </Panel>
  );
}

function TechnicalPanel({ data }: { data: ResearchResponse }) {
  const tech = data.technical_stack!;
  return (
    <Panel eyebrow="TECHNICAL LAYER" title="技术信号栈" shadow="shadow-hard-green">
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricBox label="RSI14" value={tech.rsi14.toFixed(2)} />
        <MetricBox label="MACD" value={tech.macd.toFixed(4)} />
        <MetricBox label="MACD SIGNAL" value={tech.macd_signal.toFixed(4)} />
        <MetricBox label="布林带视图" value={tech.band_view} />
        <MetricBox label="支撑位" value={tech.support.toFixed(2)} />
        <MetricBox label="阻力位" value={tech.resistance.toFixed(2)} />
      </div>
    </Panel>
  );
}

function WorkflowOps({ source, horizon }: { source: string; horizon: InvestmentHorizon }) {
  const steps = [
    ['规划', `为当前股票准备 ${horizon === 'Medium Term' ? '中期' : horizon === 'Short Term' ? '短期' : '长期'} 研究工作流。`, '0 ms'],
    ['缓存查询', '未命中缓存，继续完整多阶段流程。', '2 ms'],
    ['数据采集', `加载公司画像和价格历史，数据源：${source}。`, '7 ms'],
    ['分析计算', '计算趋势、波动率、财务框架、基本面和竞争格局。', '9 ms'],
    ['报告生成', '通过配置语言模型生成研究草稿。', '17292 ms'],
    ['反思护栏', '合规护栏通过：研究用途，不输出交易指令。', '0 ms'],
  ];
  return (
    <Panel eyebrow="RUNTIME TELEMETRY" title="工作流遥测" shadow="shadow-hard-blue" compact>
      <div className="mb-5 grid gap-3">
        <MetricBox label="延迟" value="17351 ms" />
        <MetricBox label="缓存" value="MISS" />
        <MetricBox label="成本" value="$0.0025" />
      </div>
      <div className="space-y-3">
        {steps.map(([title, text, ms]) => (
          <div key={title} className="rounded-md border-2 border-ink bg-white p-3">
            <div className="flex items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
              <span>{title}</span>
              <span>COMPLETED / {ms}</span>
            </div>
            <p className="mt-2 text-sm leading-6">{text}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function StatusChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border-2 border-ink bg-cloud px-3 py-2">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div className="mt-1 truncate text-sm text-ink">{value}</div>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  shadow,
  compact = false,
  children,
}: {
  eyebrow: string;
  title: string;
  shadow?: string;
  compact?: boolean;
  children: React.ReactNode;
}) {
  const accent = shadow === 'shadow-hard-pink'
    ? 'border-t-punch'
    : shadow === 'shadow-hard-green'
      ? 'border-t-acid'
      : 'border-t-electric';

  return (
    <div className={`h-full rounded-md border-2 border-t-4 border-ink bg-white p-5 shadow-none md:p-6 ${accent}`}>
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-500">{eyebrow}</div>
      <h2 className={`mt-2 font-display font-black tracking-tighter ${compact ? 'text-2xl' : 'text-3xl'}`}>{title}</h2>
      <div className={compact ? 'mt-5' : 'mt-6'}>{children}</div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-20 rounded-md border-2 border-ink bg-cloud p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">{label}</div>
      <div className="mt-2 break-words font-display text-2xl font-black leading-tight tabular-nums">{value}</div>
    </div>
  );
}

function Tag({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`rounded-md border-2 border-ink px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] ${accent ? 'bg-acid' : 'bg-white'}`}>
      {children}
    </span>
  );
}

function ListBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-gray-500">{title}</div>
      <div className="space-y-3">
        {items.map((item) => <div key={item} className="rounded-md border-2 border-ink bg-white p-4 text-sm leading-7">{item}</div>)}
      </div>
    </div>
  );
}

function TextBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border-2 border-ink bg-cloud p-4">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{title}</div>
      <p className="mt-2 text-sm leading-8">{text}</p>
    </div>
  );
}
