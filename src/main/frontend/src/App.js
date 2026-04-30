import logo from "./logo.svg";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import ComponentEx from "./pages/ComponentEx";
import TestMyPage from "./pages/TestMyPage";
import ImageGetTest from "./pages/ImageGetTest";
import MainHomePage from "./pages/MainHomePage";
import InteriorArticle from "./pages/InteriorArticle";
import InteriorCreated from "./pages/InteriorCreated";
import InteriorQuestion from "./pages/InteriorQuestion";
import JoinUserPage from "./pages/JoinUserPage";
import LoginPage from "./pages/LoginPage";
import { Login } from "@mui/icons-material";
import { useState } from "react";

function App() {
	const navigate = useNavigate();

  const [loginUser, setLoginUser] = useState(null);
  const [loginInfo, setLoginInfo] = useState(null);

	return (
    <div className="App">
      <button onClick={() => navigate('/ImageGetTest')}>ImageGetTest</button>
      
      


      <Routes>
        {/* Main화면
					<Route path='/' element={<ComponentEx/>}/> 
					테스트용 마이페이지 */}
          
        {/* 홈페이지의 첫 화면 페이지 - 4월 28일 모하영 */}
        <Route path="/" element={<MainHomePage />} />
        <Route path='/login' element={<LoginPage
        loginUser={loginUser}
        setLoginUser={setLoginUser}
        setLoginInfo={setLoginInfo} />}/>
        <Route path="/join" element={<JoinUserPage/>}/>
       
        <Route path="/ImageGetTest" element={<ImageGetTest />} />
        
        <Route path="/interiorarticle" element={<InteriorArticle />} />
        <Route path="/interiorcreated" element={<InteriorCreated />} />
        <Route path="/interiorquestion" element={<InteriorQuestion />} />
      </Routes>
    </div>
  );
}

export default App;
