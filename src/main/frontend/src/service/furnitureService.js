import http, { fileHttp } from "../http-common";

const getFurniture = async ({ pageNum = 1, searchKey, searchValue } = {}) => {
	const params = { pageNum };
	if (searchKey && searchValue) {
		params.searchKey = searchKey;
		params.searchValue = searchValue;
	}

	const res = await http.get("/furniture/list", { params });
	return res.data;
};

const insertFurniture = async (params) => {
	try {
		const { dto, thumbnail, infoFiles = [], othersFiles = [] } = params;
		const formData = new FormData();

		formData.append("thumbnail", thumbnail);

		if (infoFiles !== null && infoFiles.length !== 0) {
			infoFiles.forEach((file) => {
				formData.append("infoFiles", file);
			});
		}
		if (othersFiles !== null && othersFiles.length !== 0) {
			othersFiles.forEach((file) => {
				formData.append("othersFiles", file);
			});
		}

		formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

		const res = await fileHttp.post("/furniture/add", formData);
		return res.data;
	} catch (error) {
		console.log(error);
	}
};

// const insertFurniture = async (formData) =>{
//     const res = await http.post('/furniture/add',formData, {
//         headers: {
//             "Content-Type" : "multipart/form-data"
//         }
//     })
//     return res.data
// }

const getFurnitureItem = async (f_code) => {
	const res = await http.get("/furniture/list/item", { params: { f_code } });
	return res.data;
};

const deleteFurniture = async (f_code) => {
	const res= await http.get(`/furniture/delete?f_code=${f_code}`);
	return res.data;
}

const FurnitureService = {
	getFurniture,
	insertFurniture,
	getFurnitureItem,
	deleteFurniture,
};

export default FurnitureService;
