// 백엔드와 데이터를 주고 받는 창구역할
import http from "../http-common";

class TestService {
	postTest(data) {
		console.log("Servic is Work");
		return http.post("/testService/testService", data);
	}

	getTest(data) {
		console.log("Servic is Work");
		return http.get("/testService/testService", { params: data });
	}
}
export default new TestService();
