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
			return successResult(ageGenderData, "연령 및 성별 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "연령 및 성별 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getBuyerAgeGenderStats")
	public Map<String, Object> getBuyerAgeGenderStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> buyerAgeGenderData = dashboardService.getBuyerAgeGenderStats(params);
			return successResult(buyerAgeGenderData, "구매자 연령 및 성별 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "구매자 연령 및 성별 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getStatusHourlyStats")
	public Map<String, Object> getStatusHourlyStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> statusHourlyList = dashboardService.getStatusHourlyStats(params);
			return successResult(statusHourlyList, "상태 변경 시간대 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상태 변경 시간대 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getCartHourlyStats")
	public Map<String, Object> getCartHourlyStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> cartHourlyList = dashboardService.getCartHourlyStats(params);
			return successResult(cartHourlyList, "장바구니 시간대 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "장바구니 시간대 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getOrderElapsedTimeStats")
	public Map<String, Object> getOrderElapsedTimeStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> elapsedTimeData = dashboardService.getOrderElapsedTimeStats(params);
			return successResult(elapsedTimeData, "주문 소요 시간 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "주문 소요 시간 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductOverviewStats")
	public Map<String, Object> getProductOverviewStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> productOverviewData = dashboardService.getProductOverviewStats(params);
			return successResult(productOverviewData, "상품 등록 현황 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품 등록 현황 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductSalesStats")
	public Map<String, Object> getProductSalesStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productSalesList = dashboardService.getProductSalesStats(params);
			return successResult(productSalesList, "상품별 판매 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 판매 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductRevenueStats")
	public Map<String, Object> getProductRevenueStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productRevenueList = dashboardService.getProductRevenueStats(params);
			return successResult(productRevenueList, "상품별 매출 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 매출 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductEngagementConversionStats")
	public Map<String, Object> getProductEngagementConversionStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> engagementList = dashboardService.getProductEngagementConversionStats(params);
			return successResult(engagementList, "조회수 및 전환율 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "조회수 및 전환율 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductReviewStats")
	public Map<String, Object> getProductReviewStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productReviewList = dashboardService.getProductReviewStats(params);
			return successResult(productReviewList, "상품별 리뷰 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 리뷰 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductQuestionStats")
	public Map<String, Object> getProductQuestionStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productQuestionList = dashboardService.getProductQuestionStats(params);
			return successResult(productQuestionList, "상품 문의 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품 문의 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductOptionStats")
	public Map<String, Object> getProductOptionStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productOptionList = dashboardService.getProductOptionStats(params);
			return successResult(productOptionList, "상품 옵션 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품 옵션 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductDeliveryClaimStats")
	public Map<String, Object> getProductDeliveryClaimStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> deliveryClaimList = dashboardService.getProductDeliveryClaimStats(params);
			return successResult(deliveryClaimList, "배송 및 클레임 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "배송 및 클레임 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getCategoryProductStats")
	public Map<String, Object> getCategoryProductStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> categoryProductList = dashboardService.getCategoryProductStats(params);
			return successResult(categoryProductList, "카테고리별 상품 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "카테고리별 상품 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductDisplayStats")
	public Map<String, Object> getProductDisplayStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productDisplayList = dashboardService.getProductDisplayStats(params);
			return successResult(productDisplayList, "숨김 및 노출 상품 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "숨김 및 노출 상품 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getBenefitUsageStats")
	public Map<String, Object> getBenefitUsageStats(@RequestBody Map<String, Object> params) {
		try {
			Map<String, Object> benefitUsageData = dashboardService.getBenefitUsageStats(params);
			return successResult(benefitUsageData, "쿠폰 및 포인트 사용 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "쿠폰 및 포인트 사용 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getBenefitUseTypeStats")
	public Map<String, Object> getBenefitUseTypeStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> benefitUseTypeList = dashboardService.getBenefitUseTypeStats(params);
			return successResult(benefitUseTypeList, "쿠폰 및 포인트 사용 유형 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "쿠폰 및 포인트 사용 유형 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getProductBenefitTopStats")
	public Map<String, Object> getProductBenefitTopStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> productBenefitTopList = dashboardService.getProductBenefitTopStats(params);
			return successResult(productBenefitTopList, "상품별 쿠폰 및 포인트 사용률 TOP 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "상품별 쿠폰 및 포인트 사용률 TOP 통계 조회중 오류가 발생하였습니다.");
		}
	}

	@PostMapping("/getBenefitRevenueImpactStats")
	public Map<String, Object> getBenefitRevenueImpactStats(@RequestBody Map<String, Object> params) {
		try {
			List<Map<String, Object>> benefitRevenueImpactList = dashboardService.getBenefitRevenueImpactStats(params);
			return successResult(benefitRevenueImpactList, "쿠폰 및 포인트 매출 영향 통계를 성공적으로 조회하였습니다.");
		} catch (Exception e) {
			return errorResult(e, "쿠폰 및 포인트 매출 영향 통계 조회중 오류가 발생하였습니다.");
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
