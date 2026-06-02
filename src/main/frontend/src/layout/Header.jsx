import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { GiShoppingCart } from "react-icons/gi";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { GiPartyPopper } from "react-icons/gi";
import { FcCloseUpMode } from "react-icons/fc";

const Header = ({ loginUser, setLoginUser, setLoginInfo }) => {
	const navigate = useNavigate();
	const [searchKeyword, setSearchKeyword] = useState("");
	//헤더 사라지고 등장하는거
	const [isHeaderHidden, setIsHeaderHidden] = useState(false);
	const lastScrollY = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			if(currentScrollY < 80) {
				setIsHeaderHidden(false);
			} else {
				setIsHeaderHidden(currentScrollY > lastScrollY.current);
			}
			lastScrollY.current = currentScrollY;
		};

		window.addEventListener("scroll", handleScroll,{passive: true});

		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	},[]);
	


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
		<header className={`shop-header ${isHeaderHidden ? "shop-header--hidden" : ""}`}>
			<div className="shop-header-inner">
				<div className="shop-brand-area">
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

					<nav className="shop-primary-tabs">
						<NavLink to="/furniture/list">쇼핑</NavLink>
						<NavLink to="/interior/list">인테리어</NavLink>
					</nav>
				</div>
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
						to="/event" 
						className="shop-icon-link" 
						title="Event" 
						aria-label="Event"
					>
  						<FcCloseUpMode size={24}/>
					</Link>


					<Link
						to="/component"
						className="shop-icon-link"
						title="MUI sample"
						aria-label="MUI sample"
					>
						<WidgetsIcon fontSize="medium" />
					</Link>

					<Link
						to="/cart"
						className="shop-icon-link"
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
