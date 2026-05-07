import { NavLink } from "react-router-dom";

const LeftBar = () => {
	return (
		<aside className="leftbar">
			<h3>메뉴</h3>

			<NavLink to="/dashboard">홈</NavLink>
			<NavLink to="/users">회원 목록</NavLink>
			<NavLink to="/invoice">청구서 관리</NavLink>
		</aside>
	);
};

export default LeftBar;