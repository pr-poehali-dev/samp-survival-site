import * as React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const CACHE_VERSION = 'v2.0';
const lastVersion = localStorage.getItem('cache_version');

if (lastVersion !== CACHE_VERSION) {
  localStorage.setItem('cache_version', CACHE_VERSION);
  
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  window.location.reload();
}

createRoot(document.getElementById("root")!).render(<App />);