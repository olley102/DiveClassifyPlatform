import { useState } from 'react';
import api from '../api/api';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [userId, setUserId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert('Please select a file');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lat', lat);
    formData.append('lon', lon);
    formData.append('user_id', userId);

    try {
      await api.post('/uploads/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Upload successful!');
    } catch (error) {
      console.error(error);
      alert('Upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto mt-6">
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <input type="text" placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} />
      <input type="text" placeholder="Longitude" value={lon} onChange={e => setLon(e.target.value)} />
      <input type="text" placeholder="User ID" value={userId} onChange={e => setUserId(e.target.value)} />
      <button type="submit">Upload</button>
    </form>
  );
};

export default UploadForm;
