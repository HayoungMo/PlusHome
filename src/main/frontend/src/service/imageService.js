import http from "../http-common";

const runGetImage = async (object, type) => {
	try {
		let result;
		let apiURL = `/image/get${type.charAt(0).toUpperCase()}${type.slice(1)}`;
		await http.post(apiURL, object).then((res) => (result = res.data));
		return result;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const insertImage = async (dataList) => {
	try {
		// Blob > formData에 object 넣으면 깨지는 거 방지
		// 			Spring이 DTO/DTO List로 자동변환 가능
		//			JSON인걸 명시한다고 함  :p
		const formData = new FormData();
		dataList.map((item, index) => {
			console.log(item);
			debugger;
			// formData.append("files", item.file);
		});
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const ImageService = {
	runGetImage,
	insertImage,
};

export default ImageService;
