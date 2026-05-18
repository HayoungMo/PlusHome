package com.spring.home.dto;

import java.util.List;

import lombok.Data;

@Data
public class PaymentDTO {
	private List<String> c_codeList;
	private String f_name;
	private String f_tel;
	private String f_addr;
	
	private int productTotal;
	private int deliveryTotal;
	private int couponDiscount;
	
	private int use_point;
	private int payTotal;
}
