import logo from "./logo.svg";
import "./App.css";
import TestService from "./service/testService";

const testPost = () => {
	TestService.postTest({ text: "test" })
		.then((response) => {
			console.log("서버 응답:", response.data);
		})
		.catch((error) => {
			console.error("에러 발생:", error);
		});
};

const testGet = () => {
	TestService.getTest({ text: "test" })
		.then((response) => {
			console.log("서버 응답:", response.data);
		})
		.catch((error) => {
			console.error("에러 발생:", error);
		});
};
function App() {
	return (
		<div className="App">
			<input type="button" value="post" onClick={testPost} />
			<input type="button" value="get" onClick={testGet} />
		</div>
	);
}

export default App;
