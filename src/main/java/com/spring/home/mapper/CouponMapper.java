package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CouponDTO;

@Mapper
public interface CouponMapper {

	public void insertData(CouponDTO dto) throws Exception;
	
	public List<CouponDTO> getLists(int start, int end, String searchKey, String SearchValue) throws Exception;
	
	public CouponDTO getReadData(int num) throws Exception;
	
	public void updateData(CouponDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
}
