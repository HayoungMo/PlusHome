package com.spring.home;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
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
	
	@PostMapping("/insert")
	public void insertData(@RequestBody CouponDTO dto) throws Exception{
		dto.setCoupon_code(
		        "CP-" + UUID.randomUUID().toString()
		    );
		couponService.insertData(dto);
	}
	
	@PostMapping("/getLists")
	public List<CouponDTO> getLists(@RequestBody String id) throws Exception{
		return couponService.getLists(id);
	}
	@PostMapping("/getReadData")
	public CouponDTO getReadData(@RequestParam String coupon_code) throws Exception{
		return couponService.getReadData(coupon_code);
	}
	@PostMapping("/update")
	public void updateData(@RequestBody CouponDTO dto) throws Exception{
		couponService.updateData(dto);
	}
	@PostMapping("/delete")
	public void deleteData(@RequestParam String coupon_code) throws Exception{
		couponService.deleteData(coupon_code);
	}

}
