package com.spring.home.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CartOptionDTO;
import com.spring.home.dto.PaymentDTO;
import com.spring.home.dto.WalletDTO;
import com.spring.home.mapper.CartMapper;
import com.spring.home.mapper.CartOptionMapper;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.mapper.OptionsMapper;
import com.spring.home.mapper.WalletMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

	private final WalletMapper walletMapper;
	private final CartMapper cartMapper;
	private final CartOptionMapper cartOptionMapper;
	private final OptionsMapper optionsMapper;
	private final FurnitureMapper furnitureMapper;
	
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

		for (String c_code : dto.getC_codeList()) {
		    CartDTO cart = cartMapper.getReadData(c_code);

		    if (cart == null || !id.equals(cart.getId()) || !"N".equals(cart.getF_status())) {
		        throw new RuntimeException("결제 가능한 장바구니 상품이 아닙니다.");
		    }

		    List<CartOptionDTO> optionList = cartOptionMapper.getByCartCode(c_code);

		    if (optionList == null || optionList.isEmpty()) {
		        int stockResult = furnitureMapper.decreaseStock(
		            cart.getF_code(),
		            cart.getF_count()
		        );

		        if (stockResult != 1) {
		            throw new RuntimeException("상품 재고가 부족합니다.");
		        }
		    } else {
		        for (CartOptionDTO option : optionList) {
		            int optionResult = optionsMapper.decreaseOptionStock(
		                cart.getF_code(),
		                option.getCo_select(),
		                option.getCo_text(),
		                cart.getF_count()
		            );

		            if (optionResult != 1) {
		                throw new RuntimeException("옵션 재고가 부족합니다.");
		            }
		        }

		        int stockResult = furnitureMapper.decreaseStock(
		            cart.getF_code(),
		            cart.getF_count()
		        );

		        if (stockResult != 1) {
		            throw new RuntimeException("상품 재고가 부족합니다.");
		        }
		    }

		    int result = cartMapper.updatePaymentStatus(
		        c_code,
		        id,
		        dto.getF_name(),
		        dto.getF_tel(),
		        dto.getF_addr()
		    );

		    if (result != 1) {
		        throw new RuntimeException("결제 상품 상태 변경에 실패했습니다.");
		    }
		}

	}
	
	public List<CartDTO> getMyOrders(String id) throws Exception{
		return cartMapper.getMyOrders(id);
	}
	
	public void cancelOrder(String id, String c_code) throws Exception {
	    CartDTO cart = cartMapper.getReadData(c_code);

	    if (cart == null || !id.equals(cart.getId())) {
	        throw new RuntimeException("주문 정보를 찾을 수 없습니다.");
	    }

	    if (cart.getF_dstatus() != 0 && cart.getF_dstatus() != 1) {
	        throw new RuntimeException("배송 준비중인 상품만 주문취소할 수 있습니다.");
	    }

	    List<CartOptionDTO> optionList = cartOptionMapper.getByCartCode(c_code);

	    if (optionList == null || optionList.isEmpty()) {
	        int stockResult = furnitureMapper.increaseStock(
	            cart.getF_code(),
	            cart.getF_count()
	        );

	        if (stockResult != 1) {
	            throw new RuntimeException("상품 재고 복구에 실패했습니다.");
	        }
	    } else {
	        for (CartOptionDTO option : optionList) {
	            int optionResult = optionsMapper.increaseOptionStock(
	                cart.getF_code(),
	                option.getCo_select(),
	                option.getCo_text(),
	                cart.getF_count()
	            );

	            if (optionResult != 1) {
	                throw new RuntimeException("옵션 재고 복구에 실패했습니다.");
	            }
	        }

	        int stockResult = furnitureMapper.increaseStock(
	            cart.getF_code(),
	            cart.getF_count()
	        );

	        if (stockResult != 1) {
	            throw new RuntimeException("상품 재고 복구에 실패했습니다.");
	        }
	    }

	    WalletDTO refundWallet = new WalletDTO();
	    refundWallet.setId(id);
	    refundWallet.setMoney(cart.getF_price() * cart.getF_count());

	    walletMapper.updateData(refundWallet);

	    int result = cartMapper.cancelOrder(c_code, id);

	    if (result != 1) {
	        throw new RuntimeException("주문취소 처리에 실패했습니다.");
	    }
	}

	public void confirmOrder(String id, String c_code) throws Exception{
		CartDTO cart = cartMapper.getReadData(c_code);
		
		if(cart == null || !id.equals(cart.getId())) {
			throw new RuntimeException("주문 정보를 찾을 수 없습니다.");
		}
		
		if(cart.getF_dstatus() != 4) {
			throw new RuntimeException("배송완료 상태에서만 구매확정할 수 있습니다.");
		}
		
		int result = cartMapper.updateDeliveryStatus(c_code, id, 5);
		
		if (result != 1) {
			throw new RuntimeException("구매확정 처리에 실패했습니다.");
		}
	}
	
}
