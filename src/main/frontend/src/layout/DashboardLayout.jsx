import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardLeftbar from "./DashboardLeftbar";
import DashboardHome from "../dasboardPages/DashboardHome";
import CompanyInfo from "../dasboardPages/CompanyInfo";
import ShoppingMallInfo from "../dasboardPages/ShoppingMallInfo";
import InteriorInfo from "../dasboardPages/InteriorInfo";
import "../css/Dashboard.css";

const DashboardLayout = () => {
	const [activeTab, setActiveTab] = useState("home");

	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);

	const renderContent = () => {
		switch (activeTab) {
			case "home":
				return <DashboardHome userData={userData} />;
			case "userInfo":
				return <CompanyInfo userData={userData} />;
			case "shop":
				return <ShoppingMallInfo userData={userData} />;
			case "interior":
				return <InteriorInfo userData={userData} />;
			default:
				return <DashboardHome userData={userData} />;
		}
	};
	return (
		<div className="company-layout">
			<DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />

			<div className="company-body">
				<DashboardLeftbar />

				<main className="company-content">{renderContent()}</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
