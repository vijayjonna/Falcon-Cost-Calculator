import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

const ASSET_MIGRATION_KEY = 'falcon_blueprint_icon_v4';

async function forceMobileCacheRefreshOnce(): Promise<boolean> {
  try {
    if (localStorage.getItem(ASSET_MIGRATION_KEY) === '1') return false;
    localStorage.setItem(ASSET_MIGRATION_KEY, '1');

    let clearedAny = false;
    if ('caches' in window) {
      const keys = await caches.keys();
      if (keys.length > 0) {
        await Promise.all(keys.map((k) => caches.delete(k)));
        clearedAny = true;
      }
    }

    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length > 0) {
        await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
        clearedAny = true;
      }
    }

    return clearedAny;
  } catch {
    return false;
  }
}

let hadController =
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  !!navigator.serviceWorker.controller;
let reloadingForUpdate = false;

function mountApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

async function initPwaAndRefreshCaches() {
  const alreadyMigrated = (() => {
    try {
      return localStorage.getItem(ASSET_MIGRATION_KEY) === '1';
    } catch {
      return true;
    }
  })();

  if (alreadyMigrated) {
    mountApp();
  } else {
    const clearedOldAssets = await forceMobileCacheRefreshOnce();
    if (clearedOldAssets) {
      window.location.reload();
      return;
    }
    mountApp();
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloadingForUpdate) {
        reloadingForUpdate = true;
        window.location.reload();
      }
      hadController = true;
    });
  }

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Proactively check for updated assets/icons when returning to the mobile app
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });
    },
    onNeedRefresh() {
      void updateSW(true);
    },
  });
}

void initPwaAndRefreshCaches();
