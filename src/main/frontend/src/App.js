import "./App.css";
import PageLayout from "./layout/PageLayout";
import { Routes, Route } from "react-router-dom";
import ComponentEx from "./pages/ComponentEx";
import ImageGetTest from "./pages/ImageGetTest";
import InteriorLists from "./pages/InteriorLists";
import MainHomePage from "./pages/MainHomePage";
import InteriorArticle from "./pages/InteriorArticle";
import InteriorCreated from "./pages/InteriorCreated";
import InteriorQuestion from "./pages/InteriorQuestion";
import JoinUserPage from "./pages/JoinUserPage";
import LoginPage from "./pages/LoginPage";
import { useState } from "react";
import ExportPDF from "./pages/ExportPDF";
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
import FreeBoardListPage from "./pages/FreeBoardListPage";
import FreeBoardWritePage from "./pages/FreeBoardWritePage";
import FreeBoardArticlePage from "./pages/FreeBoardArticlePage";
import FreeBoardEditPage from "./pages/FreeBoardEditPage";
import UserMyPage from "./pages/UserMyPage";
import DevDashboard from "./dashboardDev/DevDashBoard";
import FurnitureAddReview from "./pages/FurnitureAddReview";
import CartPage from "./pages/CartPage";

function App() {
    const [loginUser, setLoginUser] = useState(null);
    const [loginInfo, setLoginInfo] = useState(null);

    return (
        <div className="App">
            <Routes>
                {/* PageLayout 적용 페이지 그룹 */}
                <Route
                    element={
                        <PageLayout
                            loginUser={loginUser}
                            setLoginUser={setLoginUser}
                            setLoginInfo={setLoginInfo}
                        />
                    }
                >
                    {/* 메인 */}
                    <Route
                        path="/"
                        element={
                            <MainHomePage
                                loginUser={loginUser}
                                setLoginUser={setLoginUser}
                                setLoginInfo={setLoginInfo}
                            />
                        }
                    />

                    {/* 유저 마이페이지 */}
                    <Route
                        path="/userpage"
                        element={
                            <UserMyPage
                                loginUser={loginUser}
                                setLoginUser={setLoginUser}
                                loginInfo={loginInfo}
                                setLoginInfo={setLoginInfo}
                            />
                        }
                    />

                    {/* 검색 */}
                    <Route path="/search" element={<SearchPage />} />

                    {/* 가상 머니 충전 */}
                    <Route path="/wallet/charge" element={<WalletCharge />} />

                    {/* 장바구니 */}
                    <Route path="/cart" element={<CartPage />} />

                    {/* 가구/쇼핑 */}
                    <Route path="/furniture/list" element={<FurnitureList />} />
                    <Route path="/furniture/add" element={<FurnitureAddPage />} />
                    <Route path="/furniture/article/:f_code" element={<FurnitureArticle />} />
                    <Route path="/furniture/update/:f_code" element={<FurnitureUpdatePage />} />
                    <Route path="/furniture/review/:f_code" element={<FurnitureAddReview />} />

                    {/* 인테리어 */}
                    <Route path="/interior/list/company" element={<InteriorLists />} />
                    <Route path="/interior/list/review" element={<InteriorAllReivew />} />
                    <Route path="/interior/list/example" element={<InteriorAllExample />} />
                    <Route path="/interior/article" element={<InteriorArticle />} />
                    <Route path="/interior/created" element={<InteriorCreated />} />
                    <Route path="/interior/updated" element={<InteriorUpdateAll />} />
                    <Route path="/interior/question" element={<InteriorQuestion />} />
                    <Route path="/interior/review" element={<InteriorReview />} />
                    <Route path="/interior/mypage" element={<InteriorMyPage />} />
                    <Route path="/interior/chart" element={<InteriorChart />} />

                   {/* 자유게시판 */}
                    <Route path="/freeboard/list" element={<FreeBoardListPage />} />
                    <Route path="/freeboard/write" element={<FreeBoardWritePage />} />
                    <Route path="/freeboard/article/:boardId" element={<FreeBoardArticlePage />} />
                    <Route path="/freeboard/edit/:boardId" element={<FreeBoardEditPage />} />

                    {/* 테스트/기타 */}
                    <Route path="/component" element={<ComponentEx />} />
                    <Route path="/ImageGetTest" element={<ImageGetTest />} />
                    <Route path="/exportPDF" element={<ExportPDF />} />
                    <Route path="/exportPDFViewPage" element={<ExportPDFViewPage />} />
                </Route>

                {/* PageLayout 없는 단독 페이지 */}
                <Route
                    path="/login"
                    element={
                        <LoginPage
                            loginUser={loginUser}
                            setLoginUser={setLoginUser}
                            setLoginInfo={setLoginInfo}
                        />
                    }
                />
                <Route path="/join" element={<JoinUserPage />} />
                <Route path="/findId" element={<FindIdPage />} />
                <Route path="/findPw" element={<FindPwPage />} />
                <Route path="/CompanyDashboard" element={<CompanyDashboard />} />
                <Route path="/DevDashboard" element={<DevDashboard />} />
            </Routes>
        </div>
    );
}

export default App;