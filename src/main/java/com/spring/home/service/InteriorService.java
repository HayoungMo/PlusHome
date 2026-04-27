package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.InteriorDTO;
import com.spring.home.dto.InteriorExampleDTO;
import com.spring.home.mapper.InteriorMapper;

@Service
public class InteriorService {	

	@Autowired
	private InteriorMapper interiorMapper;
	
	public void insertData(InteriorDTO dto) throws Exception{
		interiorMapper.insertData(dto);
	}

	public List<CompanyDTO> getLists() {
		// TODO Auto-generated method stub
		return interiorMapper.getLists();
	}


	public List<InteriorDTO> getReadData(CompanyDTO companyDTO) throws Exception {
		// TODO Auto-generated method stub
		return interiorMapper.getReadData(companyDTO);
	}
	
	public List<InteriorExampleDTO> getExamples(CompanyDTO dto) throws Exception{
		return interiorMapper.getExamples(dto);
	};	

}
