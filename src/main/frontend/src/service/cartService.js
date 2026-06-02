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

const getAuthHeaders = () => ({
	Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const addCart = (data) => {
	return http.post("/cart/add", data, {
		headers: {
			Authorization: `Bearer ${localStorage.getItem("token")}`
		}
	});
};

const getMyCart = () => {
	return http.get("/cart", {
		headers: getAuthHeaders(),
	});
};

const getCartOptions = (c_code) => {
	return http.get("/cart/options", {
		params: { c_code },
		headers: getAuthHeaders(),
	});
};

const getAvailablePoint = () => {
	return http.get("/cart/point", {
		headers: getAuthHeaders(),
	});
};

const deleteCart = (c_code) => {
	return http.delete("/cart", {
		params: { c_code },
		headers: getAuthHeaders(),
	});
};

const updateCartCount = (data) =>{
	return http.patch("/cart/count", data, {
		headers: getAuthHeaders(),
	})
}

const CartService = {
	getOrderFurnitureList,
	changeDeliveryState,
	addCart,
	getMyCart,
	deleteCart,
	getCartOptions,
	getAvailablePoint,
	updateCartCount,
};

export default CartService;
