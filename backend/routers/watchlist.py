from fastapi import APIRouter
from models.schemas import WatchlistRequest
from services.monitoring import analyze_watchlist, build_alerts

router = APIRouter(prefix='/api/watchlist', tags=['watchlist'])

@router.post('/analyze')
def analyze(payload: WatchlistRequest):
    return {'watchlist': analyze_watchlist(payload.tickers)}

@router.post('/alerts')
def alerts(payload: WatchlistRequest):
    return {'alerts': build_alerts(payload.tickers)}
