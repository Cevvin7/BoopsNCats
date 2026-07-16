import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { GameStateProvider } from './state/GameStateContext.jsx';
import { ErrorBoundary } from './ErrorBoundary.jsx';
import './fonts.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GameStateProvider>
        <App />
      </GameStateProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
