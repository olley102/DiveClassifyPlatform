import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import api from '../api/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface Upload {
  id: number;
  lat: number;
  lon: number;
  filename: string;
  notes?: string;
}

const MapView = () => {
  const [uploads, setUploads] = useState<Upload[]>([]);

  useEffect(() => {
    api.get('/uploads/').then(res => setUploads(res.data));
  }, []);

  return (
    <div className="w-full h-[600px]">
      <MapContainer center={[50, -4]} zoom={6} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {uploads.map(u => (
          <Marker
            key={u.id}
            position={[u.lat, u.lon]}
            icon={L.icon({ iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png' })}
          >
            <Popup>
              <strong>{u.filename}</strong>
              <br />
              Lat: {u.lat}, Lon: {u.lon}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
