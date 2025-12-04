import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { routes } from './config/routes';
import LandingPage from './pages/LandingPage';
import Footer from './shared/components/layout/Footer';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Routes>
        {routes.map((route) => {
          const RouteComponent = route.element;
          return (
            <Route
              key={route.path}
              path={route.path}
              element={<RouteComponent />}
            />
          );
        })}
        {/* 404 fallback - redirect to landing page */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;

