package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CartDTO;

@Mapper
public interface CartMapper {
	
	public void insertData(CartDTO dto) throws Exception;
	
	public List<CartDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public CartDTO getReadData(int num) throws Exception;
	
	public void updateData(CartDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
}
