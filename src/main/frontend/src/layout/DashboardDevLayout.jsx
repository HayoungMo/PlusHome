import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardLeftbar from "./DashboardLeftbar";

import "../css/Dashboard.css";
import DashboardDevHome from "../dashboardDev/DashboardDevHome";
import UserInfo from "../dashboardDev/UserInfo";
import SalesList from "../dashboardDev/SalesList";

const DashboardDevLayout = () => {
	const [activeTab, setActiveTab] = useState("user");
	const [activeMenu, setActiveMenu] = useState("userInfo");
	const localUserData = localStorage.getItem("user");
	const userData = JSON.parse(localUserData);

	const menuMap = {
		user: [
			{
				key: "home",
				label: "관리 메인 화면",
				component: (
					<DashboardDevHome/>
				),
			},
            {
				key: "userInfo",
				label: "계정 정보",
				component: (
					<UserInfo/>
				),
			},
			{
				key:"salesList",
				label:"판매량 통계",
				component:(
					<SalesList/>

				)

			},
		],
		
	};

	const handleTabChange = (tabKey) => {
		setActiveTab(tabKey);

		const firstMenu = menuMap[tabKey]?.[0];

		if (firstMenu) {
			setActiveMenu(firstMenu.key);
		} else {
			setActiveMenu(null);
		}
	};

	const currentMenus = menuMap[activeTab] || [];

	let currentContent = null;

    currentContent = currentMenus.find((menu) => menu.key === activeMenu)?.component || null;
	

	return (
		<div className="company-layout">
			<DashboardHeader activeTab={activeTab} setActiveTab={handleTabChange} />

			<div className="company-body">
				{currentMenus.length > 0 && (
					<DashboardLeftbar
						menus={currentMenus}
						activeMenu={activeMenu}
						setActiveMenu={setActiveMenu}
					/>
				)}

				<main className="company-content">{currentContent}</main>
			</div>
		</div>
	);
};

export default DashboardDevLayout