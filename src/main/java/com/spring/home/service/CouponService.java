package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CouponDTO;
import com.spring.home.mapper.CouponMapper;

@Service
public class CouponService {

	@Autowired
	private CouponMapper couponMapper;
	
	public void insertData(CouponDTO dto) throws Exception{
		couponMapper.insertData(dto);
	}
	
	public List<CouponDTO> getLists(String id) throws Exception{
		return couponMapper.getLists(id);
	}
	
	public CouponDTO getReadData(String coupon_code) throws Exception{
		return couponMapper.getReadData(coupon_code);
	}
	
	public void updateData(CouponDTO dto) throws Exception{
		couponMapper.updateData(dto);
	}
	
	public void deleteData(String coupon_code) throws Exception{
		couponMapper.deleteData(coupon_code);
	}
}
