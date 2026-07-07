import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import system, research, market, watchlist, news

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s',
)
logger = logging.getLogger('wealthagent')

app = FastAPI(title='WealthAgent AI Backend', version='0.1.0')

allowed_origins = [
    origin.strip()
    for origin in os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception('Unhandled error on %s %s', request.method, request.url.path)
    return JSONResponse(status_code=500, content={'detail': 'Internal server error.'})


app.include_router(system.router)
app.include_router(research.router)
app.include_router(market.router)
app.include_router(watchlist.router)
app.include_router(news.router)
