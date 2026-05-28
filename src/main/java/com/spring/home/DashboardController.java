package com.spring.home;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RequestMapping("/dashboard")
@RestController
public class DashboardController {

	@Autowired
	private DashboardService dashboardService;

	@PostMapping("/getOrderAgeGenderStats")
	public Map<String, Object> getOrderAgeGenderStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> ageGenderData = dashboardService.getOrderAgeGenderStats(params);
			return successResult(ageGenderData, "주문 고객 연령/성별 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "주문 고객 연령/성별 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getBuyerAgeGenderStats")
	public Map<String, Object> getBuyerAgeGenderStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> buyerAgeGenderData = dashboardService.getBuyerAgeGenderStats(params);
			return successResult(buyerAgeGenderData, "구매 고객 연령/성별 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "구매 고객 연령/성별 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getStatusHourlyStats")
	public Map<String, Object> getStatusHourlyStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> statusHourlyList = dashboardService.getStatusHourlyStats(params);
			return successResult(statusHourlyList, "주문 상태 변경 시간대 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "주문 상태 변경 시간대 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getCartHourlyStats")
	public Map<String, Object> getCartHourlyStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> cartHourlyList = dashboardService.getCartHourlyStats(params);
			return successResult(cartHourlyList, "장바구니 시간대 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "장바구니 시간대 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getOrderElapsedTimeStats")
	public Map<String, Object> getOrderElapsedTimeStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> elapsedTimeData = dashboardService.getOrderElapsedTimeStats(params);
			return successResult(elapsedTimeData, "주문 소요 시간 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "주문 소요 시간 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductOverviewStats")
	public Map<String, Object> getProductOverviewStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> productOverviewData = dashboardService.getProductOverviewStats(params);
			return successResult(productOverviewData, "상품 등록 현황 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품 등록 현황 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductSalesStats")
	public Map<String, Object> getProductSalesStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productSalesList = dashboardService.getProductSalesStats(params);
			return successResult(productSalesList, "상품별 판매 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 판매 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductRevenueStats")
	public Map<String, Object> getProductRevenueStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productRevenueList = dashboardService.getProductRevenueStats(params);
			return successResult(productRevenueList, "상품별 매출 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 매출 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductEngagementConversionStats")
	public Map<String, Object> getProductEngagementConversionStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> engagementList = dashboardService.getProductEngagementConversionStats(params);
			return successResult(engagementList, "상품 조회 및 전환율 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품 조회 및 전환율 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductReviewStats")
	public Map<String, Object> getProductReviewStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productReviewList = dashboardService.getProductReviewStats(params);
			return successResult(productReviewList, "상품별 리뷰 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 리뷰 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductQuestionStats")
	public Map<String, Object> getProductQuestionStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productQuestionList = dashboardService.getProductQuestionStats(params);
			return successResult(productQuestionList, "상품 문의 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품 문의 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductOptionStats")
	public Map<String, Object> getProductOptionStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productOptionList = dashboardService.getProductOptionStats(params);
			return successResult(productOptionList, "상품 옵션 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품 옵션 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductDeliveryClaimStats")
	public Map<String, Object> getProductDeliveryClaimStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> deliveryClaimList = dashboardService.getProductDeliveryClaimStats(params);
			return successResult(deliveryClaimList, "배송 및 클레임 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "배송 및 클레임 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getCategoryProductStats")
	public Map<String, Object> getCategoryProductStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> categoryProductList = dashboardService.getCategoryProductStats(params);
			return successResult(categoryProductList, "카테고리별 상품 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "카테고리별 상품 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductDisplayStats")
	public Map<String, Object> getProductDisplayStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productDisplayList = dashboardService.getProductDisplayStats(params);
			return successResult(productDisplayList, "공개 및 노출 상품 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "공개 및 노출 상품 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getBenefitUsageStats")
	public Map<String, Object> getBenefitUsageStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> benefitUsageData = dashboardService.getBenefitUsageStats(params);
			return successResult(benefitUsageData, "쿠폰 및 포인트 사용 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "쿠폰 및 포인트 사용 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getBenefitUseTypeStats")
	public Map<String, Object> getBenefitUseTypeStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> benefitUseTypeList = dashboardService.getBenefitUseTypeStats(params);
			return successResult(benefitUseTypeList, "쿠폰 및 포인트 사용 유형 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "쿠폰 및 포인트 사용 유형 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getProductBenefitTopStats")
	public Map<String, Object> getProductBenefitTopStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productBenefitTopList = dashboardService.getProductBenefitTopStats(params);
			return successResult(productBenefitTopList, "상품별 쿠폰 및 포인트 사용 TOP 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 쿠폰 및 포인트 사용 TOP 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getBenefitRevenueImpactStats")
	public Map<String, Object> getBenefitRevenueImpactStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> benefitRevenueImpactList = dashboardService.getBenefitRevenueImpactStats(params);
			return successResult(benefitRevenueImpactList, "쿠폰 및 포인트 매출 영향 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "쿠폰 및 포인트 매출 영향 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorBookingOverviewStats")
	public Map<String, Object> getInteriorBookingOverviewStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorBookingOverviewStats(params);
			return successResult(data, "인테리어 상담/예약 현황 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 상담/예약 현황 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorBookingMonthlyStats")
	public Map<String, Object> getInteriorBookingMonthlyStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorBookingMonthlyStats(params);
			return successResult(list, "인테리어 월별 상담 요청 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 월별 상담 요청 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorBookingLongStats")
	public Map<String, Object> getInteriorBookingLongStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorBookingLongStats(params);
			return successResult(list, "인테리어 상담 소요 기간 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 상담 소요 기간 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorBookingConversionStats")
	public Map<String, Object> getInteriorBookingConversionStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorBookingConversionStats(params);
			return successResult(data, "인테리어 상담 전환율 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 상담 전환율 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorInvoiceStats")
	public Map<String, Object> getInteriorInvoiceStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorInvoiceStats(params);
			return successResult(data, "인테리어 견적서 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 견적서 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorContractStats")
	public Map<String, Object> getInteriorContractStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorContractStats(params);
			return successResult(data, "인테리어 계약 금액 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 계약 금액 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorMonthlyContractStats")
	public Map<String, Object> getInteriorMonthlyContractStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorMonthlyContractStats(params);
			return successResult(list, "인테리어 월별 계약 금액 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 월별 계약 금액 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorInvoiceItemStats")
	public Map<String, Object> getInteriorInvoiceItemStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorInvoiceItemStats(params);
			return successResult(list, "인테리어 견적 항목 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 견적 항목 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorScheduleStats")
	public Map<String, Object> getInteriorScheduleStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorScheduleStats(params);
			return successResult(data, "인테리어 시공 일정 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 시공 일정 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorMonthlyScheduleStats")
	public Map<String, Object> getInteriorMonthlyScheduleStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorMonthlyScheduleStats(params);
			return successResult(list, "인테리어 월별 시공 일정 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 월별 시공 일정 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorCustomerStats")
	public Map<String, Object> getInteriorCustomerStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorCustomerStats(params);
			return successResult(data, "인테리어 고객 분석 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 고객 분석 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorRepeatCustomerStats")
	public Map<String, Object> getInteriorRepeatCustomerStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorRepeatCustomerStats(params);
			return successResult(data, "인테리어 재상담 고객 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 재상담 고객 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorAnswerTypeStats")
	public Map<String, Object> getInteriorAnswerTypeStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorAnswerTypeStats(params);
			return successResult(list, "인테리어 상담 답변 유형 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 상담 답변 유형 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorAnswerBudgetAreaStats")
	public Map<String, Object> getInteriorAnswerBudgetAreaStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorAnswerBudgetAreaStats(params);
			return successResult(list, "인테리어 예산/평수 답변 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 예산/평수 답변 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorAnswerSpaceStats")
	public Map<String, Object> getInteriorAnswerSpaceStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorAnswerSpaceStats(params);
			return successResult(list, "인테리어 요청 공간 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 요청 공간 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorReviewStats")
	public Map<String, Object> getInteriorReviewStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorReviewStats(params);
			return successResult(data, "인테리어 리뷰 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 리뷰 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorMonthlyReviewStats")
	public Map<String, Object> getInteriorMonthlyReviewStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorMonthlyReviewStats(params);
			return successResult(list, "인테리어 월별 리뷰 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 월별 리뷰 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorPortfolioStats")
	public Map<String, Object> getInteriorPortfolioStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorPortfolioStats(params);
			return successResult(data, "인테리어 포트폴리오 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 포트폴리오 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorExampleTagStats")
	public Map<String, Object> getInteriorExampleTagStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorExampleTagStats(params);
			return successResult(list, "인테리어 시공 사례 태그 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 시공 사례 태그 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorRecentExampleStats")
	public Map<String, Object> getInteriorRecentExampleStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorRecentExampleStats(params);
			return successResult(list, "인테리어 최근 시공 사례를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 최근 시공 사례 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorInterestStats")
	public Map<String, Object> getInteriorInterestStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorInterestStats(params);
			return successResult(list, "인테리어 찜/관심도 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 찜/관심도 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorProfileCompletionStats")
	public Map<String, Object> getInteriorProfileCompletionStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorProfileCompletionStats(params);
			return successResult(list, "인테리어 프로필 완성도 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 프로필 완성도 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorRiskStats")
	public Map<String, Object> getInteriorRiskStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> data = dashboardService.getInteriorRiskStats(params);
			return successResult(data, "인테리어 운영 리스크 통계를 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 운영 리스크 통계 조회 중 오류가 발생했습니다.");
		}
	}

	@PostMapping("/getInteriorRiskList")
	public Map<String, Object> getInteriorRiskList(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> list = dashboardService.getInteriorRiskList(params);
			return successResult(list, "인테리어 운영 리스크 목록을 성공적으로 조회했습니다.");
		} catch (Exception e) {
			return errorResult(e, "인테리어 운영 리스크 목록 조회 중 오류가 발생했습니다.");
		}
	}

	private Map<String, Object> successResult(Object data, String successMessage) {
		Map<String, Object> result = new HashMap<>();
		int size = getSize(data);

		result.put("success", true);
		result.put("message", size > 0 ? successMessage : "데이터가 없습니다.");
		result.put("companyList", data);
		result.put("size", size);

		return result;
	}

	private Map<String, Object> errorResult(Exception e, String errorMessage) {
		Map<String, Object> result = new HashMap<>();

		result.put("success", false);
		result.put("error", e.toString());
		result.put("message", errorMessage);

		return result;
	}

	private int getSize(Object data) {
		if (data == null) {
			return 0;
		}
		if (data instanceof Map) {
			return ((Map<?, ?>) data).size();
		}
		if (data instanceof Collection) {
			return ((Collection<?>) data).size();
		}
		return 1;
	}
}
