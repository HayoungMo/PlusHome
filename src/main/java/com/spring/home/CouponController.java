package com.spring.home;

import java.util.HashMap;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CouponDTO;
import com.spring.home.service.CouponService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/coupon")
public class CouponController {
	
	@Autowired
	private CouponService couponService;
	
	@PostMapping("/insertDev")
	public CouponDTO insertDataDev(@RequestBody CouponDTO dto) throws Exception{
		dto.setCoupon_code(
		        UUID.randomUUID().toString()
		    );
		dto.setId(dto.getCoupon_code());
		couponService.insertData(dto);
		
		return dto;
	}
	
	@PostMapping("/insert")
	public void insertData(@RequestBody CouponDTO dto) throws Exception{		
		couponService.insertData(dto);
	}
	
	
	@GetMapping("/getListsDev")
	public List<CouponDTO> getListsDev() throws Exception{
		return couponService.getListsDev();
	}
	
	@PostMapping("/getLists")
	public List<CouponDTO> getLists(@RequestBody HashMap<String, Object> map) throws Exception{
		String id = (String) map.get("id");
		return couponService.getLists(id);
	}
	@PostMapping("/getReadData")
	public CouponDTO getReadData(@RequestBody CouponDTO dto) throws Exception{
		return couponService.getReadData(dto);
	}
	@PostMapping("/checkData")
	public int checkData(@RequestBody CouponDTO dto) throws Exception{
		return couponService.checkData(dto);
	}
	@PostMapping("/update")
	public void updateData(@RequestBody CouponDTO dto) throws Exception{
		couponService.updateData(dto);
	}
	@PostMapping("/delete")
	public void deleteData(@RequestBody CouponDTO dto) throws Exception{
		couponService.deleteData(dto);
	}

}
