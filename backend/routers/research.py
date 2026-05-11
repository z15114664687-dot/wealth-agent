from fastapi import APIRouter
from models.schemas import ResearchRequest
from services.research_agent import ResearchAgentOrchestrator

router = APIRouter(prefix='/api/research', tags=['research'])
agent = ResearchAgentOrchestrator()

@router.post('/generate')
def generate_research(payload: ResearchRequest):
    return agent.run(payload.ticker.strip(), payload.risk_profile)
