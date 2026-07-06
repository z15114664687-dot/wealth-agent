from fastapi import APIRouter
from services.data_provider import provider

router = APIRouter(prefix='/api/market', tags=['market'])

@router.get('/history/{ticker}')
def get_history(ticker: str):
    symbol = provider.resolve_symbol(ticker.strip())
    df = provider.get_stock_history(symbol['display_symbol'])
    source = str(df['source'].iloc[-1])
    history = [
        {
            'date': row.date.strftime('%Y-%m-%d'),
            'close': float(row.close),
            'open': float(row.open),
            'high': float(row.high),
            'low': float(row.low),
            'volume': float(row.volume),
        }
        for row in df.tail(120).itertuples()
    ]
    return {'ticker': symbol['display_symbol'], 'market': symbol['market'], 'source': source, 'history': history}

@router.get('/snapshot/{ticker}')
def get_snapshot(ticker: str):
    symbol = provider.resolve_symbol(ticker.strip())
    df = provider.get_stock_history(symbol['display_symbol'])
    close = df['close'].astype(float)
    return {
        'ticker': symbol['display_symbol'],
        'market': symbol['market'],
        'company_name': provider.get_company_name(symbol['display_symbol']),
        'data_source': str(df['source'].iloc[-1]),
        'last_price': round(float(close.iloc[-1]), 2),
        'return_30d': round(float((close.iloc[-1] / close.iloc[max(0, len(close)-30)] - 1) * 100), 2) if len(close) > 30 else 0,
        'volatility_annualized': round(float(close.pct_change().dropna().std() * (252 ** 0.5) * 100), 2),
        'ma20': round(float(close.tail(20).mean()), 2),
        'ma60': round(float(close.tail(60).mean()), 2),
    }
