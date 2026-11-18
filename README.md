# FortyGuard Explorer frontend

Angular standalone application for the dashboard and "What Should I Wear?" feature.

## Run locally

```powershell
npm install
npm start
```

The development API URL is `http://localhost:3000/api`. For deployment, set `apiBaseUrl` in `src/environments/environment.production.ts` to the backend's public URL (ending in `/api`) and set the backend's `FRONTEND_ORIGIN` to the frontend's exact origin. The browser only communicates with this backend; FortyGuard credentials stay server-side.

## Test and build

```powershell
npm test
npm run build
```
