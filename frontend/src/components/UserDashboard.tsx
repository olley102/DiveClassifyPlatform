import { useEffect, useState } from 'react';
import api from '../api/api';

interface Upload {
  id: number;
  filename: string;
  lat: number;
  lon: number;
}

const UserDashboard = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);

  useEffect(() => {
    api.get('/uploads/').then(res => setUploads(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2>User Dashboard</h2>
      <ul>
        {uploads.map(u => (
          <li key={u.id}>
            {u.filename} — ({u.lat}, {u.lon})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
