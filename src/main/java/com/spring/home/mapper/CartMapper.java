package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CartDTO;

@Mapper
public interface CartMapper {
	
	public void insertData(CartDTO dto) throws Exception;
	
	public List<CartDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public CartDTO getReadData(String id) throws Exception;
	
	public void updateData(CartDTO dto) throws Exception;
	
	public void deleteData(String id) throws Exception;
}
