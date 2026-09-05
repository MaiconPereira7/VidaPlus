import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SaudePage = lazy(() => import("./pages/SaudePage"));
const AgendaPage = lazy(() => import("./pages/AgendaPage"));
const PerfilPage = lazy(() => import("./pages/PerfilPage"));
const SatisfacaoPage = lazy(() => import("./pages/avaliacao/SatisfacaoPage"));
const NpsPage = lazy(() => import("./pages/avaliacao/NpsPage"));
const SusPage = lazy(() => import("./pages/avaliacao/SusPage"));
const ResultadosPage = lazy(() => import("./pages/avaliacao/ResultadosPage"));

function LoginRoute() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return <LoginPage />;
}

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginRoute />} />

              <Route
                path="/avaliacao/satisfacao"
                element={
                  <ProtectedRoute>
                    <SatisfacaoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/avaliacao/nps"
                element={
                  <ProtectedRoute>
                    <NpsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/avaliacao/sus"
                element={
                  <ProtectedRoute>
                    <SusPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/avaliacao/resultados"
                element={
                  <ProtectedRoute>
                    <ResultadosPage />
                  </ProtectedRoute>
                }
              />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<HomePage />} />
                <Route path="/saude" element={<SaudePage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/perfil" element={<PerfilPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
