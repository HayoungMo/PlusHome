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
		const { dto, thumbnail, infoFiles = [], othersFiles = [], 
				options = []
		 } = params;

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

		formData.append(
			"options",
			new Blob([JSON.stringify(options)], {type:"application/json"})
		)
		
		const res = await fileHttp.post("/furniture/add", formData);
		return res.data;
	} catch (error) {
		console.log(error);
	}
};

const updateFurniture = async (params) => {
	try {
		const {
			dto,
			thumbnail,
			infoFiles = [],
			othersFiles = [],
			deletedImages = []
		} = params;

		const formData = new FormData();

		if (thumbnail) {
			formData.append("thumbnail", thumbnail);
		}

		if (infoFiles.length > 0) {
			infoFiles.forEach((file) => {
				formData.append("infoFiles", file);
			});
		}

		if (othersFiles.length > 0) {
			othersFiles.forEach((file) => {
				formData.append("othersFiles", file);
			});
		}

		formData.append(
			"dto",
			new Blob([JSON.stringify(dto)], { type: "application/json" })
		);
 
		if (deletedImages.length > 0) {
			deletedImages.forEach((name) => {
				formData.append("deletedImages", name);
			});
		}

		const res = await fileHttp.post("/furniture/update", formData);
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


const increaseView = async (f_code) =>{
	if(!f_code) return;

	await http.get(`/furniture/viewCount?F_code`,{
		params: {f_code}
	})
}

const FurnitureService = {
	getFurniture,
	insertFurniture,
	getFurnitureItem,
	deleteFurniture,
	updateFurniture,
	increaseView
};

export default FurnitureService;
