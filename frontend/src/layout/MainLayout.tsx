import NavBar from "../components/NavBar";
import colors from "../assets/colors.json";
import type React from "react";

interface MainLayoutProps {
    header?: React.ReactNode;
    children: React.ReactNode;
    floatingButton?: React.ReactNode;
    scrollable?: boolean;
}

const MainLayout = ({
    header,
    children,
    floatingButton,
    scrollable = true
}: MainLayoutProps) => {
    return (
        <div className="flex flex-col flex-grow h-full min-h-0 relative">
            {/* Custom header (if provided) */}
            {header && (
                <div
                    className="border-b px-4 py-3 flex-none"
                    style={{ borderColor: `${colors.primaryLight}30` }}
                >
                    {header}
                </div>
            )}

            {/* Main content */}
            <div
                className={`flex-grow px-4 py-3 flex flex-col min-h-0 ${
                    scrollable ? "overflow-y-auto" : "overflow-hidden"
                }`}
            >
                {children}
            </div>

            {/* Optional floating button */}
            {floatingButton && (
                <div className="absolute bottom-16 right-6">{floatingButton}</div>
            )}

            {/* Navbar at bottom */}
            <div className="border-t flex-none" style={{ borderColor: `${colors.primaryLight}30` }}>
                <NavBar />
            </div>
        </div>
    );
};

export default MainLayout;
