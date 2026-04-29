package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.FurnitureReviewDTO;
import com.spring.home.mapper.FurnitureReviewMapper;

@Service
public class FurnitureReviewService {

	@Autowired
	private FurnitureReviewMapper furnitureReviewMapper;
	
	public void insertData(FurnitureReviewDTO dto) throws Exception{
		furnitureReviewMapper.insertData(dto);
	}
	
	public List<FurnitureReviewDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return furnitureReviewMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public FurnitureReviewDTO getReadData(int num) throws Exception{
		return furnitureReviewMapper.getReadData(num);
	}
	
	public void updateData(FurnitureReviewDTO dto) throws Exception{
		furnitureReviewMapper.updateData(dto);
	}
	
	public void deleteData(int num) throws Exception{
		furnitureReviewMapper.deleteData(num);
	}
}
