import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import MainLayout from "../layout/MainLayout";
import colors from "../assets/colors.json";
import UploadForm from "../components/UploadForm";

const UploadPage = () => {
  const navigate = useNavigate();

  const header = <h2 className="text-xl font-semibold">New Upload</h2>;

  const floatingButton = (
    <button
      className="rounded-full p-4 shadow-md transition-transform hover:scale-105"
      style={{ backgroundColor: colors.primary, color: "#fff" }}
      onClick={() => navigate("/dashboard")}
    >
      <X size={24} />
    </button>
  );

  return (
    <MainLayout header={header} floatingButton={floatingButton}>
      <div className="p-9">
        <UploadForm colors={colors} />
      </div>
    </MainLayout>
  );
};

export default UploadPage;
