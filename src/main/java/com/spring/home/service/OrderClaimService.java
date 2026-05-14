package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.OrderClaimDTO;
import com.spring.home.mapper.OrderClaimMapper;
import com.spring.home.util.furnitureCode;

@Service
public class OrderClaimService {

	@Autowired
	private OrderClaimMapper orderClaimMapper;
	
	public String createClaim(String id, OrderClaimDTO dto) throws Exception{
		OrderClaimDTO exists = orderClaimMapper.getByCartCode(dto.getC_code(), id);
	
		if(exists != null) {
			throw  new RuntimeException("이미 교환 / 반품 신청이 접수된 주문입니다.");
		}
		
		String claim_code = furnitureCode.generateClaimCode();
		
		dto.setClaim_code(claim_code);
		dto.setId(id);
		dto.setClaim_status(0);
		
		orderClaimMapper.insertData(dto);
		
		return claim_code;
	}
	
	public OrderClaimDTO checkClaim(String id, String c_code) throws Exception {
        return orderClaimMapper.getByCartCode(c_code, id);
    }

    public List<OrderClaimDTO> getMyClaims(String id) throws Exception {
        return orderClaimMapper.getMyClaims(id);
    }

    public List<OrderClaimDTO> getAllClaims() throws Exception {
        return orderClaimMapper.getAllClaims();
    }

    public void updateStatus(String claim_code, int claim_status) throws Exception {
        int result = orderClaimMapper.updateStatus(claim_code, claim_status);

        if (result != 1) {
            throw new RuntimeException("교환/반품 상태 변경에 실패했습니다.");
        }
    }
}
