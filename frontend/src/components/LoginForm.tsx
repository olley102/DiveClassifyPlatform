import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect } from "react";
import api from "../api/api";
import strings from "../assets/strings.json";
import colors from "../assets/colors.json"
import type React from "react";

type FieldNames = "username" | "password";

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

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
      const response = await api.post("/token", formData);

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      console.log("Response:", response);
      setLoading(false);
      // store token
      reset();
      navigate("/dashboard")
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
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
            {...register(name, {
              ...(required && {required: `${label} is required` })
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
          (e.target as HTMLButtonElement).style.backgroundColor = (loading ? colors.primaryLight : colors.primary)
        )}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="text-center mt-3">
        <span className="text-sm" style={{ color: colors.textSecondary }}>
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="font-medium hover:underline"
            style={{ color: colors.primary }}
          >
            Sign up
          </button>
        </span>
      </div>
    </form>
  );
};

export default LoginForm;
