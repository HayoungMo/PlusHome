import logo from "./logo.svg";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import ComponentEx from "./pages/ComponentEx";
import TestMyPage from "./pages/TestMyPage";
import ImageGetTest from "./pages/ImageGetTest";

function App() {
	const navigate = useNavigate();

	return (
		<div className="App">
			{/* <input type="button" value="post" onClick={testPost} />
			<input type="button" value="get" onClick={testGet} /> */}
			<button onClick={() => navigate("/myPage")}>로그인</button>

			<button onClick={() => navigate("/ImageGetTest")}>ImageGetTest</button>

			<Routes>
				{/* Main화면 */}
				<Route path="/" element={<ComponentEx />} />
				{/* 테스트용 마이페이지 */}
				<Route path="/myPage" element={<TestMyPage />} />

				<Route path="/ImageGetTest" element={<ImageGetTest />} />
			</Routes>
		</div>
	);
}

export default App;
