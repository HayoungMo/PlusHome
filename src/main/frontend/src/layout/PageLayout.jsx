import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavBar from "./NavBar";
import LeftBar from "./LeftBar";
import "../css/PageLayout.css";

const PageLayout = () => {
	return (
		<div className="page-layout">
			<Header />

			<NavBar />

			<div className="layout-body">
				<LeftBar />

				<main className="layout-content">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default PageLayout;