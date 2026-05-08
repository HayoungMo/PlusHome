import { NavLink } from "react-router-dom";

const NavBar = () => {
	return (
		<nav className="site-nav">
			<div className="site-nav-inner">
				<NavLink to="/furniture/list">쇼핑</NavLink>
				<NavLink to="/interior/list/company">인테리어</NavLink>
				<NavLink to="/interior/question">상담신청</NavLink>
				<NavLink to="/freeboard/list">자유게시판</NavLink>
				<NavLink to="/search">통합검색</NavLink>
				<NavLink to="/component">MUI 예시</NavLink>
			</div>
		</nav>
	);
};

export default NavBar;
