import os
import re
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd
import requests
from dotenv import load_dotenv

load_dotenv()

class ChinaMarketDataProvider:
    def __init__(self):
        self.tushare_token = os.getenv('TUSHARE_TOKEN', '').strip()
        self._yahoo_session = None

    def resolve_symbol(self, symbol: str) -> Dict[str, str]:
        raw = (symbol or '').strip()
        clean = raw.upper().replace(' ', '')
        clean = clean.replace('HK:', '').replace('US:', '')

        if clean.endswith(('.SH', '.SZ', '.BJ')):
            code = clean.split('.')[0]
            return {
                'raw': raw,
                'market': 'CN',
                'normalized': code,
                'display_symbol': code,
                'yahoo_symbol': self._to_yahoo_code(code),
                'hk_code': '',
            }

        if clean.endswith('.HK'):
            digits = re.sub(r'\D', '', clean.split('.')[0])
            hk_code = digits.zfill(5)
            yahoo_code = str(int(digits)).zfill(4) if digits else hk_code[-4:]
            return {
                'raw': raw,
                'market': 'HK',
                'normalized': hk_code,
                'display_symbol': f'{hk_code}.HK',
                'yahoo_symbol': f'{yahoo_code}.HK',
                'hk_code': hk_code,
            }

        if clean.isdigit() and len(clean) == 6:
            return {
                'raw': raw,
                'market': 'CN',
                'normalized': clean,
                'display_symbol': clean,
                'yahoo_symbol': self._to_yahoo_code(clean),
                'hk_code': '',
            }

        if clean.isdigit() and 1 <= len(clean) <= 5:
            hk_code = clean.zfill(5)
            yahoo_code = str(int(clean)).zfill(4)
            return {
                'raw': raw,
                'market': 'HK',
                'normalized': hk_code,
                'display_symbol': f'{hk_code}.HK',
                'yahoo_symbol': f'{yahoo_code}.HK',
                'hk_code': hk_code,
            }

        us_symbol = clean[:-3] if clean.endswith('.US') else clean
        return {
            'raw': raw,
            'market': 'US',
            'normalized': us_symbol,
            'display_symbol': us_symbol,
            'yahoo_symbol': us_symbol,
            'hk_code': '',
        }

    def get_stock_history(self, symbol: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> pd.DataFrame:
        resolved = self.resolve_symbol(symbol)
        end = pd.Timestamp(end_date) if end_date else pd.Timestamp.today().normalize()
        start = pd.Timestamp(start_date) if start_date else end - pd.Timedelta(days=180)

        if resolved['market'] != 'CN':
            try:
                df = self._get_history_from_yahoo_chart(resolved, start, end)
                if not df.empty:
                    df['source'] = f"yahoo-chart-{resolved['market'].lower()}"
                    return df
            except Exception as e:
                print(f'[WARN] Yahoo chart failed for {symbol}: {e}')

            df = self._get_mock_history(resolved['display_symbol'], start, end, resolved['market'])
            df['source'] = f'mock-{resolved["market"].lower()}'
            return df

        symbol = resolved['normalized']
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

        df = self._get_mock_history(symbol, start, end, 'CN')
        df['source'] = 'mock'
        return df

    def get_company_name(self, symbol: str) -> str:
        resolved = self.resolve_symbol(symbol)
        if resolved['market'] != 'CN':
            quote = self._get_global_quote(resolved)
            if quote.get('name'):
                return quote['name']
            mapping = {
                'AAPL': 'Apple Inc.',
                'MSFT': 'Microsoft',
                'TSLA': 'Tesla',
                'NVDA': 'NVIDIA',
                'BABA': 'Alibaba',
                '00700.HK': '腾讯控股',
                '09988.HK': '阿里巴巴-W',
            }
            return mapping.get(resolved['display_symbol'], resolved['display_symbol'])

        symbol = resolved['normalized']
        mapping = {'600519': '贵州茅台', '300750': '宁德时代', '000001': '平安银行', '600036': '招商银行', '601899': '紫金矿业', '002594': '比亚迪'}
        return mapping.get(symbol, f'A-Share {symbol}')

    def get_company_profile(self, symbol: str, financial_analysis: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        resolved = self.resolve_symbol(symbol)
        if resolved['market'] != 'CN':
            return self._get_global_company_profile(resolved, financial_analysis or {})

        symbol = resolved['normalized']
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
        resolved = self.resolve_symbol(symbol)
        if resolved['market'] != 'CN':
            return self._get_global_financial_analysis(resolved)

        symbol = resolved['normalized']
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
        resolved = self.resolve_symbol(symbol)
        if resolved['market'] != 'CN':
            return self._get_global_financial_statement_snapshot(resolved)

        symbol = resolved['normalized']
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

    def _get_history_from_yahoo_chart(self, resolved: Dict[str, str], start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
        period1 = int(start.timestamp())
        period2 = int((end + pd.Timedelta(days=1)).timestamp())
        url = f'https://query2.finance.yahoo.com/v8/finance/chart/{resolved["yahoo_symbol"]}'
        params = {'period1': period1, 'period2': period2, 'interval': '1d'}
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}
        r = requests.get(url, params=params, headers=headers, timeout=15)
        r.raise_for_status()
        chart = (r.json().get('chart', {}).get('result') or [{}])[0]
        timestamps = chart.get('timestamp') or []
        quote = (chart.get('indicators', {}).get('quote') or [{}])[0]
        rows = []
        for i, ts in enumerate(timestamps):
            close = self._safe_float(self._list_get(quote.get('close'), i))
            if close is None:
                continue
            rows.append({
                'date': pd.to_datetime(datetime.fromtimestamp(ts).date()),
                'open': self._safe_float(self._list_get(quote.get('open'), i)) or close,
                'high': self._safe_float(self._list_get(quote.get('high'), i)) or close,
                'low': self._safe_float(self._list_get(quote.get('low'), i)) or close,
                'close': close,
                'volume': self._safe_float(self._list_get(quote.get('volume'), i)) or 0,
            })
        if not rows:
            raise ValueError('Empty dataframe returned from Yahoo chart')
        df = pd.DataFrame(rows)
        df['pct_change'] = df['close'].pct_change().fillna(0) * 100
        df['turnover'] = np.nan
        return df[['date', 'open', 'high', 'low', 'close', 'volume', 'pct_change', 'turnover']]

    def _get_global_quote(self, resolved: Dict[str, str]) -> Dict[str, Any]:
        try:
            if resolved['market'] == 'US':
                return self._get_us_quote_tencent(resolved['normalized'])
            if resolved['market'] == 'HK':
                return self._get_hk_quote_tencent(resolved['hk_code'])
        except Exception as e:
            print(f'[WARN] Tencent global quote failed for {resolved["display_symbol"]}: {e}')
        return {}

    def _get_us_quote_tencent(self, ticker: str) -> Dict[str, Any]:
        url = f'https://qt.gtimg.cn/q=us{ticker.upper()}'
        r = requests.get(url, timeout=10)
        r.encoding = 'gbk'
        match = re.search(r'"(.+)"', r.text)
        if not match:
            return {}
        fields = match.group(1).split('~')
        if len(fields) < 57:
            return {}
        return {
            'name': fields[1] or fields[27] or ticker.upper(),
            'name_en': fields[27] if len(fields) > 27 else ticker.upper(),
            'price': self._safe_float(fields[3]),
            'change_pct': self._safe_float(fields[32]),
            'market_cap': self._safe_float(fields[44]),
            'pe': self._safe_float(fields[53]),
            'pb': self._safe_float(fields[56]),
            'currency': 'USD',
        }

    def _get_hk_quote_tencent(self, code: str) -> Dict[str, Any]:
        url = f'https://qt.gtimg.cn/q=r_hk{code}'
        r = requests.get(url, timeout=10)
        r.encoding = 'gbk'
        match = re.search(r'"(.+)"', r.text)
        if not match:
            return {}
        fields = match.group(1).split('~')
        if len(fields) < 57:
            return {}
        return {
            'name': fields[1] or fields[2] or code,
            'name_en': fields[2] if len(fields) > 2 else code,
            'price': self._safe_float(fields[3]),
            'change_pct': self._safe_float(fields[32]),
            'market_cap': self._safe_float(fields[44]),
            'pe': self._safe_float(fields[39]),
            'pb': self._safe_float(fields[56]),
            'currency': 'HKD',
        }

    def _get_global_financial_analysis(self, resolved: Dict[str, str]) -> Dict[str, Any]:
        quote = self._get_global_quote(resolved)
        stats = self._get_global_key_statistics(resolved)
        market_label = '美股' if resolved['market'] == 'US' else '港股'
        pe = stats.get('trailing_pe') or stats.get('forward_pe') or quote.get('pe')
        pb = stats.get('price_to_book') or quote.get('pb')
        mcap = quote.get('market_cap')
        yahoo_mcap = stats.get('market_cap')
        revenue_growth = self._fmt_ratio_pct(stats.get('revenue_growth'))
        gross_margin = self._fmt_ratio_pct(stats.get('gross_margin'))
        net_margin = self._fmt_ratio_pct(stats.get('profit_margin'))
        roe = self._fmt_ratio_pct(stats.get('return_on_equity'))
        operating_cashflow = self._classify_operating_cashflow(stats.get('operating_cashflow'))
        leverage = self._classify_global_leverage(stats)
        summary_parts = [
            f'{market_label}标的 {resolved["display_symbol"]} 已按全球市场数据源处理。',
        ]
        if revenue_growth != 'N/A':
            summary_parts.append(f'收入增速约 {revenue_growth}。')
        if gross_margin != 'N/A':
            summary_parts.append(f'毛利率约 {gross_margin}。')
        if net_margin != 'N/A':
            summary_parts.append(f'净利率约 {net_margin}。')
        if roe != 'N/A':
            summary_parts.append(f'ROE 约 {roe}。')
        if pe:
            summary_parts.append(f'腾讯财经口径 PE 约 {pe:.2f}。')
        if pb:
            summary_parts.append(f'PB 约 {pb:.2f}。')
        if mcap:
            unit = '亿美元' if resolved['market'] == 'US' else '亿港元'
            summary_parts.append(f'市值约 {mcap:.2f}{unit}。')
        elif yahoo_mcap:
            currency = 'USD' if resolved['market'] == 'US' else 'HKD'
            summary_parts.append(f'市值约 {self._fmt_large_currency(yahoo_mcap, currency)}。')
        if len(summary_parts) == 1:
            summary_parts.append('实时估值字段暂不可用，报告会以价格历史与公开研究框架为主。')
        return {
            'revenue_growth': revenue_growth if revenue_growth != 'N/A' else '待验证',
            'gross_margin': gross_margin if gross_margin != 'N/A' else '待验证',
            'net_margin': net_margin if net_margin != 'N/A' else '待验证',
            'roe': roe if roe != 'N/A' else '待验证',
            'operating_cashflow': operating_cashflow,
            'leverage': leverage,
            'summary': ''.join(summary_parts),
            'source': 'yahoo-key-statistics' if stats else f'global-{resolved["market"].lower()}-quote',
            'pe': f'{pe:.2f}' if pe else 'N/A',
            'pb': f'{pb:.2f}' if pb else 'N/A',
        }

    def _get_global_financial_statement_snapshot(self, resolved: Dict[str, str]) -> Dict[str, Any]:
        quote = self._get_global_quote(resolved)
        stats = self._get_global_key_statistics(resolved)
        unit = '亿美元' if resolved['market'] == 'US' else '亿港元'
        items = {
            '最新价': self._fmt_optional_number(quote.get('price')),
            '市值': f"{quote.get('market_cap'):.2f} {unit}" if quote.get('market_cap') else self._fmt_large_currency(stats.get('market_cap'), 'USD' if resolved['market'] == 'US' else 'HKD'),
            'PE': self._fmt_optional_number(stats.get('trailing_pe') or stats.get('forward_pe') or quote.get('pe')),
            'PB': self._fmt_optional_number(stats.get('price_to_book') or quote.get('pb')),
            '总收入': self._fmt_large_currency(stats.get('total_revenue'), 'USD' if resolved['market'] == 'US' else 'HKD'),
            '总现金': self._fmt_large_currency(stats.get('total_cash'), 'USD' if resolved['market'] == 'US' else 'HKD'),
            '总债务': self._fmt_large_currency(stats.get('total_debt'), 'USD' if resolved['market'] == 'US' else 'HKD'),
        }
        return {
            'source': 'yahoo-key-statistics' if stats else f'global-{resolved["market"].lower()}-quote',
            'latest_report': None,
            'items': items,
        }

    def _get_global_key_statistics(self, resolved: Dict[str, str]) -> Dict[str, Any]:
        try:
            data = self._yahoo_quote_summary(resolved['yahoo_symbol'], ['financialData', 'defaultKeyStatistics', 'summaryDetail'])
        except Exception as e:
            print(f'[WARN] Yahoo key statistics failed for {resolved["display_symbol"]}: {e}')
            return {}

        financial_data = data.get('financialData', {})
        key_stats = data.get('defaultKeyStatistics', {})
        summary_detail = data.get('summaryDetail', {})
        return {
            'current_price': self._raw_value(financial_data, 'currentPrice'),
            'target_mean': self._raw_value(financial_data, 'targetMeanPrice'),
            'recommendation': financial_data.get('recommendationKey'),
            'trailing_pe': self._raw_value(summary_detail, 'trailingPE'),
            'forward_pe': self._raw_value(key_stats, 'forwardPE'),
            'peg_ratio': self._raw_value(key_stats, 'pegRatio'),
            'price_to_book': self._raw_value(key_stats, 'priceToBook'),
            'ev_to_ebitda': self._raw_value(key_stats, 'enterpriseToEbitda'),
            'gross_margin': self._raw_value(financial_data, 'grossMargins'),
            'profit_margin': self._raw_value(key_stats, 'profitMargins'),
            'operating_margin': self._raw_value(financial_data, 'operatingMargins'),
            'return_on_equity': self._raw_value(financial_data, 'returnOnEquity'),
            'return_on_assets': self._raw_value(financial_data, 'returnOnAssets'),
            'earnings_growth': self._raw_value(financial_data, 'earningsGrowth'),
            'revenue_growth': self._raw_value(financial_data, 'revenueGrowth'),
            'market_cap': self._raw_value(summary_detail, 'marketCap'),
            'total_revenue': self._raw_value(financial_data, 'totalRevenue'),
            'total_cash': self._raw_value(financial_data, 'totalCash'),
            'total_debt': self._raw_value(financial_data, 'totalDebt'),
            'debt_to_equity': self._raw_value(financial_data, 'debtToEquity'),
            'operating_cashflow': self._raw_value(financial_data, 'operatingCashflow'),
        }

    def _yahoo_quote_summary(self, symbol: str, modules: list) -> Dict[str, Any]:
        session = self._get_yahoo_session()
        url = f'https://query2.finance.yahoo.com/v10/finance/quoteSummary/{symbol}'
        r = session.get(url, params={'modules': ','.join(modules), 'crumb': session._crumb}, timeout=15)
        r.raise_for_status()
        results = r.json().get('quoteSummary', {}).get('result') or []
        return results[0] if results else {}

    def _get_yahoo_session(self) -> requests.Session:
        if self._yahoo_session and hasattr(self._yahoo_session, '_crumb'):
            return self._yahoo_session

        session = requests.Session()
        session.headers.update({'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'})
        session.get('https://fc.yahoo.com', timeout=10)
        crumb_response = session.get('https://query2.finance.yahoo.com/v1/test/getcrumb', timeout=10)
        crumb_response.raise_for_status()
        session._crumb = crumb_response.text
        self._yahoo_session = session
        return session

    def _get_global_company_profile(self, resolved: Dict[str, str], financial_analysis: Dict[str, Any]) -> Dict[str, Any]:
        quote = self._get_global_quote(resolved)
        market_label = '美股' if resolved['market'] == 'US' else '港股'
        name = quote.get('name') or resolved['display_symbol']
        currency = quote.get('currency') or ('USD' if resolved['market'] == 'US' else 'HKD')
        pe = financial_analysis.get('pe') or 'N/A'
        pb = financial_analysis.get('pb') or 'N/A'
        return {
            'sector': f'{market_label} / 行业待验证',
            'style': '全球市场研究样本',
            'description': f'{name}（{resolved["display_symbol"]}）按 {market_label} 数据源处理，当前页面使用 Yahoo K线与腾讯财经行情字段生成研究框架。',
            'tags': [market_label, '全球市场', '研究'],
            'valuation': [
                {'label': '市场', 'value': market_label},
                {'label': '币种', 'value': currency},
                {'label': 'PE', 'value': pe},
                {'label': 'PB', 'value': pb},
            ],
            'watchpoints': ['收入与利润增长', '估值与同业比较', '汇率与市场流动性'],
            'dataNotes': ['K线优先来自 Yahoo chart。', '实时行情和估值字段优先来自腾讯财经；财报深度字段可后续接入 Yahoo quoteSummary / SEC / 东财 datacenter。'],
        }

    def _get_history_from_tushare(self, symbol: str, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
        if not self.tushare_token:
            raise ValueError('TUSHARE_TOKEN missing')
        import tushare as ts
        pro = ts.pro_api(self.tushare_token)
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

    def _get_mock_history(self, symbol: str, start: pd.Timestamp, end: pd.Timestamp, market: str = 'CN') -> pd.DataFrame:
        dates = pd.date_range(start=start, end=end, freq='B')
        base = (
            1600 if symbol == '600519'
            else 200 if symbol in {'300750', 'AAPL', 'MSFT', 'TSLA'}
            else 300 if market == 'HK'
            else 12 if symbol == '000001'
            else 50
        )
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

    def _fmt_ratio_pct(self, value) -> str:
        number = self._safe_float(value)
        if number is None:
            return 'N/A'
        if abs(number) <= 2:
            number *= 100
        return f'{number:.2f}%'

    def _fmt_number(self, value) -> str:
        if value is None or pd.isna(value):
            return 'N/A'
        return f'{float(value):.2f}'

    def _fmt_large_currency(self, value, currency: str) -> str:
        number = self._safe_float(value)
        if number is None:
            return 'N/A'
        if abs(number) >= 1e12:
            return f'{number / 1e12:.2f} 万亿 {currency}'
        if abs(number) >= 1e9:
            return f'{number / 1e9:.2f} 十亿 {currency}'
        if abs(number) >= 1e6:
            return f'{number / 1e6:.2f} 百万 {currency}'
        return f'{number:.2f} {currency}'

    def _fmt_optional_number(self, value) -> str:
        if value is None:
            return 'N/A'
        try:
            return f'{float(value):.2f}'
        except (TypeError, ValueError):
            return 'N/A'

    def _safe_float(self, value):
        if value in (None, '', '-'):
            return None
        try:
            if pd.isna(value):
                return None
            return float(value)
        except (TypeError, ValueError):
            return None

    def _list_get(self, values, index):
        if not values or index >= len(values):
            return None
        return values[index]

    def _raw_value(self, data: Dict[str, Any], key: str):
        value = data.get(key)
        if isinstance(value, dict):
            return value.get('raw')
        return value

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
        if text in {'', 'N/A', '待接入', '待验证'}:
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

    def _classify_global_leverage(self, stats: Dict[str, Any]) -> str:
        debt_to_equity = self._safe_float(stats.get('debt_to_equity'))
        if debt_to_equity is not None:
            if debt_to_equity < 80:
                return '低'
            if debt_to_equity < 180:
                return '中等'
            return '高'

        debt = self._safe_float(stats.get('total_debt'))
        cash = self._safe_float(stats.get('total_cash'))
        if debt is None:
            return '待验证'
        if not cash or cash <= 0:
            return '高' if debt > 0 else '低'
        ratio = debt / cash
        if ratio < 1:
            return '低'
        if ratio < 2.5:
            return '中等'
        return '高'
