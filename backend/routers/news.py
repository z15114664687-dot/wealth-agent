from typing import Literal, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel

from services.aihot_client import AiHotClientError, fetch_aihot_items
from services.aihot_summary import AiHotSummaryClient, build_summary_docx


router = APIRouter(prefix='/api/news', tags=['news'])
summary_client = AiHotSummaryClient()


class AiHotSummaryRequest(BaseModel):
    items: list[dict]
    context: dict = {}
    summary: Optional[str] = None


@router.get('/aihot')
def aihot_news(
    mode: Literal['selected', 'all'] = Query('selected'),
    category: Literal['all', 'ai-models', 'ai-products', 'industry', 'paper', 'tip'] = Query('all'),
    focus: Literal['all', 'robotics', 'autonomous', 'bio-health', 'enterprise'] = Query('all'),
    days: int = Query(7, ge=1, le=7),
    take: int = Query(50, ge=1, le=100),
    cursor: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    try:
        return fetch_aihot_items(
            mode=mode,
            category=None if category == 'all' else category,
            focus=focus,
            days=days,
            take=take,
            cursor=cursor,
            q=q,
        )
    except AiHotClientError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post('/aihot/summary')
def summarize_aihot_news(payload: AiHotSummaryRequest):
    if not payload.items:
        raise HTTPException(status_code=400, detail='No news items to summarize.')
    summary = summary_client.summarize(payload.items, payload.context)
    return {'summary': summary, 'model': summary_client.model}


@router.post('/aihot/summary.docx')
def download_aihot_summary(payload: AiHotSummaryRequest):
    summary = payload.summary or summary_client.summarize(payload.items, payload.context)
    content = build_summary_docx(summary)
    return Response(
        content=content,
        media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        headers={'Content-Disposition': 'attachment; filename="ai-news-summary.docx"'},
    )
