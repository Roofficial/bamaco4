import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';

// PeerJS and simple-peer dependencies
import { Buffer } from 'buffer';
window.Buffer = Buffer;
window.process = {
  env: { NODE_ENV: 'development' },
  nextTick: (fn: any, ...args: any) => setTimeout(() => fn(...args), 0)
} as any;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
