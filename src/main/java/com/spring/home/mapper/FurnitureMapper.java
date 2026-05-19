package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.FurnitureDTO;

@Mapper
public interface FurnitureMapper {
	
	public void insertData(FurnitureDTO dto) throws Exception;
	
	public List<FurnitureDTO> getLists(
			@Param("start") int start, 
			@Param("end") int end, 
			@Param("searchKey") String searchKey, 
			@Param("searchValue") String searchValue,
			@Param("sort") String sort) throws Exception;
	
	public FurnitureDTO getReadData(@Param("f_code") String f_code) throws Exception;
	
	public int countByFCode(@Param("f_code") String f_code);
	
	public void updateViewCount(@Param("f_code") String f_code);
	
	public void updateData(FurnitureDTO dto) throws Exception;
	
	public void deleteData(@Param("f_code") String f_code) throws Exception;
	
	public int countSearchData(@Param("searchKey") String searchKey, 
			@Param("searchValue") String searchValue);

	public List<FurnitureDTO> getFurnitureByCompany(FurnitureDTO dto) throws Exception;

	public int decreaseStock(
			@Param("f_code") String f_code,
			@Param("count") int count);
	
	public int increaseStock(
			@Param("f_code") String f_code,
			@Param("count") int count);
}
