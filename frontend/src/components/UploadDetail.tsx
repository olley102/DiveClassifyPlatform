import { useState } from 'react';
import { Check } from 'lucide-react';
import api from '../api/api';
import colors from '../assets/colors.json';

export interface UploadItem {
  id: number;
  filename: string;
  storage_filename: string;
  timestamp: string;
  lat: number | null;
  lon: number | null;
  depth: number | null;
  notes: string | null;
  label: string | null;
  label_type: string;
  model_confidence: number | null;
  verification_status: string;
}

interface UploadDetailProps {
  upload: UploadItem;
  onClose: () => void;
  onUpdate: (updated: UploadItem) => void;
}

const statusColors: Record<string, string> = {
  pending: colors.textSecondary,
  certain: colors.success,
  flagged: '#D97706',
  rejected: colors.error,
};

const labelTypeLabel: Record<string, string> = {
  no_label: 'No label',
  user_defined: 'User defined',
  model_defined: 'Model defined',
};

const UploadDetail = ({ upload, onClose, onUpdate }: UploadDetailProps) => {
  const [current, setCurrent] = useState<UploadItem>(upload);
  const [labelInput, setLabelInput] = useState(upload.label ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const labelChanged = labelInput.trim() !== (current.label ?? '');

  const handleSaveLabel = () => {
    const trimmed = labelInput.trim();
    if (!trimmed) return;
    setSaving(true);
    setSaveError(undefined);
    api.put(`/uploads/${current.id}/label`, null, { params: { label: trimmed } })
      .then(res => {
        setCurrent(res.data);
        setLabelInput(res.data.label ?? '');
        onUpdate(res.data);
      })
      .catch(() => setSaveError('Failed to save label.'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-none border-b"
        style={{ borderColor: colors.primaryLight }}
      >
        <span className="text-base font-semibold truncate" style={{ color: colors.textPrimary }}>
          {current.filename}
        </span>
        <button
          onClick={onClose}
          className="text-lg leading-none hover:opacity-60 transition-opacity ml-2 flex-none"
          style={{ color: colors.textSecondary }}
        >
          ✕
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0">

        {/* Image */}
        <img
          src={`http://localhost:8000/files/${current.storage_filename}`}
          alt={current.filename}
          className="w-full object-cover"
          style={{ maxHeight: '220px' }}
        />

        {/* Metadata */}
        <div className="px-4 py-3 space-y-2 border-b text-sm" style={{ borderColor: colors.primaryLight }}>
          <Row label="Date" value={new Date(current.timestamp).toLocaleString()} />
          {current.lat != null && current.lon != null && (
            <Row label="Location" value={`${current.lat.toFixed(4)}, ${current.lon.toFixed(4)}`} />
          )}
          {current.depth != null && (
            <Row label="Depth" value={`${current.depth} m`} />
          )}
          {current.notes && (
            <Row label="Notes" value={current.notes} />
          )}
        </div>

        {/* Classification */}
        <div className="px-4 py-3 space-y-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textSecondary }}>
            Habitat Classification
          </p>

          <Row
            label="Label type"
            value={labelTypeLabel[current.label_type] ?? current.label_type}
          />

          {current.model_confidence != null && (
            <Row
              label="Confidence"
              value={`${(current.model_confidence * 100).toFixed(1)}%`}
            />
          )}

          <div className="flex justify-between">
            <span style={{ color: colors.textSecondary }}>Status</span>
            <span
              className="font-medium capitalize"
              style={{ color: statusColors[current.verification_status] ?? colors.textPrimary }}
            >
              {current.verification_status}
            </span>
          </div>

          {/* Label editor */}
          <div>
            <label className="block text-xs mb-1.5" style={{ color: colors.textSecondary }}>
              Label
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={labelInput}
                onChange={e => setLabelInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && labelChanged && handleSaveLabel()}
                placeholder="e.g. coral, kelp, seagrass…"
                className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                style={{
                  borderColor: colors.primaryLight,
                  color: colors.textPrimary,
                  backgroundColor: '#fff',
                }}
              />
              <button
                onClick={handleSaveLabel}
                disabled={saving || !labelChanged || !labelInput.trim()}
                className="px-3 py-1.5 rounded-lg text-white text-sm font-medium flex items-center gap-1 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: colors.primary }}
              >
                <Check size={13} />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
            {saveError && (
              <p className="mt-1 text-xs" style={{ color: colors.error }}>{saveError}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-2">
    <span style={{ color: colors.textSecondary }}>{label}</span>
    <span className="text-right" style={{ color: colors.textPrimary }}>{value}</span>
  </div>
);

export default UploadDetail;
