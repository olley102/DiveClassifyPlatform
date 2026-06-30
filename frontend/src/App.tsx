import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MapPage from "./pages/MapPage";
import Dashboard from "./pages/Dashboard";
import UploadPage from "./pages/UploadPage"
import strings from "./assets/strings.json";
import colors from "./assets/colors.json";
import { use } from "react";

const LoginButton = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login", {replace: true});
  };

  return (
    <button
      onClick={handleLogin}
      className="p-2 rounded-md text-white hover:bg-[#fff]/15 transition-colors"
    >
      <p>Login</p>
    </button>
  );
};

const SignupButton = () => {
  const navigate = useNavigate();
  const handleSignup = () => {
    navigate("/signup", {replace: true});
  };

  return (
    <button
      onClick={handleSignup}
      className="p-2 rounded-md text-white hover:bg-[#fff]/15 transition-colors"
    >
      <p>Sign Up</p>
    </button>
  )
}

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/map", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 rounded-md text-white hover:bg-[#fff]/15 transition-colors"
    >
      <p>Logout</p>
    </button>
  );
};

const TitleButton = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/map", {replace: true});
  }

  return (
    <button onClick={handleHome} className="p-1 text-left">
      <h1 className="text-2xl font-extrabold leading-tight" style={{ color: "#fff" }}>
        {strings.appName}
      </h1>
      <p className="text-xs font-medium opacity-75" style={{ color: "#fff" }}>
        {strings.appTagline}
      </p>
    </button>
  )
}

function App() {
  return (
    <div className="w-full h-screen flex flex-col overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Header with app name + nav buttons */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-none shadow-lg"
        style={{ backgroundColor: colors.primary }}
      >
        <div className="flex-none">
          <TitleButton />
        </div>

        <div className="flex-1 flex justify-end items-center">
          <Routes>
            <Route path="/login" element={<SignupButton />} />
            <Route path="/signup" element={<LoginButton />} />
            <Route path="/map" element={<LoginButton />} />
            <Route path="/*" element={<LogoutButton />} />
          </Routes>
        </div>
      </div>
    
      {/* Routes container */}
      <div className="w-full flex-1 min-h-0 flex flex-col justfiy-center items-center overflow-auto">
        <Routes>
          <Route path="/" element={ <Navigate to="/map" />} />
          <Route path="/map" element={ <MapPage /> } />
          <Route path="/login" element={ <LoginPage /> } />
          <Route path="/signup" element={ <SignupPage /> } />

          {/* Protected pages */}
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
  );
}

export default App;
