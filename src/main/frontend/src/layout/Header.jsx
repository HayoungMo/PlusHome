import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { GiShoppingCart } from "react-icons/gi";

const Header = ({ loginUser, setLoginUser, setLoginInfo }) => {
	const navigate = useNavigate();
	const [searchKeyword, setSearchKeyword] = useState("");

	const savedUser = localStorage.getItem("user");
	const userData = savedUser ? JSON.parse(savedUser) : null;
	const displayUser = loginUser?.id || loginUser?.u_id || userData?.id || userData?.u_id;

	const onSearch = (evt) => {
		evt.preventDefault();

		const keyword = searchKeyword.trim();

		if (keyword) {
			navigate(`/search?keyword=${encodeURIComponent(keyword)}&type=all&page=1`);
		} else {
			navigate(`/search?type=all&page=1`);
		}

		setSearchKeyword("");
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");

		setLoginUser?.(null);
		setLoginInfo?.(null);

		navigate("/login");
	};

	return (
		<header className="shop-header">
			<div className="shop-header-inner">
				<a 
					href="/"
					className="shop-logo"
					onClick={(evt) => {
						evt.preventDefault();
						window.location.href = "/";
					}}
				>
					PlusHome
				</a>

				<form className="shop-search" onSubmit={onSearch}>
					<input
						placeholder="검색어를 입력하세요"
						value={searchKeyword}
						onChange={(evt) => setSearchKeyword(evt.target.value)}
					/>
					<button type="submit">검색</button>
				</form>

				<div className="shop-user">
					<Link
						to="/cart"
						title="장바구니"
						style={{
							display: "inline-flex",
							alignItems: "center",
							color: "inherit",
							textDecoration: "none",
							marginRight: "12px"
						}}
					>
						<GiShoppingCart size={32} />
					</Link>

					{displayUser ? (
						<>
							<span>
								<Link to="/userpage">
									{displayUser}님
								</Link>
							</span>
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
