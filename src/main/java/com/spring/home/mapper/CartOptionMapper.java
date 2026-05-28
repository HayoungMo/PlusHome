package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.CartOptionDTO;

@Mapper
public interface CartOptionMapper {

	public void insertData(CartOptionDTO dto) throws Exception;
	
	public List<CartOptionDTO> getByCartCode(String c_code) throws Exception;
	
	public void updateData(CartOptionDTO dto) throws Exception;
	
	public void deleteData(String c_code) throws Exception;
	
	public int updateCountByCartCode(
		    @Param("c_code") String c_code,
		    @Param("co_count") int co_count
		) throws Exception;

}

