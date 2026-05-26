package com.spring.home.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CouponDTO;
import com.spring.home.dto.EventCouponDTO;

@Mapper
public interface EventCouponMapper {

	public void insertData(EventCouponDTO dto) throws Exception;
	
	public void deleteData(EventCouponDTO dto) throws Exception;
	
	public void deleteByEvent(int e_id) throws Exception;
	
	public List<CouponDTO> getCouponsByEvent(int e_id) throws Exception;

	public List<Map<String, Object>> getCouponEventUsage() throws Exception;
}
