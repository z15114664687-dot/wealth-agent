export type RiskProfile = 'Conservative' | 'Balanced' | 'Growth';
export type InvestmentHorizon = 'Short Term' | 'Medium Term' | 'Long Term';

export interface StockSnapshot {
  ticker: string;
  company_name: string;
  data_source: string;
  last_price: number;
  return_30d: number;
  volatility_annualized: number;
  ma20: number;
  ma60: number;
}

export interface CompanyProfile {
  sector: string;
  style: string;
  description: string;
  tags: string[];
  valuation: Array<{ label: string; value: string }>;
  watchpoints: string[];
  dataNotes: string[];
}

export interface TechnicalStack {
  rsi14: number;
  macd: number;
  macd_signal: number;
  band_view: string;
  support: number;
  resistance: number;
}

export interface FinancialAnalysis {
  revenue_growth: string;
  gross_margin: string;
  net_margin: string;
  roe: string;
  operating_cashflow: string;
  leverage: string;
  summary: string;
}

export interface FundamentalAnalysis {
  business_quality: string;
  valuation_view: string;
  growth_driver: string;
  risk_watch: string;
  conclusion: string;
}

export interface FinancialStatementSnapshot {
  source: string;
  latest_report?: string | null;
  items: Record<string, string>;
}

export interface CompetitiveLandscape {
  position: string;
  moat: string;
  competitors: Array<{ name: string; ticker: string; angle: string; relative_position: string }>;
  summary: string;
}

export interface SignalItem {
  title: string;
  value: string;
  interpretation: string;
}

export interface AgentStatus {
  data_agent: string;
  analysis_agent: string;
  report_agent: string;
  personalization_agent: string;
}

export interface ResearchResponse {
  ticker: string;
  company_name: string;
  data_source: string;
  snapshot: StockSnapshot;
  signals: SignalItem[];
  report: string;
  agent_status: AgentStatus;
  price_history?: Array<{ date: string; close: number }>;
  company_profile?: CompanyProfile;
  technical_stack?: TechnicalStack;
  financial_analysis?: FinancialAnalysis;
  fundamental_analysis?: FundamentalAnalysis;
  financial_statement_snapshot?: FinancialStatementSnapshot;
  competitive_landscape?: CompetitiveLandscape;
}

export interface AlertItem {
  ticker: string;
  company_name: string;
  alert_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export type AiHotMode = 'selected' | 'all';
export type AiHotCategory = 'all' | 'ai-models' | 'ai-products' | 'industry' | 'paper' | 'tip';
export type AiHotFocus = 'all' | 'robotics' | 'autonomous' | 'bio-health' | 'enterprise';

export interface AiHotFocusTag {
  key: Exclude<AiHotFocus, 'all'>;
  label: string;
}

export interface AiHotNewsItem {
  id: string;
  title: string;
  title_en?: string | null;
  url: string;
  source: string;
  publishedAt?: string | null;
  summary: string;
  category?: string | null;
  categoryLabel: string;
  focus_tags: AiHotFocusTag[];
  isCoreIndustry: boolean;
}

export interface AiHotNewsSummary {
  total: number;
  coreIndustryTotal: number;
  focusCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  generatedAt: string;
}

export interface AiHotNewsResponse {
  count: number;
  hasNext: boolean;
  nextCursor?: string | null;
  items: AiHotNewsItem[];
  summary: AiHotNewsSummary;
  focusAreas: AiHotFocusTag[];
  source: string;
}
