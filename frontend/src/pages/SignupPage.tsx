import SignupForm from "../components/SignupForm";
import colors from "../assets/colors.json";

const SignupPage = () => {
  return (
    <div
      className="w-full max-w-md p-6 m-8 rounded-lg shadow-md"
      style={{ backgroundColor: colors.cardBackground }}
    >
      <SignupForm />
    </div>
  )
}

export default SignupPage;
