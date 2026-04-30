package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.FurnitureDTO;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.util.furnitureCode;

@Service
public class FurnitureService {

	@Autowired
	private FurnitureMapper furnitureMapper;
	
	public int countByFCode(String f_code) throws Exception {
		return furnitureMapper.countByFCode(f_code);
	}
	
	public void insertData(FurnitureDTO dto) throws Exception{
		
		String f_code = null;
		
		for(int i = 0; i< 20; i++) {
			String temp = furnitureCode.generateCode(dto.getCompanyCode(), dto.getCatagoryCode());
			
			if(furnitureMapper.countByFCode(temp) == 0) {
				f_code = temp; 
				break;
			}				
		}
		
		if(f_code == null) {
			throw new IllegalStateException("가구 코드 생성 불가.");
		}

		dto.setF_code(f_code);
		furnitureMapper.insertData(dto);
	}
	
	public List<FurnitureDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return furnitureMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public FurnitureDTO getReadData(String f_code) throws Exception{
		return furnitureMapper.getReadData(f_code);
	}
	
	public void updateData(FurnitureDTO dto) throws Exception{
		furnitureMapper.updateData(dto);
	}
	
	public void deleteData(String f_code) throws Exception{
		furnitureMapper.deleteData(f_code);
	}
}
