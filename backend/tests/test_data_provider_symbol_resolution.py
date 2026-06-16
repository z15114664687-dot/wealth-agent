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


if __name__ == '__main__':
    unittest.main()
