import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';

function renderStartupError(error: unknown) {
  const root = document.getElementById('root');
  if (!root) return;

  const message =
    error instanceof Error
      ? error.message
      : 'Unknown startup error. Check the browser console for details.';

  root.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#f8fafc;color:#0f172a;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;">
      <section style="max-width:720px;width:100%;background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;box-shadow:0 10px 30px rgba(2,6,23,0.08);">
        <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;">App failed to start</h1>
        <p style="margin:0 0 12px;line-height:1.5;">${message}</p>
        <p style="margin:0;line-height:1.5;">If this is an environment issue, add these variables to <code>.env.local</code> and restart dev server:</p>
        <pre style="margin:12px 0 0;padding:12px;border-radius:8px;background:#0f172a;color:#e2e8f0;overflow:auto;">VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_GOOGLE_MAPS_API_KEY=...</pre>
      </section>
    </main>
  `;
}

async function bootstrap() {
  try {
    const { default: App } = await import('./app/App');

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    console.error('Application startup failed:', error);
    renderStartupError(error);
  }
}

void bootstrap();

