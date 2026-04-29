import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/common/Sidebar';
import './styles/global.css';

import LoginPage           from './pages/LoginPage';
import DashboardPage       from './pages/DashboardPage';
import RecomendacionesPage from './pages/RecomendacionesPage';
import ExperimentosPage    from './pages/ExperimentosPage';
import LineaTiempoPage     from './pages/LineaTiempoPage';
import IndicadoresPage     from './pages/IndicadoresPage';
import NivelesPage         from './pages/NivelesPage';
import AdminUsuariosPage   from './pages/AdminUsuariosPage';
import AdminConfigPage     from './pages/AdminConfigPage';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route path="/dashboard"       element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
      <Route path="/recomendaciones" element={<PrivateRoute><Layout><RecomendacionesPage /></Layout></PrivateRoute>} />
      <Route path="/experimentos"    element={<PrivateRoute><Layout><ExperimentosPage /></Layout></PrivateRoute>} />
      <Route path="/linea-tiempo"    element={<PrivateRoute><Layout><LineaTiempoPage /></Layout></PrivateRoute>} />
      <Route path="/niveles"         element={<PrivateRoute><Layout><NivelesPage /></Layout></PrivateRoute>} />
      <Route path="/indicadores"     element={<PrivateRoute roles={['docente','admin']}><Layout><IndicadoresPage /></Layout></PrivateRoute>} />
      <Route path="/admin/usuarios"  element={<PrivateRoute roles={['admin']}><Layout><AdminUsuariosPage /></Layout></PrivateRoute>} />
      <Route path="/admin/config"    element={<PrivateRoute roles={['admin']}><Layout><AdminConfigPage /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}