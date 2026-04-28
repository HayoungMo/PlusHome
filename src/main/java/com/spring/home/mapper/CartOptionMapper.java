package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CartOptionDTO;

@Mapper
public interface CartOptionMapper {

	public void insertData(CartOptionDTO dto) throws Exception;
	
	public List<CartOptionDTO> getLists(int start, int end, String searchKey, String SearchValue) throws Exception;
	
	public CartOptionDTO getReadData(int num) throws Exception;
	
	public void updateData(CartOptionDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
}
