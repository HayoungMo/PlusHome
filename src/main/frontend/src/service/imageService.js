import http from "../http-common";

//테스트 데이터 생성 (POST)
const getThumbnail = async () => {
	try {
		console.log("Service: Sending POST request");
		const response = await http.post("/image/getImage");
		return response; // 필요한 데이터만 반환
	} catch (error) {
		console.error("API Error:", error);
		throw error; // 에러를 호출부로 전파
	}
};

const getImageFormDB = async () => {
	try {
		console.log("Service: Sending POST request");
		const response = await http.post("/image/getImageFormDB");
		return response;
	} catch (error) {
		console.error("API Error:", error);
		throw error; // 에러를 호출부로 전파
	}
};

const ImageService = {
	getThumbnail,
	getImageFormDB,
};

export default ImageService;
