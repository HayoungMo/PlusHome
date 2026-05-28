import http from "../http-common";

const getOrderAgeGenderStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getOrderAgeGenderStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "연령 및 성별 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getBuyerAgeGenderStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getBuyerAgeGenderStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "구매자 연령 및 성별 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getStatusHourlyStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getStatusHourlyStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상태 변경 시간대 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getCartHourlyStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getCartHourlyStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "장바구니 시간대 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getOrderElapsedTimeStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getOrderElapsedTimeStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "주문 소요 시간 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductOverviewStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductOverviewStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상품 등록 현황 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductSalesStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductSalesStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상품별 판매 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductRevenueStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductRevenueStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상품별 매출 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductEngagementConversionStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductEngagementConversionStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "조회수 및 전환율 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductReviewStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductReviewStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상품별 리뷰 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductQuestionStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductQuestionStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상품 문의 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductOptionStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductOptionStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상품 옵션 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductDeliveryClaimStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductDeliveryClaimStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "배송 및 클레임 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getCategoryProductStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getCategoryProductStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "카테고리별 상품 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductDisplayStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductDisplayStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "숨김 및 노출 상품 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getBenefitUsageStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getBenefitUsageStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "쿠폰 및 포인트 사용 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getBenefitUseTypeStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getBenefitUseTypeStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "쿠폰 및 포인트 사용 유형 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getProductBenefitTopStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getProductBenefitTopStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "상품별 쿠폰 및 포인트 사용률 TOP 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const getBenefitRevenueImpactStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getBenefitRevenueImpactStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "쿠폰 및 포인트 매출 영향 통계 조회 시도 중 에러가 발생하였습니다.",
		};
	}
};

const DashboardService = {
	getOrderAgeGenderStats,
	getBuyerAgeGenderStats,
	getStatusHourlyStats,
	getCartHourlyStats,
	getOrderElapsedTimeStats,
	getProductOverviewStats,
	getProductSalesStats,
	getProductRevenueStats,
	getProductEngagementConversionStats,
	getProductReviewStats,
	getProductQuestionStats,
	getProductOptionStats,
	getProductDeliveryClaimStats,
	getCategoryProductStats,
	getProductDisplayStats,
	getBenefitUsageStats,
	getBenefitUseTypeStats,
	getProductBenefitTopStats,
	getBenefitRevenueImpactStats,
};

export default DashboardService;
