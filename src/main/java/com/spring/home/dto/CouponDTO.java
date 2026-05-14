package com.spring.home.dto;

import java.time.LocalDate;
import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class CouponDTO {
	private String id;
	private String coupon_code;
	private int discount;
	
	@JsonFormat(pattern = "yyyy-MM-dd", timezone = "Asia/Seoul")
	private LocalDate coupon_end;
	
	private int coupon_max;
	private String coupon_info;
	private String coupon_used;
}
