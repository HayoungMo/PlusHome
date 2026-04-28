package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class CouponDTO {

	private String coupon_code;
	private int discount;
	private Date coupon_end;
	private int coupon_max;
}
