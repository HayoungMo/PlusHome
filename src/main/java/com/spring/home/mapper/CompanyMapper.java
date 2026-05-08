package com.spring.home.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.spring.home.dto.CompanyDTO;

@Mapper
public interface CompanyMapper {

	public void insertData(CompanyDTO dto) throws Exception;
	
	public List<CompanyDTO> getLists(int start, int end, String searchKey, String searchValue) throws Exception;
	
	public CompanyDTO getReadData(String c_id) throws Exception;
	
	public void updateData(CompanyDTO dto) throws Exception;
	
	public void deleteData(String c_id) throws Exception;

	public List<CompanyDTO> getReadDataList(String c_id) throws Exception;
	
	public int insertDataDashboard(CompanyDTO dto) throws Exception;
	
	public int updateCompanyOne(CompanyDTO dto) throws Exception;
}
