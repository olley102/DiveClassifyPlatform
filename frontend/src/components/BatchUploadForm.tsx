import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../api/api';
import colors from '../assets/colors.json';

interface FormData {
  lat: string;
  lon: string;
}

type ItemStatus = 'pending' | 'uploading' | 'classifying' | 'done' | 'error';

interface BatchItem {
  file: File;
  status: ItemStatus;
  label?: string;
  error?: string;
}

interface BatchUploadFormProps {
  onSuccess: () => void;
}

const BatchUploadForm = ({ onSuccess }: BatchUploadFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const updateItem = (index: number, patch: Partial<BatchItem>) =>
    setItems(prev => prev.map((item, i) => i === index ? { ...item, ...patch } : item));

  const onSubmit = async (data: FormData) => {
    if (files.length === 0) return;
    setItems(files.map(f => ({ file: f, status: 'pending' })));
    setRunning(true);

    for (let i = 0; i < files.length; i++) {
      updateItem(i, { status: 'uploading' });
      let uploadId: number;
      try {
        const fd = new FormData();
        fd.append('file', files[i]);
        fd.append('lat', data.lat);
        fd.append('lon', data.lon);
        const res = await api.post('/uploads/', fd);
        uploadId = res.data.id;
      } catch {
        updateItem(i, { status: 'error', error: 'Upload failed' });
        continue;
      }

      updateItem(i, { status: 'classifying' });
      try {
        const res = await api.put(`/uploads/${uploadId}/classify`);
        updateItem(i, { status: 'done', label: res.data.label ?? undefined });
      } catch {
        updateItem(i, { status: 'error', error: 'Classification failed' });
      }
    }

    setRunning(false);
    setDone(true);
  };

  if (items.length === 0) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium mb-1 text-sm" style={{ color: colors.textPrimary }}>Photos</label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png"
            onChange={e => setFiles(Array.from(e.target.files ?? []))}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none text-sm"
            style={{ borderColor: colors.primaryLight, backgroundColor: colors.cardBackground }}
          />
          {files.length > 0 && (
            <p className="mt-1 text-xs" style={{ color: colors.textSecondary }}>
              {files.length} photo{files.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {[
          { name: 'lat' as const, label: 'Latitude' },
          { name: 'lon' as const, label: 'Longitude' },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block font-medium mb-1 text-sm" style={{ color: colors.textPrimary }}>{label}</label>
            <input
              type="text"
              placeholder={label}
              {...register(name, { required: `${label} is required` })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none text-sm"
              style={{
                borderColor: errors[name] ? colors.error : colors.primaryLight,
                color: colors.textSecondary,
                backgroundColor: colors.cardBackground,
              }}
            />
            {errors[name] && (
              <p className="mt-1 text-xs" style={{ color: colors.error }}>{errors[name]?.message}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={files.length === 0}
          className="w-full py-2 font-semibold rounded-lg text-white text-sm transition-colors"
          style={{ backgroundColor: files.length === 0 ? colors.primaryLight : colors.primary }}
          onMouseOver={e => files.length > 0 && (e.currentTarget.style.backgroundColor = colors.primaryHover)}
          onMouseOut={e => files.length > 0 && (e.currentTarget.style.backgroundColor = colors.primary)}
        >
          Submit & Classify {files.length > 0 ? `(${files.length})` : ''}
        </button>
      </form>
    );
  }

  const successCount = items.filter(i => i.status === 'done').length;
  const errorCount = items.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-lg border"
            style={{ borderColor: colors.primaryLight }}
          >
            <StatusIcon status={item.status} />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate" style={{ color: colors.textPrimary }}>{item.file.name}</p>
              <p className="text-xs capitalize" style={{ color: item.status === 'error' ? colors.error : colors.textSecondary }}>
                {statusText(item)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {done && (
        <>
          <p className="text-sm text-center" style={{ color: colors.textSecondary }}>
            {successCount} observation{successCount !== 1 ? 's' : ''} submitted & classified{errorCount > 0 ? `, ${errorCount} failed` : ''}
          </p>
          <button
            onClick={onSuccess}
            className="w-full py-2 font-semibold rounded-lg text-white text-sm"
            style={{ backgroundColor: colors.primary }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = colors.primaryHover)}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = colors.primary)}
          >
            Done
          </button>
        </>
      )}
    </div>
  );
};

const statusText = (item: BatchItem) => {
  switch (item.status) {
    case 'pending':     return 'Waiting…';
    case 'uploading':   return 'Uploading…';
    case 'classifying': return 'Classifying…';
    case 'done':        return item.label ? `Done — ${item.label}` : 'Done';
    case 'error':       return item.error ?? 'Error';
  }
};

const StatusIcon = ({ status }: { status: ItemStatus }) => {
  if (status === 'done')
    return <CheckCircle size={18} color={colors.success} className="flex-none" />;
  if (status === 'error')
    return <XCircle size={18} color={colors.error} className="flex-none" />;
  if (status === 'uploading' || status === 'classifying')
    return <Loader size={18} color={colors.primaryLight} className="flex-none animate-spin" />;
  return (
    <div
      className="flex-none w-[18px] h-[18px] rounded-full border-2"
      style={{ borderColor: colors.primaryLight }}
    />
  );
};

export default BatchUploadForm;
