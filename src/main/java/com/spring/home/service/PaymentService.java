package com.spring.home.service;

import java.util.ArrayList;
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
	public void pay(String id, PaymentDTO dto) throws Exception {
		if (dto.getC_codeList() == null || dto.getC_codeList().isEmpty()) {
			throw new RuntimeException("결제할 상품이 없습니다.");
		}

		int usePoint = dto.getUse_point();
		int couponDiscount = dto.getCouponDiscount();

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

			paymentItems.add(new PaymentItem(cart, optionList, itemProductTotal));
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

		allocatePaymentAmount(paymentItems, productTotal, deliveryTotal, usePoint, couponDiscount);

		int finalPayTotal = 0;
		for (PaymentItem item : paymentItems) {
			finalPayTotal += item.payTotal;
		}

		WalletDTO wallet = walletMapper.getReadData(id);

		if (wallet == null || wallet.getMoney() < finalPayTotal) {
			throw new RuntimeException("지갑 잔액이 부족합니다.");
		}

		WalletDTO payWallet = new WalletDTO();
		payWallet.setId(id);
		payWallet.setMoney(-finalPayTotal);

		walletMapper.updateData(payWallet);

		for (PaymentItem item : paymentItems) {
			decreaseStock(item.cart, item.optionList);

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
		int usePoint,
		int couponDiscount
	) {
		int allocatedDelivery = 0;
		int allocatedUsePoint = 0;
		int allocatedCouponDiscount = 0;

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

			int itemCouponDiscount = last
				? couponDiscount - allocatedCouponDiscount
				: couponDiscount * itemOriginalTotal / originalTotal;

			allocatedUsePoint += itemUsePoint;
			allocatedCouponDiscount += itemCouponDiscount;

			item.usePoint = itemUsePoint;
			item.couponDiscount = itemCouponDiscount;
			item.payTotal = Math.max(0, itemOriginalTotal - itemUsePoint - itemCouponDiscount);
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

		WalletDTO refundWallet = new WalletDTO();
		refundWallet.setId(id);
		refundWallet.setMoney(refundMoney);

		walletMapper.updateData(refundWallet);

		int result = cartMapper.cancelOrder(c_code, id);

		if (result != 1) {
			throw new RuntimeException("주문취소 처리에 실패했습니다.");
		}

		cartMapper.restoreUsedPoint(c_code, id);
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

		private PaymentItem(CartDTO cart, List<CartOptionDTO> optionList, int productTotal) {
			this.cart = cart;
			this.optionList = optionList;
			this.productTotal = productTotal;
		}
	}
}
