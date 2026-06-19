import LoginForm from "../components/LoginForm";
import colors from "../assets/colors.json";

const LoginPage = () => {
  return (
    <div
      className="w-full max-w-md p-6 m-8 rounded-lg shadow-md"
      style={{ backgroundColor: colors.cardBackground }}
    >
      <LoginForm />
    </div>
  )
}

export default LoginPage;
