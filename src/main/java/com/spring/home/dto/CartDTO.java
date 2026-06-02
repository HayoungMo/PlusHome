package com.spring.home.dto;

import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class CartDTO {

	private String c_code;

	private String id;
	private String f_code;
	private String f_status;
	private int f_dstatus;
	private int f_count;
	private String f_addr;
	private String f_name;
	private String f_tel;
	private int f_price;
	private int f_point;

	private Date cart_statusdate;

	private int pay_total;

	private int use_point;
	private int save_point;
	private int coupon_discount;
	
	private String F_STATUS;
	private String gender;
	private String f_catagory1;
	private String f_catagory2;
	private String f_catagory3;
	private String f_catagory4;
	private String f_catagory5;
	
	private int groupLevel;
	
	private List<CartOptionDTO> options;
	private FurnitureDTO furniture;
	private boolean reviewed;
	private FurnitureReviewDTO review;
	
	private boolean claimed;
	private Integer claim_type;
	private Integer claim_status;
	private String claim_code;
	private String claim_reason;
}

