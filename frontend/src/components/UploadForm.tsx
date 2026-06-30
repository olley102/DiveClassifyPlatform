import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import api from "../api/api";
import type React from "react";
import colors from "../assets/colors.json"

interface UploadFormData {
  file: FileList;
  lat: string;
  lon: string;
}

interface UploadFormProps {
  onSuccess?: () => void;
}

const UploadForm = ({ onSuccess }: UploadFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadFormData>();

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onSubmit: SubmitHandler<UploadFormData> = async (data) => {
    setUploadError(null);
    setSuccessMessage(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", data.file[0]);
    formData.append("lat", data.lat);
    formData.append("lon", data.lon);

    try {
      await api.post("/uploads/", formData);

      setSuccessMessage("Upload successful!");
      reset();
      onSuccess?.();
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields: {
    name: keyof Omit<UploadFormData, "file">;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
  }[] = [
    { name: "lat", label: "Latitude", type: "text", required: true },
    { name: "lon", label: "Longitude", type: "text", required: true }
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* File input */}
      <div>
        <label
          htmlFor="file"
          className="block font-medium mb-1"
          style={{ color: colors.textPrimary }}
        >
          File
        </label>
        <input
          id="file"
          type="file"
          {...register("file", { required: "File is required" })}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none"
          style={{
            borderColor: errors.file ? colors.error : colors.primaryLight,
            backgroundColor: colors.cardBackground
          }}
        />
        {errors.file && (
          <p className="mt-1 text-sm" style={{ color: colors.error }}>
            {errors.file.message}
          </p>
        )}
      </div>

      {/* Text fields */}
      {fields.map(({ name, label, type, placeholder, required }) => (
        <div key={name}>
          <label
            htmlFor={name}
            className="block font-medium mb-1"
            style={{ color: colors.textPrimary }}
          >
            {label}
          </label>
          <input
            id={name}
            type={type}
            placeholder={placeholder || label}
            {...register(name, {
              ...(required && { required: `${label} is required` }),
            })}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none"
            style={{
              color: colors.textSecondary,
              borderColor: errors[name] ? colors.error : colors.primaryLight,
              backgroundColor: colors.cardBackground
            }}
          />
          {errors[name] && (
            <p className="mt-1 text-sm" style={{ color: colors.error }}>
              {errors[name]?.message}
            </p>
          )}
        </div>
      ))}

      {/* Error / success messages */}
      {uploadError && (
        <p className="text-center text-sm" style={{ color: colors.error }}>
          {uploadError}
        </p>
      )}
      {successMessage && (
        <p className="text-center text-sm" style={{ color: colors.success }}>
          {successMessage}
        </p>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 font-semibold rounded-lg text-white transition-colors duration-200"
        style={{
          backgroundColor: loading
            ? colors.primaryHover
            : colors.primary || "#2563eb",
        }}
        onMouseOver={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor =
            colors.primaryHover)
        }
        onMouseOut={(e) =>
          ((e.target as HTMLButtonElement).style.backgroundColor =
            loading ? colors.primaryLight : colors.primary)
        }
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
};

export default UploadForm;
