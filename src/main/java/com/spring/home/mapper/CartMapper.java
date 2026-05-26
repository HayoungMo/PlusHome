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
	
	public int deleteData(
			@Param("id") String id,
			@Param("c_code") String c_code
			) throws Exception;

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
			@Param("pay_total") int pay_total,
			@Param("use_point") int use_point,
			@Param("coupon_discount") int coupon_discount);
	
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

	public int getAvailablePoint(String id) throws Exception;

	public int savePoint(
			@Param("c_code") String c_code,
			@Param("id") String id);

	public int restoreUsedPoint(
			@Param("c_code") String c_code,
			@Param("id") String id);
	
	public int updateCartCount(
			@Param("c_code") String c_code,
			@Param("id") String id,
			@Param("f_count") int f_count
		) throws Exception;

	public int restoreCouponDiscountAsPoint(
			@Param("c_code") String c_code,
			@Param("id") String id);


}
