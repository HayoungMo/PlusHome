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
	public List<CouponDTO> getListsDev() throws Exception{
		return couponMapper.getListsDev();
	}
	public int checkData(CouponDTO dto) throws Exception{
		return couponMapper.checkData(dto);
	}
	
	public List<CouponDTO> getLists(String id) throws Exception{
		return couponMapper.getLists(id);
	}
	
	public CouponDTO getReadData(CouponDTO dto) throws Exception{
		return couponMapper.getReadData(dto);
	}
	
	public void updateData(CouponDTO dto) throws Exception{
		couponMapper.updateData(dto);
	}
	
	public void deleteData(CouponDTO dto) throws Exception{
		couponMapper.deleteData(dto);
	}
	
	public void insertCouponUsers(CouponDTO dto) throws Exception {
		for(String userId : dto.getUserIds()) {
			System.out.println("현재 유저:" +userId);
			dto.setId(userId);
			
			System.out.println("세팅된 id" + dto.getId());
			couponMapper.insertData(dto);
		}
	}
}
