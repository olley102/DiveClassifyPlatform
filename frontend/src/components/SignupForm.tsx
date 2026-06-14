import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import api from "../api/api";
import strings from "../assets/strings.json";
import type React from "react";

type FieldNames = "name" | "username" | "email" | "password";

interface SignupFormData {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface SignupFormProps {
  colors: { [keys: string]: string};
}

const SignupForm: React.FC<SignupFormProps> = ({ colors }) => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<SignupFormData>();

  const onSubmit: SubmitHandler<SignupFormData> = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    try {
      const response = await api.post("/users/", formData);

      console.log("Response:", response);
      alert("User created successfully!");
      reset();
    } catch (error: any) {
      console.error("Signup error:", error);

      const backendErrors = error.response?.data?.errors || {};

      Object.entries(backendErrors).forEach(([field, message]) => {
        if (field in data) {
          setError(field as keyof SignupFormData, {
            type: "server",
            message: message as string,
          });
        } else if (field === "general") {
          alert(message);
        }
      });
    }
  };

  const fields: { name: FieldNames; label: string; type: string; required?: boolean }[] = [
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "username", label: "Username", type: "text", required: true },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
  ];

  return (
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
            {...register(name, {
              ...(required && { required: `${label} is required` }),
              ...(name === "email" && {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email format",
                },
              }),
            })}
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

      <button
        type="submit"
        className="w-full py-2 font-semibold rounded-lg text-white transition-colors duration-200"
        style={{ backgroundColor: colors.primary }}
        onMouseOver={(e) => (
          (e.target as HTMLButtonElement).style.backgroundColor = colors.primaryHover
        )}
        onMouseOut={(e) => (
          (e.target as HTMLButtonElement).style.backgroundColor = colors.primary
        )}
      >
        Submit
      </button>

      <div className="text-center mt-3">
        <span className="text-sm" style={{ color: colors.textSecondary }}>
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="font-medium hover:underline"
            style={{ color: colors.primary }}
          >
            Log in
          </button>
        </span>
      </div>
    </form>
  );
};

export default SignupForm;
