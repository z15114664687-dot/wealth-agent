from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import system, research, market, watchlist, news

app = FastAPI(title='WealthAgent AI Backend', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(system.router)
app.include_router(research.router)
app.include_router(market.router)
app.include_router(watchlist.router)
app.include_router(news.router)
