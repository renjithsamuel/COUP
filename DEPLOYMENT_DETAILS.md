# Deployment Details

This project deploys as two separate services:
- Frontend: Vercel (free tier)
- Backend: Render (free tier)

## 1) Backend on Render

Service type:
- Web Service

Root directory:
- backend

Runtime:
- Python 3.12+

Build command:
```bash
pip install -r requirements.txt
```

Start command:
```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:
- APP_ENV=production
- DATABASE_URL=sqlite+aiosqlite:///./coup.db
- CORS_ORIGINS=https://<your-vercel-domain>

Optional (recommended):
- LOG_LEVEL=info

Render notes:
- Keep the service in the `backend` root.
- If you change backend package paths, keep `app.main:app` updated.
- Free tier can sleep when inactive.

## 2) Frontend on Vercel

Framework preset:
- Next.js

Root directory:
- frontend

Install command:
```bash
yarn install
```

Build command:
```bash
yarn build
```

Output:
- Managed by Vercel for Next.js

Required environment variables:
- NEXT_PUBLIC_API_URL=https://<your-render-domain>
- NEXT_PUBLIC_WS_URL=wss://<your-render-domain>

Vercel notes:
- Use `wss://` for production WebSocket URL.
- Make sure CORS on backend allows your Vercel domain.

## 3) Local-to-Prod env mapping

Local example:
- NEXT_PUBLIC_API_URL=http://localhost:8000
- NEXT_PUBLIC_WS_URL=ws://localhost:8000

Production example:
- NEXT_PUBLIC_API_URL=https://coup-backend.onrender.com
- NEXT_PUBLIC_WS_URL=wss://coup-backend.onrender.com

## 4) Deployment checklist

1. Deploy backend first on Render.
2. Confirm backend health endpoint returns OK:
   - GET /api/health
3. Set frontend env vars in Vercel to backend URL.
4. Deploy frontend on Vercel.
5. Verify:
   - Create room
   - Join room
   - Start game
   - WebSocket updates work in real time

## 5) Quick troubleshooting

If lobby/game loads but real-time events fail:
- Check `NEXT_PUBLIC_WS_URL` uses `wss://` in production.
- Confirm backend is awake on Render free tier.
- Verify browser console for WebSocket connection errors.

If frontend cannot call API:
- Check `NEXT_PUBLIC_API_URL` in Vercel.
- Check backend CORS_ORIGINS includes your Vercel URL.
