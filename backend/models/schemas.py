from typing import List, Literal, Optional
from pydantic import BaseModel

class ResearchRequest(BaseModel):
    ticker: str
    risk_profile: Literal['Conservative', 'Balanced', 'Growth']

class SignalItem(BaseModel):
    title: str
    value: str
    interpretation: str

class StockSnapshot(BaseModel):
    ticker: str
    market: Optional[str] = None
    company_name: str
    data_source: str
    last_price: float
    return_30d: float
    volatility_annualized: float
    ma20: float
    ma60: float

class AgentStatus(BaseModel):
    data_agent: str
    analysis_agent: str
    report_agent: str
    personalization_agent: str

class ResearchResponse(BaseModel):
    ticker: str
    market: Optional[str] = None
    company_name: str
    data_source: str
    snapshot: StockSnapshot
    signals: List[SignalItem]
    report: str
    agent_status: AgentStatus
    price_history: List[dict]

class WatchlistRequest(BaseModel):
    tickers: List[str]
