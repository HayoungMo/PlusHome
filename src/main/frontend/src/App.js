import logo from "./logo.svg";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import ComponentEx from "./pages/ComponentEx";
import TestMyPage from "./pages/TestMyPage";
import ImageGetTest from "./pages/ImageGetTest";
import InteriorList from "./pages/InteriorList";
import MainHomePage from "./pages/MainHomePage";

function App() {
	const navigate = useNavigate();

	return (
    <div className="App">
      {/* <input type="button" value="post" onClick={testPost} />
			<input type="button" value="get" onClick={testGet} /> 
			<button onClick={() => navigate('/myPage')}>로그인</button>*/}

      <Routes>
        {/* Main화면
					<Route path='/' element={<ComponentEx/>}/> 
					테스트용 마이페이지 */}
          
        {/* 홈페이지의 첫 화면 페이지 - 4월 28일 모하영 */}
        <Route path="/" element={<MainHomePage />} />
        
        <Route path="/myPage" element={<InteriorList />} />
      </Routes>
    </div>
  );
}

export default App;
