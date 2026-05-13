import http from "../http-common";

const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
});

const pay = (data) => {
    return http.post("/payment", data, {
        headers: getAuthHeaders()
    });
};

const getMyOrders = () => {
    return http.get("/payment/orders", {
        headers: getAuthHeaders()
    });
};

const getOrderDetail = (c_code) => {
    return http.get("/payment/order", {
        params: { c_code },
        headers: getAuthHeaders()
    });
};

export default {
    pay,
    getMyOrders,
    getOrderDetail
};
