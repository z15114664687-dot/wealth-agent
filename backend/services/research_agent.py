import numpy as np
from services.data_provider import ChinaMarketDataProvider
from services.gemini_report_client import GeminiReportClient
from services.personalization import get_profile_guidance

class ResearchAgentOrchestrator:
    def __init__(self):
        self.provider = ChinaMarketDataProvider()
        self.report_client = GeminiReportClient()

    def run(self, ticker: str, risk_profile: str):
        df = self.provider.get_stock_history(ticker)
        company_name = self.provider.get_company_name(ticker)
        close = df['close'].astype(float)
        last_price = float(close.iloc[-1])
        ma20 = float(close.tail(20).mean())
        ma60 = float(close.tail(60).mean())
        return_30d = float((close.iloc[-1] / close.iloc[max(0, len(close)-30)] - 1) * 100) if len(close) > 30 else float(close.pct_change().tail(30).sum() * 100)
        volatility = float(close.pct_change().dropna().std() * np.sqrt(252) * 100)
        source = str(df['source'].iloc[-1])
        financial_analysis = self.provider.get_financial_analysis(ticker)
        financial_statement_snapshot = self.provider.get_financial_statement_snapshot(ticker)
        company_profile = self.provider.get_company_profile(ticker, financial_analysis)
        fundamental_analysis = self._build_fundamental_analysis(company_name, financial_analysis, financial_statement_snapshot)

        signals = self._build_signals(last_price, ma20, ma60, return_30d, volatility)
        prompt = self._build_prompt(
            ticker,
            company_name,
            risk_profile,
            last_price,
            ma20,
            ma60,
            return_30d,
            volatility,
            signals,
            source,
            financial_analysis,
            financial_statement_snapshot,
        )
        report = self.report_client.generate_report(prompt)
        competitive_landscape = self._build_competitive_landscape(
            ticker,
            company_name,
            company_profile,
            financial_analysis,
            fundamental_analysis,
            report,
        )

        return {
            'ticker': ticker,
            'company_name': company_name,
            'data_source': source,
            'snapshot': {
                'ticker': ticker,
                'company_name': company_name,
                'data_source': source,
                'last_price': round(last_price, 2),
                'return_30d': round(return_30d, 2),
                'volatility_annualized': round(volatility, 2),
                'ma20': round(ma20, 2),
                'ma60': round(ma60, 2),
            },
            'signals': signals,
            'report': report,
            'agent_status': {
                'data_agent': f'已完成 ({source} + {financial_analysis.get("source", "financial-fallback")})',
                'analysis_agent': '已完成 (技术、财务与基本面框架就绪)',
                'report_agent': '已完成 (研究护栏通过)',
                'personalization_agent': f'已完成 ({risk_profile})',
            },
            'price_history': [
                {'date': d.strftime('%Y-%m-%d'), 'close': round(float(c), 2)}
                for d, c in zip(df['date'].tail(90), close.tail(90))
            ],
            'financial_analysis': financial_analysis,
            'fundamental_analysis': fundamental_analysis,
            'financial_statement_snapshot': financial_statement_snapshot,
            'company_profile': company_profile,
            'competitive_landscape': competitive_landscape,
        }

    def _build_signals(self, last_price: float, ma20: float, ma60: float, return_30d: float, volatility: float):
        trend_value = '高于 MA20' if last_price > ma20 else '低于 MA20'
        medium_term = '高于 MA60' if last_price > ma60 else '低于 MA60'
        vol_label = '低' if volatility < 18 else '中等' if volatility < 32 else '高'
        return [
            {
                'title': '趋势',
                'value': trend_value,
                'interpretation': '短期价格结构偏建设性。' if last_price > ma20 else '动量已弱于短期趋势线。',
            },
            {
                'title': '中期位置',
                'value': medium_term,
                'interpretation': '股价仍与中期趋势保持一致。' if last_price > ma60 else '股价低于 60 日趋势线，改善前需要进一步确认。',
            },
            {
                'title': '30日收益',
                'value': f'{return_30d:+.2f}%',
                'interpretation': '近期表现为正。' if return_30d >= 0 else '近期表现为负。',
            },
            {
                'title': '波动率',
                'value': vol_label,
                'interpretation': f'年化波动率约为 {volatility:.2f}%，用于刻画当前风险区间。',
            },
        ]

    def _build_fundamental_analysis(self, company_name, financial_analysis, statement_snapshot):
        statement_items = statement_snapshot.get('items') or {}
        statement_line = '，'.join([f'{k} {v}' for k, v in statement_items.items() if v and v != 'N/A'])
        if not statement_line:
            statement_line = '三张表关键字段暂不可用'

        return {
            'business_quality': f'{company_name} 的业务质量需结合行业地位、利润率、现金流和负债结构共同判断。',
            'valuation_view': '估值判断需要与历史分位、同行业公司和盈利增速一起比较，当前页面先展示财务质量与趋势，不直接给出交易建议。',
            'growth_driver': f'增长线索来自收入增速 {financial_analysis.get("revenue_growth", "N/A")} 与盈利能力变化，需要继续跟踪后续报告期。',
            'risk_watch': f'重点关注毛利率 {financial_analysis.get("gross_margin", "N/A")}、净利率 {financial_analysis.get("net_margin", "N/A")}、ROE {financial_analysis.get("roe", "N/A")} 和杠杆水平 {financial_analysis.get("leverage", "N/A")}。',
            'conclusion': f'基本面结论：{financial_analysis.get("summary", "财务数据暂不可用")} 三张表摘要：{statement_line}。',
        }

    def _build_competitive_landscape(self, ticker, company_name, company_profile, financial_analysis, fundamental_analysis, report):
        prompt = self._build_competitive_landscape_prompt(
            ticker,
            company_name,
            company_profile,
            financial_analysis,
            fundamental_analysis,
            report,
        )
        try:
            payload = self.report_client.generate_json(prompt)
        except Exception as e:
            print(f'[WARN] Gemini competitive landscape completion failed for {ticker}: {e}')
            payload = {}
        normalized = self._normalize_competitive_landscape(payload)
        if normalized:
            return normalized
        return self._fallback_competitive_landscape(company_name, company_profile, report)

    def _build_competitive_landscape_prompt(self, ticker, company_name, company_profile, financial_analysis, fundamental_analysis, report):
        profile_block = '\n'.join([
            f"行业: {company_profile.get('sector', 'N/A')}",
            f"公司画像: {company_profile.get('style', 'N/A')}",
            f"公司描述: {company_profile.get('description', 'N/A')}",
            f"标签: {'、'.join(company_profile.get('tags', []))}",
            f"观察点: {'；'.join(company_profile.get('watchpoints', []))}",
        ])
        fundamental_block = '\n'.join([f'{k}: {v}' for k, v in fundamental_analysis.items()])
        return f"""
你是 A 股研究助理。请基于以下已生成研报、公司画像和财务摘要，为前端“竞争格局”模板补全结构化内容。

股票代码: {ticker}
公司名称: {company_name}

公司画像:
{profile_block}

财务摘要:
收入增长: {financial_analysis.get('revenue_growth', 'N/A')}
毛利率: {financial_analysis.get('gross_margin', 'N/A')}
净利率: {financial_analysis.get('net_margin', 'N/A')}
ROE: {financial_analysis.get('roe', 'N/A')}
总结: {financial_analysis.get('summary', 'N/A')}

基本面分析:
{fundamental_block}

已生成研报:
{report}

只输出合法 JSON，不要 markdown，不要解释。JSON schema:
{{
  "position": "一句话说明该公司的行业位置；信息不足时写待验证，不要编造",
  "moat": "一句话说明护城河或竞争变量；信息不足时写待验证",
  "competitors": [
    {{"name": "可比公司或竞争方名称", "ticker": "代码未知可写-", "angle": "比较角度", "relative_position": "与目标公司的相对位置，需谨慎"}}
  ],
  "summary": "2-3 句总结竞争格局，必须说明需要结合研报和公开资料继续验证"
}}

要求:
- 中文输出
- competitors 输出 2 到 3 个
- 不确定的竞品代码用 "-"
- 不构成投资建议
""".strip()

    def _normalize_competitive_landscape(self, payload):
        if not isinstance(payload, dict):
            return None

        competitors = payload.get('competitors')
        if not isinstance(competitors, list):
            competitors = []

        normalized_competitors = []
        for item in competitors[:3]:
            if not isinstance(item, dict):
                continue
            name = str(item.get('name') or '可比公司待验证').strip()
            normalized_competitors.append({
                'name': name or '可比公司待验证',
                'ticker': str(item.get('ticker') or '-').strip() or '-',
                'angle': str(item.get('angle') or '同业比较').strip() or '同业比较',
                'relative_position': str(item.get('relative_position') or '相对位置需要结合研报和公开资料继续验证。').strip() or '相对位置需要结合研报和公开资料继续验证。',
            })

        if len(normalized_competitors) < 2:
            return None

        return {
            'position': str(payload.get('position') or '行业位置需要结合研报和公开资料继续验证。').strip(),
            'moat': str(payload.get('moat') or '竞争优势需要结合行业份额、盈利能力和产品差异化继续验证。').strip(),
            'competitors': normalized_competitors,
            'summary': str(payload.get('summary') or '竞争格局为研究补全内容，需要结合后续研报、公告和可比公司数据继续验证。').strip(),
            'source': 'gemini-research-completion',
        }

    def _fallback_competitive_landscape(self, company_name, company_profile, report):
        sector = company_profile.get('sector', '行业待确认')
        watchpoints = company_profile.get('watchpoints') or ['行业份额', '盈利质量', '现金流稳定性']
        report_hint = '研报已生成，可在正文的竞争格局小节中继续核对。' if report else '研报正文暂不可用。'
        return {
            'position': f'{company_name} 所处 {sector}，具体行业位置需要结合研报、公告和可比公司数据继续验证。',
            'moat': f'竞争优势暂按 {company_profile.get("style", "通用研究样本")} 处理，重点复核 {watchpoints[0]}。',
            'competitors': [
                {'name': '可比公司 A', 'ticker': '-', 'angle': '同业比较', 'relative_position': '需要根据研报或行业数据库补充市场份额、盈利能力和估值差异。'},
                {'name': '可比公司 B', 'ticker': '-', 'angle': '替代路线', 'relative_position': '需要进一步验证产品、客户、区域和成本结构差异。'},
            ],
            'summary': f'当前为竞争格局兜底模板。{report_hint} 本模块仅用于研究辅助，不构成投资建议。',
            'source': 'fallback',
        }

    def _build_prompt(self, ticker, company_name, risk_profile, last_price, ma20, ma60, return_30d, volatility, signals, source, financial_analysis, statement_snapshot):
        signal_block = '\n'.join([f"- {s['title']}: {s['value']} | {s['interpretation']}" for s in signals])
        guidance = get_profile_guidance(risk_profile)
        statement_items = statement_snapshot.get('items') or {}
        statement_block = '\n'.join([f"- {k}: {v}" for k, v in statement_items.items()]) or '- 暂无三张表摘要'
        return f"""
你正在为 WealthAgent AI 原型撰写一份中文 A 股研究报告。报告应接近机构研究摘要风格，但保持简洁、可读、面向投资者。

股票代码: {ticker}
公司: {company_name}
风险偏好: {risk_profile}
数据来源: {source}
最新价: {last_price:.2f}
30日收益: {return_30d:.2f}%
MA20: {ma20:.2f}
MA60: {ma60:.2f}
年化波动率: {volatility:.2f}%

财务指标来源: {financial_analysis.get('source', 'unknown')}
收入增长: {financial_analysis.get('revenue_growth', 'N/A')}
毛利率: {financial_analysis.get('gross_margin', 'N/A')}
净利率: {financial_analysis.get('net_margin', 'N/A')}
ROE: {financial_analysis.get('roe', 'N/A')}
经营现金流: {financial_analysis.get('operating_cashflow', 'N/A')}
杠杆水平: {financial_analysis.get('leverage', 'N/A')}
财务摘要: {financial_analysis.get('summary', 'N/A')}

三张表快照:
{statement_block}

信号:
{signal_block}

个性化指引:
{guidance}

请严格按以下中文小节输出:
概览
近期市场行为
财务与基本面观察
竞争格局
积极信号
关键风险
风险偏好匹配
结论

要求:
- 只使用中文
- 风格清晰、专业、面向投资者
- 不编造未提供的新闻或财务事实；如缺少数据，请说明需要进一步验证
- 必须明确说明报告仅用于研究，不构成投资建议
- 500 到 800 个中文字符
""".strip()
