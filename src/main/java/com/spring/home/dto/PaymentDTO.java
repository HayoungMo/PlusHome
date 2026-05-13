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
	private int deilveryTotal;
	private int couponDiscount;
	private int payTotal;
}
