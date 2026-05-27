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

// 조회
const selectArticleCoupon = async (data) => {
	try {
		const res = await http.post("/coupon/getArticleList", {
			c_id: data.c_id,
			catagory: data.catagory,
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

const selectCoupon = async (coupon_code) => {
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

const getCouponListByCompanyId = async (dto) => {
	try {
		const result = await http.post("/coupon/select/getCouponListByCompanyId", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
      message:"쿠폰 목록 조회 시도 중 에러가 발생하였습니다."
		};
	}
};

const CouponService = {
	insertCoupon,
	insertCouponDev,
	selectCouponList,
	selectCouponDev,
	selectArticleCoupon,
	selectCoupon,
	checkCouponDuplicate,
	updateCoupon,
	deleteCoupon,
	getCouponListByCompanyId,
};

export default CouponService;
