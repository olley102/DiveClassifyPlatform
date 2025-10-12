// import MapView from './components/MapView';
// import UploadForm from './components/UploadForm';
// import UserDashboard from './components/UserDashboard';
import { Routes, Route, Navigate } from "react-router-dom";
import SignupForm from "./components/SignupForm";
import LoginForm from "./components/LoginForm";
import strings from "./assets/strings.json";
import colors from "./assets/colors.json";

function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${colors.background}, ${colors.primaryLight}10)`
      }}
    >
      <div
        className="w-full max-w-md shadow-lg rounded-2xl p-8 mx-4 transition-all duration-300 ease-in-out"
        style={{ backgroundColor: colors.cardBackground }}
      >
        <h1
          className="text-3xl font-extrabold text-center mb-6"
          style={{ color: colors.primary }}
        >
          {strings.appName}
        </h1>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginForm colors={colors} />} />
          <Route path="/signup" element={<SignupForm colors={colors} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
