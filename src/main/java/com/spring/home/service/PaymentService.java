package com.spring.home.service;

import javax.management.RuntimeErrorException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.PaymentDTO;
import com.spring.home.dto.WalletDTO;
import com.spring.home.mapper.CartMapper;
import com.spring.home.mapper.WalletMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

	private final WalletMapper walletMapper;
	private final CartMapper cartMapper;
	
	@Transactional
	public void pay(String id, PaymentDTO dto) throws Exception{
		if (dto.getC_codeList() == null || dto.getC_codeList().isEmpty()) {
			throw new RuntimeException("결제할 상품이 없습니다.");
		}
		
		WalletDTO wallet = walletMapper.getReadData(id);
		
		if (wallet == null || wallet.getMoney() < dto.getPayTotal()) {
			throw new RuntimeException("지갑 잔액이 부족합니다.");
		}
		
		WalletDTO payWallet = new WalletDTO();
		payWallet.setId(id);
		payWallet.setMoney(-dto.getPayTotal());
		
		walletMapper.updateData(payWallet);

		for(String c_code : dto.getC_codeList()) {
			int result = cartMapper.updatePaymentStatus(
					c_code, 
					id, 
					dto.getF_name(), 
					dto.getF_tel(), 
					dto.getF_addr()
			);
			
			if (result != 1) {
				throw new RuntimeException("결제 상품 상태 변경에 실패힜습니다.");
			}
		}
	}
}
