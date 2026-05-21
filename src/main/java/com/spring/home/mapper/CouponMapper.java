package com.spring.home.mapper;

import java.util.HashMap;
import java.util.List;

import org.apache.ibatis.annotations.Mapper;

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
}
