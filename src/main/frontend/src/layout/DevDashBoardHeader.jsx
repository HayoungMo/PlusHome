import React from "react";

const DevDashboardHeader = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { key: "user", label: "현황 관리" },
        { key: "shop", label: "쇼핑몰 관리" },
        { key: "interior", label: "인테리어 관리" },
    ];

    return (
        <header className="header">
            <h2>Developer Dashboard</h2>

            <nav className="header-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        className={activeTab === tab.key ? "tab active" : "tab"}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </header>
    );
};

export default DevDashboardHeader;
