import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import AppProviders from './contexts/AppProviders.jsx';
import { appRouter } from './routes/index.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  </React.StrictMode>,
);
