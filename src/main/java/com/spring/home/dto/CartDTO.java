package com.spring.home.dto;

import java.util.Date;

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
}
