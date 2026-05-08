import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const Header = ({ loginUser, setLoginUser, setLoginInfo }) => {
	const navigate = useNavigate();
	const [searchKeyword, setSearchKeyword] = useState("");

	const savedUser = localStorage.getItem("user");
	const userData = savedUser ? JSON.parse(savedUser) : null;
	const displayUser = loginUser || userData?.id;

	//검색
	const onSearch = (evt) => {
		evt.preventDefault();

		const keyword = searchKeyword.trim();

		if (!keyword) {
			alert("검색어를 입력해주세요");
			return;
		}

		navigate(`/search?keyword=${encodeURIComponent(keyword)}&type=all&page=1`);
		setSearchKeyword("");
	};
	
	// 로그아웃
	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		setLoginUser?.(null);
		setLoginInfo?.(null);

		navigate("/login");
	};

	return (
		<header className="site-header">
			<div className="site-header-inner">
				<Link to="/" className="site-logo">
					PlusHome
				</Link>

				<form className="site-search" onSubmit={onSearch}>
					<input
						placeholder="검색어를 입력하세요"
						value={searchKeyword}
						onChange={(evt) => setSearchKeyword(evt.target.value)}
					/>
					<button type="submit">검색</button>
				</form>

				<div className="site-user">
					{displayUser ? (
						<>
							<span>{displayUser}님</span>
							<button type="button" onClick={logout}>
								로그아웃
							</button>
						</>
					) : (
						<Link to="/login">로그인</Link>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
