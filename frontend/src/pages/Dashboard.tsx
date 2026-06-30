import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import api from '../api/api';
import MapView from '../components/MapView';
import UploadDetail, { type UploadItem } from '../components/UploadDetail';
import BatchUploadForm from '../components/BatchUploadForm';
import colors from '../assets/colors.json';

interface User {
  username: string;
  name?: string;
  affiliation?: string;
  role?: string;
  email?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User>();
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [error, setError] = useState<string>();
  const [paneOpen, setPaneOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<UploadItem>();

  const fetchUploads = (username: string) => {
    api.get(`/users/${username}/uploads`).then(res => setUploads(res.data));
  };

  useEffect(() => {
    api.get('/users/me')
      .then(res => {
        setUser(res.data);
        fetchUploads(res.data.username);
      })
      .catch(err => setError(err.response?.data?.detail ?? 'Failed to load user'));
  }, []);

  const handleUploadUpdate = (updated: UploadItem) => {
    setUploads(prev => prev.map(u => u.id === updated.id ? updated : u));
    setSelectedUpload(updated);
  };

  return (
    <div className="w-full h-full min-h-0 flex">

      {/* Map */}
      <div className="flex-1 min-w-0 flex flex-col relative">
        {error && (
          <p className="text-center text-sm mt-4" style={{ color: colors.error }}>{error}</p>
        )}
        {user && <MapView url={`/users/${user.username}/uploads`} />}

        {/* Upload modal */}
        {showUploadModal && (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-xl shadow-xl p-6 mx-4" style={{ backgroundColor: colors.cardBackground }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
                  Add Observation
                </h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-lg leading-none hover:opacity-60 transition-opacity"
                  style={{ color: colors.textSecondary }}
                >
                  ✕
                </button>
              </div>
              <BatchUploadForm onSuccess={() => {
                setShowUploadModal(false);
                if (user) fetchUploads(user.username);
              }} />
            </div>
          </div>
        )}

        {/* Upload detail modal */}
        {selectedUpload && (
          <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-black/50">
            <div
              className="w-full max-w-md rounded-xl shadow-xl mx-4 overflow-hidden flex flex-col"
              style={{ backgroundColor: colors.cardBackground, maxHeight: '85%' }}
            >
              <UploadDetail
                upload={selectedUpload}
                onClose={() => setSelectedUpload(undefined)}
                onUpdate={handleUploadUpdate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle strip */}
      <button
        onClick={() => setPaneOpen(p => !p)}
        className="flex-none flex items-center justify-center rounded-none w-5 hover:opacity-80 transition-opacity"
        style={{ backgroundColor: colors.primaryLight }}
      >
        {paneOpen
          ? <ChevronRight size={13} color="#fff" />
          : <ChevronLeft size={13} color="#fff" />}
      </button>

      {/* Right pane */}
      {paneOpen && (
        <div
          className="w-72 flex-none flex flex-col border-l"
          style={{ backgroundColor: colors.cardBackground, borderColor: colors.primaryLight }}
        >
          <div
            className="px-4 py-3 text-sm font-semibold flex-none border-b"
            style={{ color: colors.textPrimary, borderColor: colors.primaryLight }}
          >
            My Observations
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
            {uploads.length === 0 ? (
              <p className="text-center text-sm mt-6" style={{ color: colors.textSecondary }}>
                No observations yet. Use the button below to submit your first marine habitat photo.
              </p>
            ) : (
              uploads.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUpload(u)}
                  className="w-full rounded-lg shadow-md overflow-hidden border text-left hover:opacity-80 transition-opacity"
                  style={{ borderColor: colors.primaryLight, backgroundColor: colors.cardBackground }}
                >
                  <img
                    src={`http://localhost:8000/files/${u.storage_filename}`}
                    alt={u.filename}
                    className="w-full h-32 object-cover"
                  />
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>
                      {u.filename}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: colors.textSecondary }}>
                      {new Date(u.timestamp).toLocaleString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-3 flex-none border-t" style={{ borderColor: colors.primaryLight }}>
            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full py-2 rounded-lg text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              style={{ backgroundColor: colors.primary }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = colors.primaryHover)}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = colors.primary)}
            >
              <Upload size={14} />
              Add Observation
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
