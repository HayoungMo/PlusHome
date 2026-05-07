package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.mapper.CompanyMapper;

@Service
public class CompanyService {

	@Autowired
	private CompanyMapper companyMapper;
	
	public void insertData(CompanyDTO dto) throws Exception{
		companyMapper.insertData(dto);
	}
	
	public List<CompanyDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception{
		return companyMapper.getLists(start, end, searchKey, searchValue);
	}
	
	public CompanyDTO getReadData(String c_id) throws Exception{
		return companyMapper.getReadData(c_id);
	}
	
	public void updateData(CompanyDTO dto) throws Exception{
		companyMapper.updateData(dto);
	}
	
	public void deleteData(String c_id) throws Exception{
		companyMapper.deleteData(c_id);
	}
	
	public List<CompanyDTO> getReadDataList(String c_id) throws Exception{
		return companyMapper.getReadDataList(c_id);
	}
	
	public int insertDataDashboard(CompanyDTO dto) throws Exception{
		return companyMapper.insertDataDashboard(dto);
	}
}
