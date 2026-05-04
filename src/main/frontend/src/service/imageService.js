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

		console.log("insertimage:")
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

const getImageData = async (params) => {
	try {
		console.log(params);
		let result;
		await http.post("/image/getList", params).then((res) => (result = res.data));
		return result;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const updateImage = async (fileList, updateInfoList = null) => {
	try {
		const formData = new FormData();
		fileList.forEach((element) => {
			const oldName = element.name;
			const oldDotIndex = oldName.lastIndexOf(".");
			const oldBaseName = oldDotIndex !== -1 ? oldName.substring(0, oldDotIndex) : oldName;

			const newOriginalName = element.file.name;
			const newDotIndex = newOriginalName.lastIndexOf(".");
			const newExt = newDotIndex !== -1 ? newOriginalName.substring(newDotIndex) : "";

			const newFileName = oldBaseName + newExt;

			const renamedFile = new File([element.file], newFileName, {
				type: element.file.type,
				lastModified: element.file.lastModified,
			});
			formData.append("files", renamedFile);
		});

		if (updateInfoList && updateInfoList.length > 0) {
			console.log();
			formData.append(
				"updateInfoList",
				new Blob([JSON.stringify(updateInfoList)], {
					type: "application/json",
				}),
			);
		}

		const res = await fileHttp.post("/image/updateImage", formData);
		console.log(res);

		return res.data;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const deleteImage = async (params) => {
	try {
		console.log(params);
		await http.post("/image/deleteImage", params);
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const updateOnlyInfo = async (params) => {
	try {
		await http.post("/image/updateImageInfo", params);
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const ImageService = {
	runGetImage,
	insertImage,
	getImageData,
	updateImage,
	deleteImage,
	updateOnlyInfo,
};

export default ImageService;
