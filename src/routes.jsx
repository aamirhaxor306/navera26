import { Navigate, Route, Routes } from 'react-router-dom';
import App from './App.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/school-of-business/navera" element={<Navigate to="/school-of-business/navera26" replace />} />
      <Route path="/school-of-business/navera26" element={<App />} />

      {/* Keep existing behavior for root + any other path */}
      <Route path="/" element={<App />} />
      <Route path="*" element={<App />} />
    </Routes>
  );
}

