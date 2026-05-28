package com.spring.home.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.mapper.DashboardMapper;

@Service
public class DashboardService {

	@Autowired
	private DashboardMapper dashboardMapper;

	public Map<String, Object> getOrderAgeGenderStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getOrderAgeGenderStats(params);
	}

	public Map<String, Object> getBuyerAgeGenderStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getBuyerAgeGenderStats(params);
	}

	public List<Map<String, Object>> getStatusHourlyStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getStatusHourlyStats(params);
	}

	public List<Map<String, Object>> getCartHourlyStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getCartHourlyStats(params);
	}

	public Map<String, Object> getOrderElapsedTimeStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getOrderElapsedTimeStats(params);
	}

	public Map<String, Object> getProductOverviewStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductOverviewStats(params);
	}

	public List<Map<String, Object>> getProductSalesStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductSalesStats(params);
	}

	public List<Map<String, Object>> getProductRevenueStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductRevenueStats(params);
	}

	public List<Map<String, Object>> getProductEngagementConversionStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductEngagementConversionStats(params);
	}

	public List<Map<String, Object>> getProductReviewStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductReviewStats(params);
	}

	public List<Map<String, Object>> getProductQuestionStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductQuestionStats(params);
	}

	public List<Map<String, Object>> getProductOptionStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductOptionStats(params);
	}

	public List<Map<String, Object>> getProductDeliveryClaimStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductDeliveryClaimStats(params);
	}

	public List<Map<String, Object>> getCategoryProductStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getCategoryProductStats(params);
	}

	public List<Map<String, Object>> getProductDisplayStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductDisplayStats(params);
	}

	public Map<String, Object> getBenefitUsageStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getBenefitUsageStats(params);
	}

	public List<Map<String, Object>> getBenefitUseTypeStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getBenefitUseTypeStats(params);
	}

	public List<Map<String, Object>> getProductBenefitTopStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getProductBenefitTopStats(params);
	}

	public List<Map<String, Object>> getBenefitRevenueImpactStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getBenefitRevenueImpactStats(params);
	}

	public Map<String, Object> getInteriorBookingOverviewStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorBookingOverviewStats(params);
	}

	public List<Map<String, Object>> getInteriorBookingMonthlyStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorBookingMonthlyStats(params);
	}

	public List<Map<String, Object>> getInteriorBookingLongStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorBookingLongStats(params);
	}

	public Map<String, Object> getInteriorBookingConversionStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorBookingConversionStats(params);
	}

	public Map<String, Object> getInteriorInvoiceStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorInvoiceStats(params);
	}

	public Map<String, Object> getInteriorContractStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorContractStats(params);
	}

	public List<Map<String, Object>> getInteriorMonthlyContractStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorMonthlyContractStats(params);
	}

	public List<Map<String, Object>> getInteriorInvoiceItemStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorInvoiceItemStats(params);
	}

	public Map<String, Object> getInteriorScheduleStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorScheduleStats(params);
	}

	public List<Map<String, Object>> getInteriorMonthlyScheduleStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorMonthlyScheduleStats(params);
	}

	public Map<String, Object> getInteriorCustomerStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorCustomerStats(params);
	}

	public Map<String, Object> getInteriorRepeatCustomerStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorRepeatCustomerStats(params);
	}

	public List<Map<String, Object>> getInteriorAnswerTypeStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorAnswerTypeStats(params);
	}

	public List<Map<String, Object>> getInteriorAnswerBudgetAreaStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorAnswerBudgetAreaStats(params);
	}

	public List<Map<String, Object>> getInteriorAnswerSpaceStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorAnswerSpaceStats(params);
	}

	public Map<String, Object> getInteriorReviewStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorReviewStats(params);
	}

	public List<Map<String, Object>> getInteriorMonthlyReviewStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorMonthlyReviewStats(params);
	}

	public Map<String, Object> getInteriorPortfolioStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorPortfolioStats(params);
	}

	public List<Map<String, Object>> getInteriorExampleTagStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorExampleTagStats(params);
	}

	public List<Map<String, Object>> getInteriorRecentExampleStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorRecentExampleStats(params);
	}

	public List<Map<String, Object>> getInteriorInterestStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorInterestStats(params);
	}

	public List<Map<String, Object>> getInteriorProfileCompletionStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorProfileCompletionStats(params);
	}

	public Map<String, Object> getInteriorRiskStats(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorRiskStats(params);
	}

	public List<Map<String, Object>> getInteriorRiskList(Map<String, Object> params) throws Exception {
		return dashboardMapper.getInteriorRiskList(params);
	}

}
