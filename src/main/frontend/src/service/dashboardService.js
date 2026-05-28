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

const getInteriorBookingOverviewStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorBookingOverviewStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 상담/예약 현황 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorBookingMonthlyStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorBookingMonthlyStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 월별 상담 요청 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorBookingLongStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorBookingLongStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 상담 소요 기간 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorBookingConversionStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorBookingConversionStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 상담 전환율 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorInvoiceStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorInvoiceStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 견적서 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorContractStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorContractStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 계약 금액 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorMonthlyContractStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorMonthlyContractStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 월별 계약 금액 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorInvoiceItemStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorInvoiceItemStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 견적 항목 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorScheduleStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorScheduleStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 시공 일정 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorMonthlyScheduleStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorMonthlyScheduleStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 월별 시공 일정 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorCustomerStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorCustomerStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 고객 분석 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorRepeatCustomerStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorRepeatCustomerStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 재상담 고객 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorAnswerTypeStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorAnswerTypeStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 상담 답변 유형 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorAnswerBudgetAreaStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorAnswerBudgetAreaStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 예산/평수 답변 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorAnswerSpaceStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorAnswerSpaceStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 요청 공간 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorReviewStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorReviewStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 리뷰 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorMonthlyReviewStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorMonthlyReviewStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 월별 리뷰 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorPortfolioStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorPortfolioStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 포트폴리오 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorExampleTagStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorExampleTagStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 시공 사례 태그 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorRecentExampleStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorRecentExampleStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 최근 시공 사례 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorInterestStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorInterestStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 찜/관심도 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorProfileCompletionStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorProfileCompletionStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 프로필 완성도 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorRiskStats = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorRiskStats", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 운영 리스크 통계 조회 중 오류가 발생했습니다.",
		};
	}
};

const getInteriorRiskList = async (dto) => {
	try {
		const result = await http.post("/dashboard/getInteriorRiskList", dto);
		return result.data;
	} catch (err) {
		return {
			success: false,
			error: err + "",
			message: "인테리어 운영 리스크 목록 조회 중 오류가 발생했습니다.",
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
	getInteriorBookingOverviewStats,
	getInteriorBookingMonthlyStats,
	getInteriorBookingLongStats,
	getInteriorBookingConversionStats,
	getInteriorInvoiceStats,
	getInteriorContractStats,
	getInteriorMonthlyContractStats,
	getInteriorInvoiceItemStats,
	getInteriorScheduleStats,
	getInteriorMonthlyScheduleStats,
	getInteriorCustomerStats,
	getInteriorRepeatCustomerStats,
	getInteriorAnswerTypeStats,
	getInteriorAnswerBudgetAreaStats,
	getInteriorAnswerSpaceStats,
	getInteriorReviewStats,
	getInteriorMonthlyReviewStats,
	getInteriorPortfolioStats,
	getInteriorExampleTagStats,
	getInteriorRecentExampleStats,
	getInteriorInterestStats,
	getInteriorProfileCompletionStats,
	getInteriorRiskStats,
	getInteriorRiskList,
};

export default DashboardService;
