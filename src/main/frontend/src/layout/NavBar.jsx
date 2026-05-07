import { NavLink } from "react-router-dom";

const NavBar = () => {
	return (
		<nav className="navbar">
			<NavLink to="/dashboard">대시보드</NavLink>
			<NavLink to="/users">회원관리</NavLink>
			<NavLink to="/invoice">인보이스</NavLink>
		</nav>
	);
};

export default NavBar;