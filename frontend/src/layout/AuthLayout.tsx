import type React from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="flex flex-col h-full max-h-full p-9">
            <div className="flex-grow overflow-y-auto scrollbar-thin
            scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
