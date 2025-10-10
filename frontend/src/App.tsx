import MapView from './components/MapView';
import UploadForm from './components/UploadForm';
import UserDashboard from './components/UserDashboard';

function App() {
  return (
    <div>
      <h1 className="text-center text-2xl mt-4">Dive Data Platform</h1>
      <UploadForm />
      <MapView />
      <UserDashboard />
    </div>
  );
}

export default App;
