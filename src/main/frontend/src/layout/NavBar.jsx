import { NavLink } from "react-router-dom";

const NavBar = () => {
	return (
		<nav className="shop-nav">
			<div className="shop-nav-inner">
				<NavLink to="/furniture/list">쇼핑</NavLink>
				<NavLink to="/interior/list">인테리어</NavLink>
				<NavLink to="/interior/question">상담신청</NavLink>
				<NavLink to="/freeboard/list">자유게시판</NavLink>
				<NavLink to="/event">이벤트</NavLink>
				<NavLink to="/component">MUI 예시</NavLink>
			</div>
		</nav>
	);
};

export default NavBar;
