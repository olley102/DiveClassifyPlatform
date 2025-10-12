import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";
import MapView from "./pages/MapView";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import strings from "./assets/strings.json";
import colors from "./assets/colors.json";

function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${colors.background}, ${colors.primaryLight}20)`
      }}
    >
      <div
        className="w-full max-w-md h-[90vh] flex flex-col shadow-lg rounded-2xl mx-4 overflow-hidden"
        style={{ backgroundColor: colors.cardBackground }}
      >
        <h1
          className="text-3xl font-extrabold text-center py-4"
          style={{ color: colors.primary }}
        >
          {strings.appName}
        </h1>

        <div className="flex-grow overflow-hidden">
          <Routes>
            <Route path="/" element={ <Navigate to="/login" />} />
            <Route path="/login"
              element={
                <AuthLayout>
                  <LoginForm colors={colors} />
                </AuthLayout>
              }
            />
            <Route path="/signup"
              element={
                <AuthLayout>
                  <SignupForm colors={colors} />
                </AuthLayout>
              }
            />

            {/* Protected pages */}
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <MapView />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Discover />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
