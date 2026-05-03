package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CartDTO;
import com.spring.home.mapper.CartMapper;

@Service
public class CartService {

	@Autowired
	private CartMapper cartMapper;
	
	public void insertData(CartDTO dto) throws Exception{
		cartMapper.insertData(dto);
	}
	
	public List<CartDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return cartMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public CartDTO getReadData(String id) throws Exception{
		return cartMapper.getReadData(id);
	}
	
	public void updateData(CartDTO dto) throws Exception{
		cartMapper.updateData(dto);
	}
	
	public void deleteData(String id) throws Exception{
		cartMapper.deleteData(id);
	}
}
