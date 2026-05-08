import http, { fileHttp } from "../http-common";

const insertImage = async (dto) => {
	try {
		console.log(dto);
		await http.post("/company/add", dto).then((res) => {
			console.log(res);
			return res;
		});
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const reloadUserData = async (id) => {
	try {
		console.log(id);
		const result = await http.post("/company/reloadUserData", { c_id: id });
		return result;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const CompanyService = { insertImage, reloadUserData };

export default CompanyService;
