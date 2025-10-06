import React from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import IstaniCompleteProduct from './App.jsx';

const container = document.getElementById('root');

if (!container) {
  throw new Error('ISTANI Rebuild root element not found.');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <IstaniCompleteProduct />
    <Analytics />
  </React.StrictMode>
);
