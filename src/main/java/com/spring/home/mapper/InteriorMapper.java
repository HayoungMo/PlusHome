package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;


@Mapper
public interface InteriorMapper {
	
	public void insertData(InteriorDTO dto) throws Exception;
	
	public List<CompanyDTO> getLists();
	
	public List<InteriorDTO> getReadData(CompanyDTO dto) throws Exception;	
	
	public List<InteriorExampleDTO> getExamples(CompanyDTO dto) throws Exception;	

}
