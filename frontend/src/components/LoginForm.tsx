import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import api from "../api/api";
import strings from "../assets/strings.json";
import type React from "react";

type FieldNames = "username" | "password";

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormProps {
  colors: { [keys: string]: string};
}

const LoginForm: React.FC<LoginFormProps> = ({ colors }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    setLoginError(null);
    setLoading(true);

    try {
      const response = await api.post("/token", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Response:", response);
      alert("Logged in successfully!");
      setLoading(false);
      // store token
      reset();
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response?.status === 401) {
        setLoginError(error.response.data.detail);
      } else {
        setLoginError("An unexpected error occured. Please try again.");
      }
    } finally {
        setLoading(false);
    }
  };

  const fields: { name: FieldNames; label: string; type: string; required?: boolean }[] = [
    { name: "username", label: "Username", type: "text", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ];

  return (
    <div>
      <h2 className="text-center text-2xl mt-4 font-bold">{strings.loginTitle}</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        {fields.map(({ name, label, type, required }) => (
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
              {...register(name, { required: `${label} is required` })}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              style={{
                color: colors.textSecondary,
                borderColor: errors[name] ? colors.error : colors.primaryLight,
                backgroundColor: "#fff"
              }}
            />
            {errors[name] && (
              <p className="mt-1 text-sm" style={{ color: colors.error }}>
                {errors[name]?.message}
              </p>
            )}
          </div>
        ))}

        {/* Backend error */}
        {loginError && (
            <p className="text-center text-sm" style={{ color: colors.error }}>
                {loginError}
            </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 font-semibold rounded-lg text-white transition-colors duration-200"
          style={{ backgroundColor: (loading ? colors.primaryHover : colors.primary) }}
          onMouseOver={(e) => (
            (e.target as HTMLButtonElement).style.backgroundColor = colors.primaryHover
          )}
          onMouseOut={(e) => (
            (e.target as HTMLButtonElement).style.backgroundColor = (loading ? colors.primaryHover : colors.primary)
          )}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
