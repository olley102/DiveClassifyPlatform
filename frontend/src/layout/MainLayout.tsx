import NavBar from "../components/NavBar";
import colors from "../assets/colors.json";
import type React from "react";

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto">{children}</div>
            <div className="border-t" style={{ borderColor: `${colors.primaryLight}30` }}>
                <NavBar />
            </div>
        </div>
    );
};

export default MainLayout;
