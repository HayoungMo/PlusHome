package com.spring.home.dto;

import java.util.Date;

import lombok.Data;

@Data
public class CartAndFurnitureDTO {
	private String id;
	private String f_status;
	private int f_dstatus;
	private String f_addr;
	private String f_tel;
	private String c_id;
	private String c_kind;
	private String c_name;
	private Date cart_paydate;
	private Date cart_statusdate;
	private int f_dprice;
	private Date f_createddate;
	private String f_catagory1;
	private String f_catagory2;
	private String f_catagory3;
	private String f_catagory4;
	private String f_catagory5;
	private int f_discount;
	private int f_viewcount;
	private int cartpayedprice;
	private int cartusedpoint;
	private String cartbuyername;
	private int cartqty;
	private int furnitureproductcount;
	private int furnitureearnpointpercent;
	private int furnitureproductprice;
	private String furnitureproductname;
	private String f_code;
	private String c_code;
}
