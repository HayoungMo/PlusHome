package com.spring.home.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CartOptionDTO;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.PaymentDTO;
import com.spring.home.dto.StockCheckDTO;
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

	private void updateWallet(String id, int money) throws Exception {
		WalletDTO wallet = new WalletDTO();
		wallet.setId(id);
		wallet.setMoney(money);
		
		int result = walletMapper.updateData(wallet);
		
		if (result != 1) {
			throw new RuntimeException("지갑 정보를 찾을 수 없습니다.");
		}
	}
	
	private String getCompanyId(String f_code) throws Exception{
		FurnitureDTO furniture = furnitureMapper.getReadData(f_code);
		
		if(furniture == null || furniture.getC_id() == null || 
				furniture.getC_id().trim().isEmpty()) {
			throw new RuntimeException("상품 업체 정보를 찾을 수 없습니다.");
		}
		
		return furniture.getC_id();
	}
	
	@Transactional
	public void pay(String id, PaymentDTO dto) throws Exception {
		if (dto.getC_codeList() == null || dto.getC_codeList().isEmpty()) {
			throw new RuntimeException("결제할 상품이 없습니다.");
		}

		int usePoint = dto.getUse_point();
		int couponDiscount = dto.getCouponDiscount();
		
		Map<String, Integer> couponDiscountMap = new HashMap<>();
		
		if(dto.getCouponList() != null) {
			for(PaymentDTO.CouponPayDTO couponItem : dto.getCouponList()) {
				int itemCouponDiscount = Math.max(0, couponItem.getCoupon_discount());
				couponDiscountMap.put(couponItem.getC_code(), itemCouponDiscount);
			}
		}

		if (usePoint < 0) {
			throw new RuntimeException("사용 포인트가 올바르지 않습니다.");
		}

		if (couponDiscount < 0) {
			throw new RuntimeException("쿠폰 할인 금액이 올바르지 않습니다.");
		}

		if (usePoint > 0) {
			int availablePoint = cartMapper.getAvailablePoint(id);

			if (availablePoint < usePoint) {
				throw new RuntimeException("사용 가능한 포인트가 부족합니다.");
			}
		}

		List<PaymentItem> paymentItems = new ArrayList<>();
		int productTotal = 0;

		for (String c_code : dto.getC_codeList()) {
			CartDTO cart = cartMapper.getReadData(c_code);

			if (cart == null || !id.equals(cart.getId()) || !"N".equals(cart.getF_status())) {
				throw new RuntimeException("결제 가능한 장바구니 상품이 아닙니다.");
			}

			List<CartOptionDTO> optionList = cartOptionMapper.getByCartCode(c_code);
			
			int itemProductTotal = calculateCartProductTotal(cart, optionList);

			int itemCouponDiscount = couponDiscountMap.getOrDefault(c_code, 0);

			if (itemCouponDiscount > itemProductTotal) {
				throw new RuntimeException("쿠폰 할인 금액이 상품 금액보다 클 수 없습니다.");
			}

			paymentItems.add(new PaymentItem(cart, optionList, itemProductTotal, itemCouponDiscount));
			
			productTotal += itemProductTotal;
		}

		if (productTotal <= 0) {
			throw new RuntimeException("결제 금액이 올바르지 않습니다.");
		}

		int deliveryTotal = Math.max(0, dto.getDeliveryTotal());
		int originalTotal = productTotal + deliveryTotal;

		if (usePoint + couponDiscount > originalTotal) {
			throw new RuntimeException("할인 금액이 결제 금액보다 클 수 없습니다.");
		}

		allocatePaymentAmount(paymentItems, productTotal, deliveryTotal, usePoint);

		int finalPayTotal = 0;
		for (PaymentItem item : paymentItems) {
			finalPayTotal += item.payTotal;
		}

		WalletDTO wallet = walletMapper.getReadData(id);

		if (wallet == null || wallet.getMoney() < finalPayTotal) {
			throw new RuntimeException("지갑 잔액이 부족합니다.");
		}

		updateWallet(id, -finalPayTotal);

		for (PaymentItem item : paymentItems) {
			decreaseStock(item.cart, item.optionList);

			updateWallet(getCompanyId(item.cart.getF_code()), item.payTotal);
			
			int result = cartMapper.updatePaymentStatus(
				item.cart.getC_code(),
				id,
				dto.getF_name(),
				dto.getF_tel(),
				dto.getF_addr(),
				item.payTotal,
				item.usePoint,
				item.couponDiscount
			);

			if (result != 1) {
				throw new RuntimeException("결제 상품 상태 변경에 실패했습니다.");
			}
		}
	}

	private void allocatePaymentAmount(
			List<PaymentItem> paymentItems,
			int productTotal,
			int deliveryTotal,
			int usePoint
		) {
			int allocatedDelivery = 0;
			int allocatedUsePoint = 0;

			for (int i = 0; i < paymentItems.size(); i++) {
				PaymentItem item = paymentItems.get(i);
				boolean last = i == paymentItems.size() - 1;

				int itemDelivery = last
					? deliveryTotal - allocatedDelivery
					: deliveryTotal * item.productTotal / productTotal;

				allocatedDelivery += itemDelivery;

				int itemOriginalTotal = item.productTotal + itemDelivery;
				int originalTotal = productTotal + deliveryTotal;

				int itemUsePoint = last
					? usePoint - allocatedUsePoint
					: usePoint * itemOriginalTotal / originalTotal;

				allocatedUsePoint += itemUsePoint;

				item.usePoint = itemUsePoint;
				item.payTotal = Math.max(
					0,
					itemOriginalTotal - itemUsePoint - item.couponDiscount
				);
			}
		}

	private int calculateCartProductTotal(CartDTO cart, List<CartOptionDTO> optionList) {
		int optionTotal = 0;

		if (optionList != null) {
			for (CartOptionDTO option : optionList) {
				optionTotal += option.getCo_price();
			}
		}

		return (cart.getF_price() + optionTotal) * cart.getF_count();
	}

	private void decreaseStock(CartDTO cart, List<CartOptionDTO> optionList) {
		if (optionList == null || optionList.isEmpty()) {
			int stockResult = furnitureMapper.decreaseStock(
				cart.getF_code(),
				cart.getF_count()
			);

			if (stockResult != 1) {
				throw new RuntimeException("상품 재고가 부족합니다.");
			}

			return;
		}

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

	private void increaseStock(CartDTO cart, List<CartOptionDTO> optionList) {
		if (optionList == null || optionList.isEmpty()) {
			int stockResult = furnitureMapper.increaseStock(
				cart.getF_code(),
				cart.getF_count()
			);

			if (stockResult != 1) {
				throw new RuntimeException("상품 재고 복구에 실패했습니다.");
			}

			return;
		}

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

	public List<CartDTO> getMyOrders(String id) throws Exception {
		return cartMapper.getMyOrders(id);
	}

	@Transactional
	public void cancelOrder(String id, String c_code) throws Exception {
		CartDTO cart = cartMapper.getReadData(c_code);

		if (cart == null || !id.equals(cart.getId())) {
			throw new RuntimeException("주문 정보를 찾을 수 없습니다.");
		}

		if (cart.getF_dstatus() != 0 && cart.getF_dstatus() != 1) {
			throw new RuntimeException("배송 준비중인 상품만 주문취소할 수 있습니다.");
		}

		List<CartOptionDTO> optionList = cartOptionMapper.getByCartCode(c_code);

		increaseStock(cart, optionList);

		int refundMoney = cart.getPay_total();

		if (refundMoney <= 0) {
			refundMoney = calculateCartProductTotal(cart, optionList);
		}

		updateWallet(getCompanyId(cart.getF_code()), -refundMoney);
		updateWallet(id, refundMoney);

		int result = cartMapper.cancelOrder(c_code, id);

		if (result != 1) {
			throw new RuntimeException("주문취소 처리에 실패했습니다.");
		}

		cartMapper.restoreUsedPoint(c_code, id);
		cartMapper.restoreCouponDiscountAsPoint(c_code, id);
	}

	@Transactional
	public void confirmOrder(String id, String c_code) throws Exception {
		CartDTO cart = cartMapper.getReadData(c_code);

		if (cart == null || !id.equals(cart.getId())) {
			throw new RuntimeException("주문 정보를 찾을 수 없습니다.");
		}

		if (cart.getF_dstatus() != 4) {
			throw new RuntimeException("배송완료 상태에서만 구매확정할 수 있습니다.");
		}

		int result = cartMapper.updateDeliveryStatus(c_code, id, 5);

		if (result != 1) {
			throw new RuntimeException("구매확정 처리에 실패했습니다.");
		}

		cartMapper.savePoint(c_code, id);
	}

	private static class PaymentItem {
		private final CartDTO cart;
		private final List<CartOptionDTO> optionList;
		private final int productTotal;
		private int payTotal;
		private int usePoint;
		private int couponDiscount;

		private PaymentItem(
			CartDTO cart,
			List<CartOptionDTO> optionList,
			int productTotal,
			int couponDiscount
		) {
			this.cart = cart;
			this.optionList = optionList;
			this.productTotal = productTotal;
			this.couponDiscount = couponDiscount;
		}
	}
	
	public Map<String, Object> checkStock(List<String> c_codes) throws Exception{
		List<StockCheckDTO> shortageItems = new ArrayList<>();
		
		for(String c_code : c_codes) {
			CartDTO cart = cartMapper.getReadData(c_code);
			
			if(cart == null) {
				continue;
			}
			
			FurnitureDTO furniture = furnitureMapper.getReadData(cart.getF_code());
			String productName = furniture != null ? furniture.getF_name() : cart.getF_code();
			int furnitureStock = furnitureMapper.getFurnitureStock(cart.getF_code());
			int requestedCount = cart.getF_count();
			
			if(furnitureStock < requestedCount) {
				StockCheckDTO item = new StockCheckDTO();
				item.setC_code(cart.getC_code());
	            item.setF_code(cart.getF_code());
	            item.setProductName(productName);
	            item.setType("FURNITURE");
	            item.setRequestedCount(requestedCount);
	            item.setStock(furnitureStock);
	            item.setMessage("상품 재고가 부족합니다.");

	            shortageItems.add(item);
			}
			
			List<CartOptionDTO> options = cartOptionMapper.getByCartCode(c_code);

	        for (CartOptionDTO option : options) {
	            Integer optionStockValue = optionsMapper.getOptionStock(
	                option.getF_code(),
	                option.getCo_select(),
	                option.getCo_text()
	            );

	            int optionStock = optionStockValue == null ? 0 : optionStockValue;
	            int optionRequestedCount = cart.getF_count();

	            if (optionStock < optionRequestedCount) {
	                StockCheckDTO item = new StockCheckDTO();
	                item.setC_code(option.getC_code());
	                item.setF_code(option.getF_code());
	                item.setProductName(productName);
	                item.setType("OPTION");
	                item.setOptionName(option.getCo_select());
	                item.setOptionValue(option.getCo_text());
	                item.setRequestedCount(optionRequestedCount);
	                item.setStock(optionStock);
	                item.setMessage("선택한 옵션 재고가 부족합니다.");

	                shortageItems.add(item);
	            }
	        }
	    }

	    Map<String, Object> result = new HashMap<>();
	    result.put("ok", shortageItems.isEmpty());
	    result.put("items", shortageItems);

	    return result;
	    
		}
	}

