import colors from "../assets/colors.json";
import React from "react";

interface PopupLayoutProps {
    children: React.ReactNode;
}

const PopupLayout = ({
    children
}: PopupLayoutProps) => {
    return (
        <div
            className="flex flex-col shadow-lg rounded-t-2xl overflow-hidden"
            style={{ backgroundColor: colors.primaryDark }}
        >
            <div
                className="flex-grow flex-col flex px-4 py-3 min-h-0 overflow-y-auto"
            >
                {children}
            </div>
        </div>
    );
};

export default PopupLayout;
