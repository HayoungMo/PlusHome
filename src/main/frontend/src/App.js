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
import SearchPage from "./pages/SearchPage";
import FindIdPage from "./pages/FindIdPage";
import FurnitureUpdatePage from "./pages/FurnitureUpdatePage";
import CompanyDashboard from "./dasboardPages/CompanyDashboard";

import InteriorReview from "./pages/InteriorReview";
import InteriorChart from "./components/InteriorChart";
import InteriorUpdateAll from "./pages/InteriorUpdateAll";
import InteriorMyPage from "./components/InteriorMyPage";
import InteriorAllReivew from "./pages/InteriorAllReivew";
import InteriorAllExample from "./pages/InteriorAllExample";

function App() {
	const navigate = useNavigate();

	const [loginUser, setLoginUser] = useState(null);
	const [loginInfo, setLoginInfo] = useState(null);

	return (
		<div className="App">
			<Routes>
        {/* 홈페이지의 첫 화면 페이지 - 4월 28일 모하영 */}
        <Route path="/" element={<MainHomePage />} />
        {/* 로그인 */}
        <Route path='/login' element={<LoginPage
        loginUser={loginUser}
        setLoginUser={setLoginUser}
        setLoginInfo={setLoginInfo} />}/>
        <Route path="/join" element={<JoinUserPage/>}/>
				{/* 검색 */}
        <Route path="/search" element={<SearchPage />} /> 
        {/* mui 테스트용 */}
				<Route path='/component' element={<ComponentEx />}/> 
          
        <Route path="/findId" element={<FindIdPage/>}/>
        <Route path="/findPw" element={<FindPwPage/>}/>
        
        <Route path="/wallet/charge" element={<WalletCharge/>}/>
        <Route path="/furniture/list" element={<FurnitureList/>}/>
        <Route path="/furniture/add" element={<FurnitureAddPage/>}/>
        <Route path="/furniture/article/:f_code" element={<FurnitureArticle/>}/>
        <Route path="/furniture/update/:f_code" element={<FurnitureUpdatePage />} />

        <Route path="/ImageGetTest" element={<ImageGetTest />} />
        <Route path="/interior/list/company" element={<InteriorLists />} />
        <Route path="/interior/list/review" element={<InteriorAllReivew />} />
        <Route path="/interior/list/example" element={<InteriorAllExample/>} />
        <Route path="/interior/article" element={<InteriorArticle />} />
        <Route path="/interior/created" element={<InteriorCreated />} />
        <Route path="/interior/updated" element={<InteriorUpdateAll />} />
        <Route path="/interior/question" element={<InteriorQuestion />} />
        <Route path="/interior/review" element={<InteriorReview />} />
        <Route path="/interior/mypage" element={<InteriorMyPage />} />
        <Route path="/exportPDF" element={<ExportPDF />} />
        <Route path="/exportPDFViewPage" element={<ExportPDFViewPage />} />
        <Route path="/CompanyDashboard" element={<CompanyDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
