package com.spring.home.dto;

import lombok.Data;

@Data
public class CartOptionDTO {

	private String id;
	private String f_code;
	private String co_select;
	private String co_text;
	private int co_count;
	private int co_price;
}
