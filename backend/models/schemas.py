from typing import List, Literal
from pydantic import BaseModel

class ResearchRequest(BaseModel):
    ticker: str
    risk_profile: Literal['Conservative', 'Balanced', 'Growth']

class WatchlistRequest(BaseModel):
    tickers: List[str]
