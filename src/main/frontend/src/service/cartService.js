import http from "../http-common";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
});

const addCart = (data) => {
    return http.post("/cart/add", data, {
        headers: getAuthHeaders()
    });
};

const getMyCart = () => {
    return http.get("/cart", {
        headers: getAuthHeaders()
    });
};

const getCartOptions = (c_code) => {
    return http.get("/cart/options", {
        params: { c_code },
        headers: getAuthHeaders()
    });
};

const deleteCart = (c_code) => {
    return http.delete("/cart", {
        params: { c_code },
        headers: getAuthHeaders()
    });
};

export default {
    addCart,
    getMyCart,
    deleteCart,
    getCartOptions
};
