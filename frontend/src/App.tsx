// import MapView from './components/MapView';
// import UploadForm from './components/UploadForm';
// import UserDashboard from './components/UserDashboard';
import strings from './assets/strings.json';
import SignupForm from './components/SignupForm';

function App() {
  return (
    <div>
      <h1 className="text-center text-2xl mt-4">{strings.appName}</h1>
      <SignupForm />
    </div>
  );
}

export default App;
