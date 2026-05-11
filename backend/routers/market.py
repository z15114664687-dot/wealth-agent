from fastapi import APIRouter
from services.data_provider import ChinaMarketDataProvider

router = APIRouter(prefix='/api/market', tags=['market'])
provider = ChinaMarketDataProvider()

@router.get('/history/{ticker}')
def get_history(ticker: str):
    df = provider.get_stock_history(ticker.strip())
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
    return {'ticker': ticker, 'source': source, 'history': history}

@router.get('/snapshot/{ticker}')
def get_snapshot(ticker: str):
    df = provider.get_stock_history(ticker.strip())
    close = df['close'].astype(float)
    return {
        'ticker': ticker,
        'company_name': provider.get_company_name(ticker),
        'data_source': str(df['source'].iloc[-1]),
        'last_price': round(float(close.iloc[-1]), 2),
        'return_30d': round(float((close.iloc[-1] / close.iloc[max(0, len(close)-30)] - 1) * 100), 2) if len(close) > 30 else 0,
        'volatility_annualized': round(float(close.pct_change().dropna().std() * (252 ** 0.5) * 100), 2),
        'ma20': round(float(close.tail(20).mean()), 2),
        'ma60': round(float(close.tail(60).mean()), 2),
    }
