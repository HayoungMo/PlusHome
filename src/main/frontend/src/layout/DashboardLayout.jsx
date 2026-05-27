import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardLeftbar from "./DashboardLeftbar";
import CompanyInfo from "../dasboardPages/CompanyInfo";
import ShoppingMallFurnitureInfo from "../dasboardPages/ShoppingMallFurnitureInfo";
import InteriorInfo from "../dasboardPages/InteriorInfo";
import ShoppingMallOrderControl from "../dasboardPages/ShoppingMallOrderControl";
import ShoppingMallReviewControl from "../dasboardPages/ShoppingMallReviewControl";
import ShoppingMallQuestionControl from "../dasboardPages/ShoppingMallQuestionControl";
import ShoppingMallDashboard from "../dasboardPages/ShoppingMallDashboard";
import InteriorBookingControl from "../dasboardPages/InteriorBookingControl";
import InteriorDashboard from "../dasboardPages/InteriorDashboard";
import InteriorReviewControl from "../dasboardPages/InteriorReviewControl";
import InteriorScheduleControl from "../dasboardPages/InteriorScheduleControl";
import EmptyCompanyGuide from "../dasboardPages/EmptyCompanyGuide";
import ShoppingMallCouponControl from "../dasboardPages/ShoppingMallCouponControl";
import InteriorExampleControl from "../dasboardPages/InteriorExampleControl";
import InteriorConstructionControl from "../dasboardPages/InteriorConstructionControl";

import "../css/Dashboard.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const DashboardLayout = () => {
	const [activeTab, setActiveTab] = useState("user");
	const [activeMenu, setActiveMenu] = useState("userInfo");

	const getUserDataFromLocalStorage = () => {
		const localUserData = localStorage.getItem("user");
		return localUserData ? JSON.parse(localUserData) : {};
	};

	const [userData, setUserData] = useState(getUserDataFromLocalStorage);
	const [companyAddInfo, setCompanyAddInfo] = useState({ open: false, type: "" });

	const { companyList = [] } = userData;

	const refreshUserData = () => {
		setUserData(getUserDataFromLocalStorage());
	};

	if (userData?.type === "user") {
		alert("권한이 없습니다.");
	}

	const interior = companyList.filter((data) => data.c_kind === "interior") ?? [];
	const hasInterior = interior.length > 0;

	const shoppingMall = companyList.filter((data) => data.c_kind === "shop") ?? [];
	const hasShoppingMall = shoppingMall.length > 0;

	const menuMap = {
		user: [
			{
				key: "userInfo",
				label: "계정 정보",
				component: (
					<CompanyInfo
						companyAddInfo={companyAddInfo}
						setCompanyAddInfo={setCompanyAddInfo}
						refreshUserData={refreshUserData}
					/>
				),
			},
		],
		shop: hasShoppingMall
			? [
					{
						key: "product",
						label: "상품 관리",
						component: <ShoppingMallFurnitureInfo />,
					},
					{ key: "order", label: "주문 관리", component: <ShoppingMallOrderControl /> },
					{ key: "review", label: "리뷰 관리", component: <ShoppingMallReviewControl /> },
					{
						key: "question",
						label: "문의 관리",
						component: <ShoppingMallQuestionControl />,
					},
					{
						key: "coupon",
						label: "쿠폰 관리",
						component: <ShoppingMallCouponControl />,
					},
					{
						key: "mallDashboard",
						label: "쇼핑몰 통계",
						component: <ShoppingMallDashboard />,
					},
			  ]
			: [],
		interior: hasInterior
			? [
					{ key: "interiorInfo", label: "정보 관리", component: <InteriorInfo /> },
					{ key: "consult", label: "상담 관리", component: <InteriorBookingControl /> },
					{ key: "schedule", label: "일정 관리", component: <InteriorScheduleControl /> },
					{ key: "construction", label: "시공 관리", component: <InteriorConstructionControl /> },
					{ key: "example", label: "게시물 관리", component: <InteriorExampleControl /> },
					{ key: "review", label: "리뷰 관리", component: <InteriorReviewControl /> },
					{
						key: "mallDashboard",
						label: "인테리어 통계",
						component: <InteriorDashboard />,
					},
			  ]
			: [],
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

	const moveToCompanyAddPage = (type) => {
		setActiveTab("user");
		setActiveMenu("userInfo");
		setCompanyAddInfo({ open: true, type });
	};

	let currentContent = null;

	if (activeTab === "shop" && !hasShoppingMall) {
		currentContent = (
			<EmptyCompanyGuide onClick={() => moveToCompanyAddPage("shop")} type="shop" />
		);
	} else if (activeTab === "interior" && !hasInterior) {
		currentContent = (
			<EmptyCompanyGuide onClick={() => moveToCompanyAddPage("interior")} type="interior" />
		);
	} else {
		currentContent = currentMenus.find((menu) => menu.key === activeMenu)?.component || null;
	}

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

export default DashboardLayout;
