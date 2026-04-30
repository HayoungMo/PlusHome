package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class FurnitureDTO {

	//조회수 없음
	private String f_code;
	
	private String c_id;
	private String c_kind;
	private String c_name;
	
	private String f_name;
	private int f_price;
	private int f_dprice;
	private Date f_createdDate;
	
	private String f_catagory1;
	private String f_catagory2;
	private String f_catagory3;
	private String f_catagory4;
	private String f_catagory5;
	
	private int f_discount;
	private int f_point;
	private int f_count;
	
	//f_code생성에 사용하는 용도
	private int companyCode;
	private int catagoryCode;

}
