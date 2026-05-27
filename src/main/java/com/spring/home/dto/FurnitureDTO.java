package com.spring.home.dto;

import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class FurnitureDTO {

	//조회수 없음
	private String f_code;
	
	private String f_viewCount;
	
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
	
	private int f_deliveryPrice;
	
	// 리뷰 갯수
	private int r_count;
	// 구매 횟수
	private int s_count;
	
	private List<ImageDTO> imageList;
}

