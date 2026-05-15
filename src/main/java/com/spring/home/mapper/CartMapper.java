package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.CartDTO;

@Mapper
public interface CartMapper {
	
	public void insertData(CartDTO dto) throws Exception;
	
	public List<CartDTO> getMyCart(String id) throws Exception;
	
	public CartDTO getReadData(String c_code) throws Exception;
	
	public void updateData(CartDTO dto) throws Exception;
	
	public void deleteData(String c_code) throws Exception;

	public CartDTO findSameCart(
		@Param("id") String id,
		@Param("f_code") String f_code
	) throws Exception;

	public int updatePaymentStatus(
			@Param("c_code") String c_code,
			@Param("id") String id,
			@Param("f_name") String f_name,
			@Param("f_tel") String f_tel,
			@Param("f_addr") String f_addr,
			@Param("pay_total") int pay_total);
	
	public List<CartDTO> getMyOrders(String id) throws Exception;
	
	public int cancelOrderToCart(
			@Param("c_code") String c_code,
			@Param("id") String id);
	
	public int cancelOrder(
		    @Param("c_code") String c_code,
		    @Param("id") String id
		);

	public int updateDeliveryStatus(
			@Param("c_code") String c_code,
			@Param("id") String id,
			@Param("f_dstatus") int f_dstatus);
}
