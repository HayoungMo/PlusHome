package com.spring.home.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.spring.home.dto.OrderClaimDTO;

@Mapper
public interface OrderClaimMapper {

	public void insertData(OrderClaimDTO dto) throws Exception;
	
	public OrderClaimDTO getByCartCode(
			@Param("c_code") String c_code,
			@Param("id") String id
			) throws Exception;

	public List<OrderClaimDTO> getMyClaims(String id) throws Exception;
	
	public List<OrderClaimDTO> getAllClaims() throws Exception;
	
	public int updateStatus(
			@Param("claim_code") String claim_code,
			@Param("claim_status") int claim_status
			) throws Exception;
	
	public List<OrderClaimDTO> getCompanyClaims(@Param("company_id") String company_id) throws Exception;

	public int updateType(
		    @Param("claim_code") String claim_code,
		    @Param("claim_type") int claim_type
		) throws Exception;

	public OrderClaimDTO getByClaimCode(String claim_code) throws Exception;

	public List<Map<String, Object>> getListByCompany(Map<String, Object> params) throws Exception;

	public Map<String, Object> getCompanyOrderClaimStatusCounts(Map<String, Object> params) throws Exception;
	
}
