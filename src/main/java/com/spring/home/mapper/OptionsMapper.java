package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.OptionsDTO;

@Mapper
public interface OptionsMapper {
	
	public void insertData(OptionsDTO dto) throws Exception;
	
	public List<OptionsDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public OptionsDTO getReadData(String f_code) throws Exception;
	
	public void updateData(OptionsDTO dto) throws Exception;
	
	public void deleteData(String f_code) throws Exception;
	
	public void deleteOne(String o_code) throws Exception;
	
	public List<OptionsDTO> getListByFcode(String f_code) throws Exception;
	
	public int decreaseOptionStock(
			@Param("f_code") String f_code,
			@Param("o_select") String o_select,
			@Param("o_text") String o_text,
			@Param("count") int count);
	
	public int increaseOptionStock(
		    @Param("f_code") String f_code,
		    @Param("o_select") String o_select,
		    @Param("o_text") String o_text,
		    @Param("count") int count
		);
	
}
