package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CartAndFurnitureDTO;

@Mapper
public interface OrderMapper {

	List<CartAndFurnitureDTO> getOrderFurnitureList(CartAndFurnitureDTO dto) throws Exception;

	int changeDeliveryState(CartAndFurnitureDTO dto) throws Exception;

}
