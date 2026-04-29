import http, { fileHttp } from "../http-common";

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
		// Blob :	formData에 object 넣으면 깨지는 거 방지
		// 			Spring이 DTO/DTO List로 자동변환 가능
		//			JSON인걸 명시한다고 함  :p
		const formData = new FormData();
		dataList.forEach((element) => {
			formData.append("files", element.file);
		});
		// dataList.foreach((item) => {formData.append("files", item.file);});

		const dtoList = dataList.map((item) => ({
			img_kind: item.img_kind,
			img_tag: item.img_tag,
			dir_a: item?.dir_a,
			dir_b: item?.dir_b,
			dir_c: item?.dir_c,
			dir_d: item?.dir_d,
			dir_e: item?.dir_e,
			img_idx: item?.img_idx,
		}));

		console.log(dtoList);

		formData.append(
			"dtoList",
			new Blob([JSON.stringify(dtoList)], { type: "application/json" }),
		);
		await fileHttp.post("/image/insertImage", formData).then((res) => {
			console.log(res);
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
