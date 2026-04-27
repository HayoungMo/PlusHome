import logo from "./logo.svg";
import "./App.css";
import testService from "./service/testService";

const testS = () => {
	testService
		.postTest({ text: "test" })
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
			<input type="button" value="test" onClick={testS} />
		</div>
	);
}

export default App;
