import React from "react";

const DashBoardLeftbar = ({ menus, activeMenu, setActiveMenu }) => {

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
		</aside>
	);
};

export default DashBoardLeftbar;
