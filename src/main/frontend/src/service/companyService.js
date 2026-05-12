import http, { fileHttp } from "../http-common";

const insertCompany = async (dto) => {
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

const updateCompany = async (dtoList) => {
	try {
		const result = await http.post("/company/update", dtoList);
		return result.data;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const deleteCompany = async (dtoList) => {
	try {
		const result = await http.post("/company/delete", dtoList);
		return result.data;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const CompanyService = { insertCompany, reloadUserData, updateCompany, deleteCompany };

export default CompanyService;
