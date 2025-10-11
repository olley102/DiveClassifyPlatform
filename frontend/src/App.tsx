// import MapView from './components/MapView';
// import UploadForm from './components/UploadForm';
// import UserDashboard from './components/UserDashboard';
import colors from "./assets/colors.json";
import SignupForm from "./components/SignupForm";
import strings from "./assets/strings.json";
import LoginForm from "./components/LoginForm";

function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${colors.background}, ${colors.primaryLight}10)`
      }}
    >
      <div
        className="w-full max-w-md shadow-lg rounded-2xl p-8"
        style={{ backgroundColor: colors.cardBackground }}
      >
        <h1
          className="text-3xl font-extrabold text-center mb-6"
          style={{ color: colors.primary }}
        >
          {strings.appName}
        </h1>
        <SignupForm colors={colors} />
        <LoginForm colors={colors} />
      </div>
    </div>
  );
}

export default App;
