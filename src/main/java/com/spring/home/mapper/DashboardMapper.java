package com.spring.home.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface DashboardMapper {
	
	Map<String, Object> getOrderAgeGenderStats(Map<String, Object> params) throws Exception;

	Map<String, Object> getBuyerAgeGenderStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getStatusHourlyStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getCartHourlyStats(Map<String, Object> params) throws Exception;

	Map<String, Object> getOrderElapsedTimeStats(Map<String, Object> params) throws Exception;

	Map<String, Object> getProductOverviewStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductSalesStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductRevenueStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductEngagementConversionStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductReviewStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductQuestionStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductOptionStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductDeliveryClaimStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getCategoryProductStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductDisplayStats(Map<String, Object> params) throws Exception;

	Map<String, Object> getBenefitUsageStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getBenefitUseTypeStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getProductBenefitTopStats(Map<String, Object> params) throws Exception;

	List<Map<String, Object>> getBenefitRevenueImpactStats(Map<String, Object> params) throws Exception;

}
