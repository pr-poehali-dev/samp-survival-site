import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const CACHE_VERSION = 'v2.1';
const lastVersion = localStorage.getItem('cache_version');
const reloadFlag = sessionStorage.getItem('cache_reload_done');

if (lastVersion !== CACHE_VERSION && !reloadFlag) {
  sessionStorage.setItem('cache_reload_done', 'true');
  localStorage.setItem('cache_version', CACHE_VERSION);
  
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  setTimeout(() => {
    window.location.reload();
  }, 100);
} else {
  sessionStorage.removeItem('cache_reload_done');
  createRoot(document.getElementById("root")!).render(<App />);
}