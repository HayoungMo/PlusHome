package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CouponDTO;

@Mapper
public interface CouponMapper {

	public void insertData(CouponDTO dto) throws Exception;
	
	public List<CouponDTO> getLists(String id) throws Exception;
	
	public CouponDTO getReadData(String coupon_code) throws Exception;
	
	public void updateData(CouponDTO dto) throws Exception;
	
	public void deleteData(String coupon_code) throws Exception;
}
