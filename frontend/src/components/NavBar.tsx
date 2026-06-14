import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, User, Compass } from "lucide-react";
import colors from "../assets/colors.json";

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: "/map", label: "Map", icon: <MapPin size={22} /> },
        { path: "/discover", label: "Discover", icon: <Compass size={22} /> },
        { path: "/dashboard", label: "Dashboard", icon: <User size={22} /> }
    ];

    return (
        <nav
            className="flex items-center h-14 gap-2"
            style={{ backgroundColor: colors.cardBackground }}
        >
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="flex-1 flex flex-col items-center gap-0.5 text-xs font-medium transition-all p-2"
                        style={{
                            color: isActive ? colors.primary : colors.textSecondary
                        }}
                    >
                        <div>{item.icon}</div>
                        {item.label}
                    </button>
                );
            })}
        </nav>
    );
};

export default NavBar;
