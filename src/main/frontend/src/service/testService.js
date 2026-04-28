import http from "../http-common";

//테스트 데이터 생성 (POST)
const postTest = async (data) => {
	try {
		console.log("Service: Sending POST request");
		const response = await http.post("/testService/testService", data);
		return response; // 필요한 데이터만 반환
	} catch (error) {
		console.error("API Error:", error);
		throw error; // 에러를 호출부로 전파
	}
};

//테스트 데이터 조회 (GET)
const getTest = async (params) => {
	try {
		console.log("Service: Sending GET request");
		const response = await http.get("/testService/testService", { params });
		return response;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

// 객체로 묶어서 내보내기
const TestService = {
	postTest,
	getTest,
};

export default TestService;
