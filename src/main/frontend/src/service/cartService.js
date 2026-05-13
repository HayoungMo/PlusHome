import http, { fileHttp } from "../http-common";

const getOrderFurnitureList = async (dto) => {
	try {
		console.log(dto);
		const result = await http.post("/cart/getOrderFurnitureList", dto);
		return result.data;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const changeDeliveryState = async (dtoList) => {
	try {
		console.log(dtoList);
		const result = await http.post("/cart/changeDeliveryState", dtoList);
		return result.data;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
};

const CartService = { getOrderFurnitureList, changeDeliveryState };

export default CartService;
