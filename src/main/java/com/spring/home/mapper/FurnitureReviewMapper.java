package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.FurnitureReviewDTO;

@Mapper
public interface FurnitureReviewMapper {

	public void insertData(FurnitureReviewDTO dto) throws Exception;
	
	public List<FurnitureReviewDTO> getLists(int start, int end, String searchKey, String SearchValue) throws Exception;
	
	public FurnitureReviewDTO getReadData(int num) throws Exception;
	
	public void updateData(FurnitureReviewDTO dto) throws Exception;
	
	public void deleteData(int num) throws Exception;
}
