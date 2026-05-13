import http, { fileHttp } from "../http-common";

const insertCoupon = async (data) => {
  try {
    const res = await http.post("/coupon/insert", {
      discount : data.discount,
      coupon_end : data.coupon_end,
      coupon_max : data.coupon_max,
      coupon_info : data.coupon_info,
      id : data.id,
    });

    return {
      success: true,
    };
  } catch (err) {
    console.error(data, err);
    return {
      success: false,
    };
  }
};

// 조회
const selectCouponList = async (id) => {
  const res = await http.post("/coupon/getLists", id);

  return {
    success: true,
    data: res.data,
  };
};

const selectCoupon= async (coupon_code) => {
  const res = await http.post("/coupon/getReadData", coupon_code);

  return {
    success: true,
    data: res.data,
  };
};

// 수정
const updateCoupon = async (data) => {
  await http.post("/coupon/update", {
    id: data.id,
    discount: data.discount,
    coupon_end: data.coupon_end,
    coupon_max: data.coupon_max,
    coupon_info: data.coupon_info,
  });
  return {
    success: true,
  };
};

// 삭제
const deleteCoupon = async (coupon_code) => {
  await http.post("/coupon/delete", 
    coupon_code
  );
  return {
    success: true,
  };
};

const CouponService = {
  insertCoupon,
  selectCouponList,
  selectCoupon,
  updateCoupon,
  deleteCoupon,
};

export default CouponService;
