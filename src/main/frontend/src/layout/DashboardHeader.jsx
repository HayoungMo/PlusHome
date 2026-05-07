import React from "react";

const DashboardHeader = ({ activeTab, setActiveTab }) => {
	const tabs = [
		{ key: "home", label: "메인" },
		{ key: "userInfo", label: "계정 정보" },
		{ key: "shop", label: "쇼핑몰" },
		{ key: "interior", label: "인테리어" },
	];
	return (
		<header className="header">
			<h2>Company Dashboard</h2>

			<nav className="header-tabs">
				{tabs.map((tab) => (
					<button
						key={tab.key}
						className={activeTab === tab.key ? "tab active" : "tab"}
						onClick={() => setActiveTab(tab.key)}>
						{tab.label}
					</button>
				))}
			</nav>
		</header>
	);
};

export default DashboardHeader;
