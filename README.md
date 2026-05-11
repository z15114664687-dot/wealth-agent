# WealthAgent AI

A full-stack prototype for the project WealthAgentAI

## Stack

- Frontend: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- Backend: FastAPI, Python
- LLM: Gemini API
- Data: Tushare primary, yfinance fallback, mock fallback

## Run backend

```bash
cd backend
python -m venv .venv
# activate venv
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

## Notes

- Product UI is English-only.
- This prototype is for research and educational purposes only.
- If live data fails, the backend falls back to mock/demo mode.
