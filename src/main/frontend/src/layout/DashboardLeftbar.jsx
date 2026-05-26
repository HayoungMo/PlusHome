import React from "react";
import { useNavigate } from "react-router-dom";

const DashBoardLeftbar = ({ menus, activeMenu, setActiveMenu }) => {
	const navigate = useNavigate()

	return (
		<aside className="leftbar">
			<ul>
				{menus.map((menu) => (
					<li
						key={menu.key}
						className={activeMenu === menu.key ? "left-menu active" : "left-menu"}
						onClick={() => setActiveMenu(menu.key)}>
						{menu.label}
					</li>
				))}
			</ul>

			<button
				type="button"
				className="leftbar-mypage-button"
				onClick={()=> navigate("/userpage")}
			>
				마이페이지
			</button>
		</aside>
	);
};

export default DashBoardLeftbar;
