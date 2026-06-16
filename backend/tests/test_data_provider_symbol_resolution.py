import unittest
from unittest.mock import patch

import pandas as pd

from services.data_provider import ChinaMarketDataProvider


class DataProviderSymbolResolutionTest(unittest.TestCase):
    def setUp(self):
        self.provider = ChinaMarketDataProvider()

    def test_resolves_a_share_codes(self):
        self.assertEqual(self.provider.resolve_symbol('600519')['market'], 'CN')
        self.assertEqual(self.provider.resolve_symbol('600519')['display_symbol'], '600519')
        self.assertEqual(self.provider.resolve_symbol('600519.SH')['yahoo_symbol'], '600519.SS')

    def test_resolves_us_tickers_without_a_share_suffix(self):
        resolved = self.provider.resolve_symbol('aapl')

        self.assertEqual(resolved['market'], 'US')
        self.assertEqual(resolved['display_symbol'], 'AAPL')
        self.assertEqual(resolved['yahoo_symbol'], 'AAPL')

    def test_resolves_hk_tickers_for_display_and_yahoo(self):
        resolved = self.provider.resolve_symbol('700.hk')

        self.assertEqual(resolved['market'], 'HK')
        self.assertEqual(resolved['display_symbol'], '00700.HK')
        self.assertEqual(resolved['yahoo_symbol'], '0700.HK')
        self.assertEqual(resolved['hk_code'], '00700')

    def test_global_history_does_not_call_a_share_sources(self):
        fake_history = pd.DataFrame({
            'date': [pd.Timestamp('2026-01-01')],
            'open': [100.0],
            'high': [101.0],
            'low': [99.0],
            'close': [100.5],
            'volume': [1000],
            'pct_change': [0.0],
            'turnover': [None],
        })

        with patch.object(self.provider, '_get_history_from_yahoo_chart', return_value=fake_history) as yahoo_chart, \
                patch.object(self.provider, '_get_history_from_tushare') as tushare, \
                patch.object(self.provider, '_get_history_from_yfinance') as yfinance:
            df = self.provider.get_stock_history('AAPL', '2026-01-01', '2026-01-02')

        yahoo_chart.assert_called_once()
        tushare.assert_not_called()
        yfinance.assert_not_called()
        self.assertEqual(df['source'].iloc[-1], 'yahoo-chart-us')

    def test_global_financial_analysis_uses_key_statistics(self):
        self.provider._get_global_key_statistics = lambda resolved: {
            'revenue_growth': 0.051,
            'gross_margin': 0.462,
            'profit_margin': 0.264,
            'return_on_equity': 1.427,
            'operating_cashflow': 118_000_000_000,
            'total_debt': 155_000_000_000,
            'total_cash': 55_000_000_000,
            'trailing_pe': 31.2,
            'price_to_book': 48.4,
            'market_cap': 4_350_000_000_000,
        }

        with patch.object(self.provider, '_get_global_quote', return_value={}):
            analysis = self.provider.get_financial_analysis('AAPL')

        self.assertEqual(analysis['revenue_growth'], '5.10%')
        self.assertEqual(analysis['gross_margin'], '46.20%')
        self.assertEqual(analysis['net_margin'], '26.40%')
        self.assertEqual(analysis['roe'], '142.70%')
        self.assertEqual(analysis['operating_cashflow'], '强')
        self.assertEqual(analysis['leverage'], '高')
        self.assertEqual(analysis['source'], 'yahoo-key-statistics')


if __name__ == '__main__':
    unittest.main()
