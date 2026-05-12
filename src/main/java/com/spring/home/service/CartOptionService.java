package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CartOptionDTO;
import com.spring.home.mapper.CartOptionMapper;

@Service
public class CartOptionService {

	@Autowired
	private CartOptionMapper cartOptionMapper;
	
	public void insertData(CartOptionDTO dto) throws Exception{
		cartOptionMapper.insertData(dto);
	}
	
	public void updateData(CartOptionDTO dto) throws Exception{
		cartOptionMapper.updateData(dto);
	}
	
	public void deleteData(String id) throws Exception{
		cartOptionMapper.deleteData(id);
	}
	
}
