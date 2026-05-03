package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CartOptionDTO;

@Mapper
public interface CartOptionMapper {

	public void insertData(CartOptionDTO dto) throws Exception;
	
	public List<CartOptionDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public CartOptionDTO getReadData(String id) throws Exception;
	
	public void updateData(CartOptionDTO dto) throws Exception;
	
	public void deleteData(String id) throws Exception;
}
