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

}
