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

const cancelOrder = (c_code) => {
    return http.post("/payment/cancel", { c_code }, {
        headers: getAuthHeaders()
    });
};

const confirmOrder = (c_code) => {
    return http.post("/payment/confirm", { c_code }, {
        headers: getAuthHeaders()
    });
};

const checkStock = async (c_codes) => {
  const res = await http.post(
    "/payment/check-stock",
    { c_codes },
    { headers: getAuthHeaders() }
  );

  return res.data;
};

export default {
    pay,
    getMyOrders,
    getOrderDetail,
    cancelOrder,
    confirmOrder,
    checkStock
};
