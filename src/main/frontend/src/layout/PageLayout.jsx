import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavBar from "./NavBar";
import Footer from "./Footer";
import "../css/PageLayout.css";
import FloatingButtonMui from "../components/FloatingButtonMui";

const PageLayout = ({ loginUser, setLoginUser, setLoginInfo }) => {
	// 로그인
	return (
		<div className="page-layout">
			<Header
				loginUser={loginUser}
				setLoginUser={setLoginUser}
				setLoginInfo={setLoginInfo}
			/>

			<NavBar />

			<main className="layout-content">
				<Outlet />
			</main>

			<Footer />
			<FloatingButtonMui/>
		</div>
	);
};

export default PageLayout;
