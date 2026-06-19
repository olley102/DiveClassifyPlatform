import { useNavigate } from "react-router-dom";
import { Image } from "lucide-react";
import colors from "../assets/colors.json";

const Dashboard = () => {
  const navigate = useNavigate();

  return (  // TODO: Design Dashboard UI
    <p className="text-center text-sm text-gray-600 mt-4">
      Your uploaded dive photos will appear here 📸
    </p>
  );
};

export default Dashboard;
