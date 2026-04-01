import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
