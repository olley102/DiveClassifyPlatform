import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthLayout from "./layout/AuthLayout";
import Map from "./pages/Map";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import UploadPage from "./pages/UploadPage"
import strings from "./assets/strings.json";
import colors from "./assets/colors.json";
import { LogOut } from "lucide-react";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 rounded-full hover:bg-red-100 transition-colors"
      title="Logout"
      style={{ color: colors.error }}
    >
      <LogOut size={20} />
    </button>
  );
};

function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${colors.background}, ${colors.primaryLight}20)`
      }}
    >
      {/* Outer card */}
      <div
        className="w-full max-w-md md:max-w-3xl h-[90vh] flex flex-col shadow-lg rounded-2xl mx-4 overflow-hidden"
        style={{ backgroundColor: colors.cardBackground }}
      >
        {/* Header with app name + logout button */}
        <div className="flex items-center justify-between px-6 py-4 flex-none">
          <h1
            className="text-3xl font-extrabold"
            style={{ color: colors.primary }}
          >
            {strings.appName}
          </h1>

          <Routes>
            <Route
              path="/login"
              element={null}
            />
            <Route
              path="/signup"
              element={null}
            />
            <Route
              path="/*"
              element={<LogoutButton />}
            />
          </Routes>
        </div>
        
        {/* Routes container */}
        <div className="flex-grow flex flex-col min-h-0">
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
                  <Map />
                </ProtectedRoute>
              }
            />
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
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
