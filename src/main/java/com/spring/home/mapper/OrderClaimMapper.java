package com.spring.home.mapper;

import java.util.List;

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
	
	public List<OrderClaimDTO> getCompanyClaims(String company_id) throws Exception;

	public int updateType(
		    @Param("claim_code") String claim_code,
		    @Param("claim_type") int claim_type
		) throws Exception;
}
