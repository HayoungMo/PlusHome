import logo from "./logo.svg";
import "./App.css";
import { Routes, Route, useNavigate } from 'react-router-dom';
import TestService from "./service/testService";
import ComponentEx from "./pages/ComponentEx";
import TestMyPage from "./pages/TestMyPage";
import InteriorList from "./pages/InteriorList";

// 테스트 용 get, post 
// const testPost = () => {
// 	TestService.postTest({ text: "test" })
// 		.then((response) => {
// 			console.log("서버 응답:", response.data);
// 		})
// 		.catch((error) => {
// 			console.error("에러 발생:", error);
// 		});
// };

// const testGet = () => {
// 	TestService.getTest({ text: "test" })
// 		.then((response) => {
// 			console.log("서버 응답:", response.data);
// 		})
// 		.catch((error) => {
// 			console.error("에러 발생:", error);
// 		});
// };
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
        <Route path="/myPage" element={<InteriorList />} />
      </Routes>
    </div>
  );
}

export default App;
