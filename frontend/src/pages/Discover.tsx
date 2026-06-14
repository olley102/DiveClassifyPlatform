import { useState } from "react";
import MainLayout from "../layout/MainLayout";
import { Search } from "lucide-react";
import colors from "../assets/colors.json";

const Discover = () => {
  const [search, setSearch] = useState("");

  const header = (
    <div className="flex items-center gap-2">
      <Search size={20} style={{ color: colors.textSecondary }} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search"
        className="flex-grow p-2 rounded-lg text-sm focus:outline-none"
        style={{
          backgroundColor: `${colors.primaryLight}15`,
          color: colors.textPrimary
        }}
      />
    </div>
  );

  return (
    <MainLayout header={header}>
      <p className="text-center mt-6 text-sm text-gray-600">
        Explore local dive sites, marine habitats, and community uploads 🐠🪸
      </p>
    </MainLayout>
  )
};

export default Discover;
