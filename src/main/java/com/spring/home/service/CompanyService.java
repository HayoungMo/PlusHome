package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CompanyDTO;
import com.spring.home.dto.ImageQueryDTO;
import com.spring.home.mapper.CompanyMapper;

@Service
public class CompanyService {

	@Autowired
	private CompanyMapper companyMapper;

	public void insertData(CompanyDTO dto) throws Exception {
		companyMapper.insertData(dto);
	}

	public List<CompanyDTO> getLists() throws Exception {
		return companyMapper.getLists();
	}

	public CompanyDTO getReadData(String c_id) throws Exception {
		return companyMapper.getReadData(c_id);
	}

	public void updateData(CompanyDTO dto) throws Exception {
		companyMapper.updateData(dto);
	}

	public void deleteData(String c_id) throws Exception {
		companyMapper.deleteData(c_id);
	}

	public List<CompanyDTO> getReadDataList(String c_id) throws Exception {
		return companyMapper.getReadDataList(c_id);
	}

	public int insertDataDashboard(CompanyDTO dto) throws Exception {
		return companyMapper.insertDataDashboard(dto);
	}

	public int updateCompany(List<CompanyDTO> dtoList) {
		int total = 0;
		for (CompanyDTO dto : dtoList) {
			try {
				int result = companyMapper.updateCompanyOne(dto);
				total += result;
			} catch (Exception e) {
				System.out.println(e.toString());
				e.printStackTrace();
			}
		}
		return total;
	}

	public int deleteCompany(List<CompanyDTO> dtoList) {
		int total = 0;
		for (CompanyDTO dto : dtoList) {
			try {
				int result = companyMapper.deleteCompanyOne(dto);
				total += result;
			} catch (Exception e) {
				System.out.println(e.toString());
				e.printStackTrace();
			}
		}
		return total;
	}

	public List<CompanyDTO> getListByCompany(CompanyDTO dto) throws Exception {
		return companyMapper.getListByCompany(dto);
	}
}
