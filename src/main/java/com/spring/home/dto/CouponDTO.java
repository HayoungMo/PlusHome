package com.spring.home.dto;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;

@Data
public class CouponDTO {
	private String id;
	private String coupon_code;
	private int discount;
	@DateTimeFormat(pattern = "yyyy-MM-dd")
	private Date coupon_end;
	private int coupon_max;
	private String coupon_info;
}
