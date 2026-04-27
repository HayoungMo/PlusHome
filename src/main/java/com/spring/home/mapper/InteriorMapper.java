package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;


@Mapper
public interface InteriorMapper {
	
	public void insertData(InteriorDTO dto) throws Exception;
	
	public List<InteriorDTO> getLists(String searchKey, String searchValue);
	
	public List<InteriorDTO> getReadData(CompanyDTO dto) throws Exception;
	

}
