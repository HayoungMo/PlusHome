package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.OrderClaimDTO;
import com.spring.home.dto.OrderClaimUpdateDTO;
import com.spring.home.dto.WalletDTO;
import com.spring.home.mapper.CartMapper;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.mapper.OrderClaimMapper;
import com.spring.home.mapper.WalletMapper;
import com.spring.home.util.furnitureCode;

@Service
public class OrderClaimService {

    @Autowired
    private OrderClaimMapper orderClaimMapper;
    
    @Autowired
    private CartMapper cartMapper; 
    
    @Autowired
    private WalletMapper walletMapper;
    
    @Autowired
    private FurnitureMapper furnitureMapper;
    
    public String createClaim(String id, OrderClaimDTO dto) throws Exception {
        OrderClaimDTO exists = orderClaimMapper.getByCartCode(dto.getC_code(), id);

        if (exists != null) {
            throw new RuntimeException("이미 교환 / 반품 신청이 접수된 주문입니다.");
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

    public List<OrderClaimDTO> getCompanyClaims(String companyId) throws Exception {
        return orderClaimMapper.getCompanyClaims(companyId);
    }

    private void refundReturnClaim(OrderClaimDTO claim) throws Exception{
    	CartDTO cart = cartMapper.getReadData(claim.getC_code());
    	
    	if (cart == null || !claim.getId().equals(cart.getId())) {
    		throw new RuntimeException("주문 정보를 찾을 수 없습니다.");
    	}
    	
    	int refundMoney = cart.getPay_total();
    	
    	if (refundMoney <= 0) {
    		throw new RuntimeException("환불 금액이 올바르지 않습니다.");
    	}
    	
    	FurnitureDTO furniture = furnitureMapper.getReadData(cart.getF_code());
    	
    	if (furniture == null || furniture.getC_id() == null || furniture.getC_id().trim().isEmpty()) {
    		throw new RuntimeException("상품 업체 정보를 찾을 수 없습니다.");
    	}
    	
    	updateWallet(furniture.getC_id(), -refundMoney);
    	updateWallet(claim.getId(), refundMoney);
    }
    
    private void updateWallet(String id, int money) throws Exception {
    	WalletDTO wallet = new WalletDTO();
    	wallet.setId(id);
    	wallet.setMoney(money);
    	
    	int result = walletMapper.updateData(wallet);
    	
    	if (result != 1) {
    		throw new RuntimeException("지갑 정보를 찾을 수 없습니다.");
    	}
    }
    
    @Transactional
    public void updateStatus(String claim_code, int claim_status) throws Exception {
        validateClaimStatus(claim_status);

        OrderClaimDTO claim = orderClaimMapper.getByClaimCode(claim_code);

        if (claim == null) {
            throw new RuntimeException("교환/반품 신청 정보를 찾을 수 없습니다.");
        }
        
        if (claim.getClaim_status() == 3) {
        	throw new RuntimeException("이미 처리 완료된 신청입니다.");
        }

        int result = orderClaimMapper.updateStatus(claim_code, claim_status);

        if (result != 1) {
            throw new RuntimeException("교환/반품 상태 변경에 실패했습니다.");
        }

        if (claim_status == 3 && claim.getClaim_type() == 2) {
        	refundReturnClaim(claim);
        	
            cartMapper.restoreUsedPoint(claim.getC_code(), claim.getId());
            cartMapper.restoreCouponDiscountAsPoint(claim.getC_code(), claim.getId());
        }
    }

    public void updateType(String claim_code, int claim_type) throws Exception {
        validateClaimType(claim_type);

        int result = orderClaimMapper.updateType(claim_code, claim_type);

        if (result != 1) {
            throw new RuntimeException("교환/반품 유형 변경에 실패했습니다.");
        }
    }

    @Transactional
    public void updateClaim(OrderClaimUpdateDTO dto) throws Exception {
        validateClaimType(dto.getClaim_type());
        validateClaimStatus(dto.getClaim_status());

        int typeResult = orderClaimMapper.updateType(
            dto.getClaim_code(),
            dto.getClaim_type()
        );

        if (typeResult != 1) {
            throw new RuntimeException("교환/반품 유형 변경에 실패했습니다.");
        }

        updateStatus(dto.getClaim_code(), dto.getClaim_status());
    }

    @Transactional
    public void updateBulk(List<OrderClaimUpdateDTO> list) throws Exception {
        if (list == null || list.isEmpty()) {
            throw new RuntimeException("변경할 교환/반품 내역이 없습니다.");
        }

        for (OrderClaimUpdateDTO dto : list) {
            updateClaim(dto);
        }
    }

    private void validateClaimType(int claim_type) {
        if (claim_type != 1 && claim_type != 2) {
            throw new RuntimeException("잘못된 교환/반품 유형입니다.");
        }
    }

    private void validateClaimStatus(int claim_status) {
        if (
            claim_status != -1 &&
            claim_status != 0 &&
            claim_status != 1 &&
            claim_status != 2 &&
            claim_status != 3
        ) {
            throw new RuntimeException("잘못된 교환/반품 상태입니다.");
        }
    }
}
