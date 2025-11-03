import React from 'react';
// FIX: The error "Module '\"react-dom\"' has no exported member 'createRoot'" indicates that for React 18+, createRoot must be imported from 'react-dom/client'.
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);