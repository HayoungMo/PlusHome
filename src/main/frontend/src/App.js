import logo from "./logo.svg";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import ComponentEx from "./pages/ComponentEx";
import TestMyPage from "./pages/TestMyPage";
import ImageGetTest from "./pages/ImageGetTest";
import InteriorLists from "./pages/InteriorLists";
import MainHomePage from "./pages/MainHomePage";
import InteriorArticle from "./pages/InteriorArticle";
import InteriorCreated from "./pages/InteriorCreated";
import InteriorQuestion from "./pages/InteriorQuestion";
import JoinUserPage from "./pages/JoinUserPage";
import LoginPage from "./pages/LoginPage";
import { Login } from "@mui/icons-material";
import { useState } from "react";
import ExportPDF from "./pages/ExportPDF";
import ReactDOM from "react-dom";
import { PDFViewer } from "@react-pdf/renderer";
import ExportPDFViewPage from "./pages/ExportPDFViewPage";
import WalletCharge from "./pages/WalletCharge";
import FurnitureList from "./pages/FurnitureList";
import FurnitureAddPage from "./pages/FurnitureAddPage";
import FurnitureArticle from "./pages/FurnitureArticle";
import FindPwPage from "./pages/FindPwPage";


function App() {
	const navigate = useNavigate();

	const [loginUser, setLoginUser] = useState(null);
	const [loginInfo, setLoginInfo] = useState(null);

	return (
		<div className="App">
			<Routes>
				{/* Main화면
					mui 테스트용 */}
					<Route path='/component' element={<ComponentEx />}/> 
          
        {/* 홈페이지의 첫 화면 페이지 - 4월 28일 모하영 */}
        <Route path="/" element={<MainHomePage />} />
        <Route path='/login' element={<LoginPage
        loginUser={loginUser}
        setLoginUser={setLoginUser}
        setLoginInfo={setLoginInfo} />}/>
        <Route path="/join" element={<JoinUserPage/>}/>
        <Route path="/findPw" element={<FindPwPage/>}/>
        
        <Route path="/wallet/charge" element={<WalletCharge/>}/>
        <Route path="/furniture/list" element={<FurnitureList/>}/>
        <Route path="/furniture/add" element={<FurnitureAddPage/>}/>
        <Route path="/furniture/article/:f_code" element={<FurnitureArticle/>}/>

        <Route path="/ImageGetTest" element={<ImageGetTest />} />
        <Route path="/interior/list" element={<InteriorLists />} />
        <Route path="/interior/article" element={<InteriorArticle />} />
        <Route path="/interior/created" element={<InteriorCreated />} />
        <Route path="/interior/question" element={<InteriorQuestion />} />
        <Route path="/exportPDF" element={<ExportPDF />} />
        <Route path="/exportPDFViewPage" element={<ExportPDFViewPage />} />
        
      </Routes>
    </div>
  );
}

export default App;
