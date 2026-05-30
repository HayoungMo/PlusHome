package com.spring.home.mapper;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.CouponDTO;

@Mapper
public interface CouponMapper {

	public void insertData(CouponDTO dto) throws Exception;
	
	public List<CouponDTO> getListsDev() throws Exception;
	
	public List<CouponDTO> getLists(String id) throws Exception;
	
	public List<CouponDTO> getArticleList(HashMap<String, Object> map) throws Exception;
	
	public CouponDTO getReadData(CouponDTO dto) throws Exception;
	
	public int checkData(CouponDTO dto) throws Exception;
	
	public void updateData(CouponDTO dto) throws Exception;
	
	public void deleteData(CouponDTO dto) throws Exception;
	
	public CouponDTO getValidUserCoupon(
			@Param("id") String id,
			@Param("coupon_code") String coupon_code) throws Exception;

	public int useCoupon(
			@Param("id") String id,
			@Param("coupon_code") String coupon_code) throws Exception;

	public List<CouponDTO> getCouponListByCompanyId(CompanyDTO dto) throws Exception;
	
	//쿠폰 개수를 위함(5월 29일 안예린 추가함)
	public int getCouponCount() throws Exception;
	
}
