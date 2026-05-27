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
	private String r_count;
	// 답변 갯수
	private String a_count;
	// 별점 평균
	private String star_avg;
	// 총 판매된 물품 수
	private String cart_total_f_count;
	// 총 판매된 물품 금액
	private String cart_total_f_price;
	// 평균 구매 물품 수
	private String cart_avg_f_count;
	// 총 판매 횟수 ( 구매 횟수 기준 )
	private String cart_total_buy;
	
	private List<ImageDTO> imageList;
}

