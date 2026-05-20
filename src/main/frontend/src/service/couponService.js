import http from "../http-common";

const insertCoupon = async (data) => {
  try {
    await http.post("/coupon/insert", {
      coupon_code: data.coupon_code,
      discount: data.discount,
      coupon_end: data.coupon_end,
      coupon_max: data.coupon_max,
      coupon_info: data.coupon_info,
      id: data.id,
      coupon_type: data.coupon_type,
      coupon_catagory: data.coupon_catagory || "",
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

const insertCouponDev = async (data) => {
  try {
    const res = await http.post("/coupon/insertDev", {
      discount: data.discount,
      coupon_end: data.coupon_end,
      coupon_max: data.coupon_max,
      coupon_info: data.coupon_info,
      coupon_type: data.coupon_type,
      coupon_catagory: data.coupon_catagory || "",
    });

    return {
      data: res.data,
      success: true,
    };
  } catch (err) {
    console.error(data, err);
    return {
      success: false,
    };
  }
};

const checkCouponDuplicate = async (data) => {
  try {
    const res = await http.post("/coupon/checkData", {
      coupon_code: data.coupon_code,
      id: data.id,
    });
    if (res.data >= 1)
      return {
        success: false,
      };
    else
      return {
        success: true,
        data: res.data,
      };
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

// 조회
const selectCouponDev = async () => {
   try {
     const res = await http.get("/coupon/getListsDev");

     return {
       success: true,
       data: res.data,
     };
   } catch (err) {
     console.error(err);
     return {
       success: false,
     };
   }
};

const selectCouponList = async (id) => {
  try {
    const res = await http.post("/coupon/getLists", {
      id,
    });

    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

const selectCoupon= async (coupon_code) => {
    try {
      const res = await http.post("/coupon/getReadData", {
        coupon_code,
        id: coupon_code,
      });

      return {
        success: true,
        data: res.data,
      };
    } catch (err) {
      console.error(err);
      return {
        success: false,
      };
    }
};

// 수정
const updateCoupon = async (data) => {
  try {
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
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

// 삭제
const deleteCoupon = async (coupon_code) => {
  try {
    await http.post("/coupon/delete", coupon_code);
    return {
      success: true,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
    };
  }
};

const CouponService = {
  insertCoupon,
  insertCouponDev,
  selectCouponList,
  selectCouponDev,
  selectCoupon,
  checkCouponDuplicate,
  updateCoupon,
  deleteCoupon,
};

export default CouponService;
