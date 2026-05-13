package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CartAndFurnitureDTO;
import com.spring.home.mapper.OrderMapper;

@Service
public class OrderService {

	@Autowired
	private OrderMapper orderMapper;

	public List<CartAndFurnitureDTO> getOrderFurnitureList(CartAndFurnitureDTO dto) throws Exception {
		return orderMapper.getOrderFurnitureList(dto);
	}

	public int changeDeliveryState(List<CartAndFurnitureDTO> dtoList) throws Exception {
		int total = 0;
		for (CartAndFurnitureDTO dto : dtoList) {
			int result = orderMapper.changeDeliveryState(dto);
			total += result;
		}
		return total;
	}

}
