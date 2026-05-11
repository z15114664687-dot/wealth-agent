import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd
from dotenv import load_dotenv

load_dotenv()

class ChinaMarketDataProvider:
    def __init__(self):
        self.tushare_token = os.getenv('TUSHARE_TOKEN', '').strip()

    def get_stock_history(self, symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> pd.DataFrame:
        end = pd.Timestamp(end_date) if end_date else pd.Timestamp.today().normalize()
        start = pd.Timestamp(start_date) if start_date else end - pd.Timedelta(days=180)

        try:
            df = self._get_history_from_tushare(symbol, start, end)
            if not df.empty:
                df['source'] = 'tushare'
                return df
        except Exception as e:
            print(f'[WARN] Tushare failed for {symbol}: {e}')

        try:
            df = self._get_history_from_yfinance(symbol, start, end)
            if not df.empty:
                df['source'] = 'yfinance'
                return df
        except Exception as e:
            print(f'[WARN] yfinance failed for {symbol}: {e}')

        df = self._get_mock_history(symbol, start, end)
        df['source'] = 'mock'
        return df

    def get_company_name(self, symbol: str) -> str:
        mapping = {'600519': '贵州茅台', '300750': '宁德时代', '000001': '平安银行', '600036': '招商银行', '601899': '紫金矿业', '002594': '比亚迪'}
        return mapping.get(symbol, f'A-Share {symbol}')

    def get_company_profile(self, symbol: str, financial_analysis: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        try:
            profile = self._get_company_profile_from_akshare(symbol, financial_analysis or {})
            if profile:
                return profile
        except Exception as e:
            print(f'[WARN] AKShare company profile failed for {symbol}: {e}')

        return {
            'sector': 'A 股 / 综合',
            'style': '通用研究样本',
            'description': '该标的公司画像暂不可用，系统会使用通用 A 股研究框架展示技术面、财务面和风险观察。',
            'tags': ['A股', '研究', '监控'],
            'valuation': [
                {'label': '市值', 'value': 'N/A'},
                {'label': '流通市值', 'value': 'N/A'},
                {'label': '行业', 'value': 'N/A'},
                {'label': '上市时间', 'value': 'N/A'},
            ],
            'watchpoints': ['盈利趋势', '估值位置', '行业景气度'],
            'dataNotes': ['AKShare 公司资料暂不可用。'],
        }

    def get_financial_analysis(self, symbol: str) -> Dict[str, Any]:
        try:
            indicators = self._get_financial_indicators_from_akshare(symbol)
            if indicators:
                return indicators
        except Exception as e:
            print(f'[WARN] AKShare financial indicators failed for {symbol}: {e}')

        return {
            'revenue_growth': '待接入',
            'gross_margin': '待接入',
            'net_margin': '待接入',
            'roe': '待接入',
            'operating_cashflow': '待接入',
            'leverage': '待接入',
            'summary': 'AKShare 财务指标暂不可用，当前仅使用行情与技术面生成研究框架。',
            'source': 'fallback',
        }

    def get_financial_statement_snapshot(self, symbol: str) -> Dict[str, Any]:
        try:
            return self._get_financial_statement_snapshot_from_akshare(symbol)
        except Exception as e:
            print(f'[WARN] AKShare financial statements failed for {symbol}: {e}')
            return {'source': 'fallback', 'latest_report': None, 'items': {}}

    def _to_tushare_code(self, symbol: str) -> str:
        return f'{symbol}.SH' if symbol.startswith(('5', '6', '9')) else f'{symbol}.SZ'

    def _to_yahoo_code(self, symbol: str) -> str:
        return f'{symbol}.SS' if symbol.startswith(('5', '6', '9')) else f'{symbol}.SZ'

    def _to_em_code(self, symbol: str) -> str:
        return f'{symbol}.SH' if symbol.startswith(('5', '6', '9')) else f'{symbol}.SZ'

    def _to_sina_code(self, symbol: str) -> str:
        return f'sh{symbol}' if symbol.startswith(('5', '6', '9')) else f'sz{symbol}'

    def _get_history_from_tushare(self, symbol: str, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
        if not self.tushare_token:
            raise ValueError('TUSHARE_TOKEN missing')
        import tushare as ts
        ts.set_token(self.tushare_token)
        pro = ts.pro_api()
        df = pro.daily(ts_code=self._to_tushare_code(symbol), start_date=start.strftime('%Y%m%d'), end_date=end.strftime('%Y%m%d'))
        if df is None or df.empty:
            raise ValueError('Empty dataframe returned from Tushare')
        df = df.rename(columns={'trade_date':'date','open':'open','high':'high','low':'low','close':'close','vol':'volume','pct_chg':'pct_change','amount':'turnover'})
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        return df[['date','open','high','low','close','volume','pct_change','turnover']]

    def _get_history_from_yfinance(self, symbol: str, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
        import yfinance as yf
        code = self._to_yahoo_code(symbol)
        hist = yf.Ticker(code).history(start=start.strftime('%Y-%m-%d'), end=(end + pd.Timedelta(days=1)).strftime('%Y-%m-%d'), auto_adjust=False)
        if hist is None or hist.empty:
            raise ValueError('Empty dataframe returned from yfinance')
        hist = hist.reset_index().rename(columns={'Date':'date','Open':'open','High':'high','Low':'low','Close':'close','Volume':'volume'})
        hist['date'] = pd.to_datetime(hist['date']).dt.tz_localize(None)
        hist['pct_change'] = hist['close'].pct_change().fillna(0) * 100
        hist['turnover'] = np.nan
        return hist[['date','open','high','low','close','volume','pct_change','turnover']]

    def _get_mock_history(self, symbol: str, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
        dates = pd.date_range(start=start, end=end, freq='B')
        base = 1600 if symbol == '600519' else 200 if symbol == '300750' else 12 if symbol == '000001' else 50
        rng = np.random.default_rng(abs(hash(symbol)) % (2**32))
        trend = np.linspace(0, base * 0.06, len(dates))
        noise = rng.normal(0, base * 0.012, len(dates)).cumsum() * 0.15
        close = np.maximum(base + trend + noise, base * 0.4)
        df = pd.DataFrame({
            'date': dates,
            'close': close,
        })
        df['open'] = df['close'] * rng.uniform(0.992, 1.008, len(df))
        df['high'] = df[['open','close']].max(axis=1) * rng.uniform(1.001, 1.018, len(df))
        df['low'] = df[['open','close']].min(axis=1) * rng.uniform(0.982, 0.999, len(df))
        df['volume'] = rng.integers(100000, 3000000, len(df))
        df['pct_change'] = df['close'].pct_change().fillna(0) * 100
        df['turnover'] = np.nan
        return df[['date','open','high','low','close','volume','pct_change','turnover']]

    def _get_financial_indicators_from_akshare(self, symbol: str) -> Dict[str, Any]:
        import akshare as ak

        df = ak.stock_financial_analysis_indicator_em(symbol=self._to_em_code(symbol), indicator='按报告期')
        if df is None or df.empty:
            raise ValueError('Empty dataframe returned from AKShare financial indicators')

        latest = df.iloc[0]
        report_name = self._first_valid(latest, ['REPORT_DATE_NAME', 'REPORT_DATE'])
        revenue_growth = self._fmt_pct(self._first_valid(latest, ['TOTALOPERATEREVETZ']))
        gross_margin = self._fmt_pct(self._first_valid(latest, ['XSMLL']))
        net_margin = self._fmt_pct(self._first_valid(latest, ['XSJLL']))
        roe = self._fmt_pct(self._first_valid(latest, ['ROEJQ']))
        operating_cashflow_per_share = self._first_valid(latest, ['MGJYXJJE'])
        debt_ratio = self._first_valid(latest, ['ZCFZL', 'INTEREST_DEBT_RATIO'])

        cashflow_label = self._classify_operating_cashflow(operating_cashflow_per_share)
        leverage_label = self._classify_leverage(debt_ratio)
        report_text = f'{report_name}，' if report_name else ''
        summary = (
            f'AKShare 财务指标显示：{report_text}收入增速 {revenue_growth}，'
            f'毛利率 {gross_margin}，净利率 {net_margin}，ROE {roe}，'
            f'每股经营现金流 {self._fmt_number(operating_cashflow_per_share)}，'
            f'资产负债率 {self._fmt_pct(debt_ratio)}。'
        )

        return {
            'revenue_growth': revenue_growth,
            'gross_margin': gross_margin,
            'net_margin': net_margin,
            'roe': roe,
            'operating_cashflow': cashflow_label,
            'leverage': leverage_label,
            'summary': summary,
            'source': 'akshare',
            'latest_report': str(report_name) if report_name is not None else None,
        }

    def _get_financial_statement_snapshot_from_akshare(self, symbol: str) -> Dict[str, Any]:
        import akshare as ak

        sina_code = self._to_sina_code(symbol)
        income = ak.stock_financial_report_sina(stock=sina_code, symbol='利润表')
        balance = ak.stock_financial_report_sina(stock=sina_code, symbol='资产负债表')
        cashflow = ak.stock_financial_report_sina(stock=sina_code, symbol='现金流量表')

        if income is None or income.empty:
            raise ValueError('Empty income statement returned from AKShare')

        latest_income = income.iloc[0]
        latest_balance = balance.iloc[0] if balance is not None and not balance.empty else pd.Series(dtype='object')
        latest_cashflow = cashflow.iloc[0] if cashflow is not None and not cashflow.empty else pd.Series(dtype='object')

        return {
            'source': 'akshare',
            'latest_report': str(self._first_valid(latest_income, ['报告日'])),
            'items': {
                '营业收入': self._fmt_money(self._first_valid(latest_income, ['营业收入', '营业总收入'])),
                '归母净利润': self._fmt_money(self._first_valid(latest_income, ['归属于母公司所有者的净利润', '净利润'])),
                '总资产': self._fmt_money(self._first_valid(latest_balance, ['资产总计', '总资产'])),
                '总负债': self._fmt_money(self._first_valid(latest_balance, ['负债合计', '总负债'])),
                '经营现金流净额': self._fmt_money(self._first_valid(latest_cashflow, ['经营活动产生的现金流量净额'])),
            },
        }

    def _get_company_profile_from_akshare(self, symbol: str, financial_analysis: Dict[str, Any]) -> Dict[str, Any]:
        import akshare as ak

        profile_df = ak.stock_profile_cninfo(symbol=symbol)
        if profile_df is None or profile_df.empty:
            raise ValueError('Empty company profile returned from AKShare')

        profile_row = profile_df.iloc[0]
        info = self._get_individual_info_dict_from_akshare(symbol)

        company_name = self._first_valid(profile_row, ['A股简称', '公司名称']) or self.get_company_name(symbol)
        profile_industry = self._first_valid(profile_row, ['所属行业'])
        info_industry = info.get('行业')
        industry = info_industry or profile_industry or '行业待确认'
        main_business = self._clean_text(self._first_valid(profile_row, ['主营业务']))
        org_intro = self._clean_text(self._first_valid(profile_row, ['机构简介']))
        description = self._build_company_description(company_name, industry, main_business, org_intro)
        style, tags = self._derive_profile_style_tags(str(industry), financial_analysis)

        total_market_cap = self._fmt_money(info.get('总市值'))
        float_market_cap = self._fmt_money(info.get('流通市值'))
        listing_date = self._fmt_date(info.get('上市时间') or self._first_valid(profile_row, ['上市日期']))

        return {
            'sector': str(industry),
            'style': style,
            'description': description,
            'tags': tags,
            'valuation': [
                {'label': '市值', 'value': total_market_cap},
                {'label': '流通市值', 'value': float_market_cap},
                {'label': '行业', 'value': str(industry)},
                {'label': '上市时间', 'value': listing_date},
            ],
            'watchpoints': self._build_watchpoints(str(industry), financial_analysis),
            'dataNotes': [
                '公司资料来自 AKShare / 巨潮资讯。',
                '市值、行业和上市时间来自 AKShare / 东方财富；部分接口波动时自动降级。',
            ],
        }

    def _get_individual_info_dict_from_akshare(self, symbol: str) -> Dict[str, Any]:
        import akshare as ak

        last_error = None
        for _ in range(2):
            try:
                df = ak.stock_individual_info_em(symbol=symbol)
                if df is None or df.empty:
                    continue
                return {str(row['item']): row['value'] for _, row in df.iterrows()}
            except Exception as e:
                last_error = e
        if last_error:
            print(f'[WARN] AKShare individual info failed for {symbol}: {last_error}')
        return {}

    def _build_company_description(self, company_name, industry: str, main_business, org_intro) -> str:
        pieces = [f'{company_name}所属{industry}。']
        if main_business:
            pieces.append(f'主营业务为{main_business}')
        if org_intro:
            pieces.append(self._truncate(f'公司简介：{org_intro}', 120))
        return ' '.join(pieces)

    def _derive_profile_style_tags(self, industry: str, financial_analysis: Dict[str, Any]):
        tags = ['A股']
        style = '行业研究样本'
        normalized = industry or ''

        if any(key in normalized for key in ['银行', '金融', '保险']):
            style = '金融资产质量样本'
            tags.extend(['金融', '杠杆', '分红'])
        elif any(key in normalized for key in ['电气', '汽车', '设备', '制造', '电池']):
            style = '制造业成长与周期样本'
            tags.extend(['制造', '成长', '周期'])
        elif any(key in normalized for key in ['酒', '食品', '饮料', '消费']):
            style = '消费品牌质量资产'
            tags.extend(['消费', '品牌', '质量'])
        elif any(key in normalized for key in ['医药', '医疗', '生物']):
            style = '医药研发与现金流样本'
            tags.extend(['医药', '研发', '监管'])

        roe = self._parse_pct(financial_analysis.get('roe'))
        gross_margin = self._parse_pct(financial_analysis.get('gross_margin'))
        leverage = financial_analysis.get('leverage')
        if roe is not None and roe >= 15:
            tags.append('高ROE')
        if gross_margin is not None and gross_margin >= 40:
            tags.append('高毛利')
        if leverage == '低':
            tags.append('低杠杆')

        return style, list(dict.fromkeys(tags))[:5]

    def _build_watchpoints(self, industry: str, financial_analysis: Dict[str, Any]):
        points = [
            f'收入增速 {financial_analysis.get("revenue_growth", "N/A")} 的持续性',
            f'ROE {financial_analysis.get("roe", "N/A")} 与利润率趋势',
        ]
        if any(key in industry for key in ['银行', '金融', '保险']):
            points.append('资产质量、息差与资本充足率变化')
        elif any(key in industry for key in ['制造', '电气', '汽车', '设备', '电池']):
            points.append('订单、价格竞争与资本开支回报')
        elif any(key in industry for key in ['酒', '食品', '饮料', '消费']):
            points.append('渠道库存、终端需求与品牌价格带')
        else:
            points.append('行业景气度、竞争格局与现金流稳定性')
        return points

    def _first_valid(self, row: pd.Series, keys):
        for key in keys:
            if key in row.index:
                value = row[key]
                if pd.notna(value):
                    return value
        return None

    def _fmt_pct(self, value) -> str:
        if value is None or pd.isna(value):
            return 'N/A'
        return f'{float(value):.2f}%'

    def _fmt_number(self, value) -> str:
        if value is None or pd.isna(value):
            return 'N/A'
        return f'{float(value):.2f}'

    def _fmt_money(self, value) -> str:
        if value is None or pd.isna(value):
            return 'N/A'
        amount = float(value)
        if abs(amount) >= 1e8:
            return f'{amount / 1e8:.2f} 亿'
        if abs(amount) >= 1e4:
            return f'{amount / 1e4:.2f} 万'
        return f'{amount:.2f}'

    def _fmt_date(self, value) -> str:
        if value is None or pd.isna(value):
            return 'N/A'
        text = str(value).strip()
        if len(text) == 8 and text.isdigit():
            return f'{text[:4]}-{text[4:6]}-{text[6:]}'
        return text

    def _clean_text(self, value) -> str:
        if value is None or pd.isna(value):
            return ''
        return ' '.join(str(value).replace('\u3000', ' ').split())

    def _truncate(self, text: str, limit: int) -> str:
        return text if len(text) <= limit else f'{text[:limit]}...'

    def _parse_pct(self, value) -> Optional[float]:
        if value is None:
            return None
        text = str(value).replace('%', '').strip()
        if text in {'', 'N/A', '待接入'}:
            return None
        try:
            return float(text)
        except ValueError:
            return None

    def _classify_operating_cashflow(self, value) -> str:
        if value is None or pd.isna(value):
            return '待验证'
        amount = float(value)
        if amount > 5:
            return '强'
        if amount > 0:
            return '为正'
        return '承压'

    def _classify_leverage(self, value) -> str:
        if value is None or pd.isna(value):
            return '待验证'
        ratio = float(value)
        if ratio < 35:
            return '低'
        if ratio < 65:
            return '中等'
        return '高'
