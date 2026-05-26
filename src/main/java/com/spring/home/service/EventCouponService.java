package com.spring.home.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CouponDTO;
import com.spring.home.dto.EventCouponDTO;
import com.spring.home.mapper.EventCouponMapper;

@Service
public class EventCouponService {
	
	@Autowired
	private EventCouponMapper eventCouponMapper;
	
	public void insertData(EventCouponDTO dto) throws Exception {
		eventCouponMapper.insertData(dto);
	}
	
	public void deleteData(EventCouponDTO dto) throws Exception {
		eventCouponMapper.deleteData(dto);
	}
	
	public void deleteByEvent(int e_id) throws Exception {
		eventCouponMapper.deleteByEvent(e_id);
	}
	
	public List<CouponDTO> getCouponsByEvent(int e_id) throws Exception {
		return eventCouponMapper.getCouponsByEvent(e_id);
	}

	public List<Map<String, Object>> getCouponEventUsage() throws Exception {
		return eventCouponMapper.getCouponEventUsage();
	}
}
