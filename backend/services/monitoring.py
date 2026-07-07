from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

from services.data_provider import provider


def _analyze_ticker(ticker: str):
    symbol = provider.resolve_symbol(ticker)
    df = provider.get_stock_history(symbol['display_symbol'])
    latest = df.iloc[-1]
    daily_move = float(latest['pct_change'])
    ma20 = float(df['close'].tail(20).mean())
    trend = 'positive' if float(latest['close']) > ma20 else 'mixed'
    alert = 'medium' if abs(daily_move) > 2.5 else 'low' if abs(daily_move) > 1.0 else 'none'
    return {
        'ticker': symbol['display_symbol'],
        'market': symbol['market'],
        'company_name': provider.get_company_name(symbol['display_symbol']),
        'last_price': float(latest['close']),
        'daily_move': daily_move,
        'trend_status': trend,
        'alert_status': alert,
        'source': str(latest.get('source', 'unknown')),
    }


def analyze_watchlist(tickers: list[str]):
    if not tickers:
        return []
    with ThreadPoolExecutor(max_workers=min(8, len(tickers))) as pool:
        return list(pool.map(_analyze_ticker, tickers))


def build_alerts(tickers: list[str]):
    alerts = []
    for item in analyze_watchlist(tickers):
        if item['alert_status'] == 'none':
            continue
        alert_type = 'volatility_spike' if abs(item['daily_move']) > 2.5 else 'trend_break'
        message = (
            'Short-term volatility has risen above the configured threshold.'
            if alert_type == 'volatility_spike'
            else 'Momentum has softened and price action should be monitored more closely.'
        )
        alerts.append({
            'ticker': item['ticker'],
            'company_name': item['company_name'],
            'alert_type': alert_type,
            'message': message,
            'severity': 'medium' if item['alert_status'] == 'medium' else 'low',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        })
    return alerts
