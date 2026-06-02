package com.spring.home.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CartOptionDTO;
import com.spring.home.dto.CouponDTO;
import com.spring.home.dto.FurnitureDTO;
import com.spring.home.dto.FurnitureReviewDTO;
import com.spring.home.dto.OrderClaimDTO;
import com.spring.home.dto.PaymentDTO;
import com.spring.home.dto.StockCheckDTO;
import com.spring.home.dto.WalletDTO;
import com.spring.home.mapper.CartMapper;
import com.spring.home.mapper.CartOptionMapper;
import com.spring.home.mapper.CouponMapper;
import com.spring.home.mapper.FurnitureMapper;
import com.spring.home.mapper.FurnitureReviewMapper;
import com.spring.home.mapper.OptionsMapper;
import com.spring.home.mapper.OrderClaimMapper;
import com.spring.home.mapper.WalletMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {

	//배송비~
	private static final int FREE_DELIVERY_LIMIT = 50000;
	
	private final WalletMapper walletMapper;
	private final CartMapper cartMapper;
	private final CartOptionMapper cartOptionMapper;
	private final OptionsMapper optionsMapper;
	private final FurnitureMapper furnitureMapper;
	private final CouponMapper couponMapper;
	private final FurnitureReviewMapper furnitureReviewMapper;
	private final OrderClaimMapper orderClaimMapper;
	
	//대소문자 구분 안함
	private String normalizeCouponValue(String value) {
		//침대 -> bed 변환이 안되서, 백에서 터질수 있어서 임시 방지
		if (value == null) {
	        return "";
	    }

	    String text = value.trim();

	    switch (text) {
	        case "침대": return "bed";
	        case "소파": return "sofa";
	        case "책상": return "desk";
	        case "의자": return "chair";
	        case "식탁": return "table";
	        case "수납장": return "storage";
	        case "조명": return "light";
	        case "매트리스": return "mattress";
	        case "화장대": return "dresser";
	        case "옷장": return "closet";
	        default: return text.toLowerCase();
	    }
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
	
	private String getCompanyId(String f_code) throws Exception{
		FurnitureDTO furniture = furnitureMapper.getReadData(f_code);
		
		if(furniture == null || furniture.getC_id() == null || 
				furniture.getC_id().trim().isEmpty()) {
			throw new RuntimeException("상품 업체 정보를 찾을 수 없습니다.");
		}
		
		return furniture.getC_id();
	}
	
	private Map<String, String> getCouponCodeMap(List<PaymentDTO.CouponPayDTO> couponList){
		Map<String, String> couponCodeMap = new HashMap<>();
		Set<String> usedCouponCodes = new HashSet<>();
		
		if (couponList == null) {
			return couponCodeMap;
		}
		
		for (PaymentDTO.CouponPayDTO couponItem : couponList) {
			if(couponItem == null || couponItem.getCoupon_code() == null || couponItem.getCoupon_code().trim().isEmpty()) {
				continue;
			}
			
			 String couponCode = couponItem.getCoupon_code().trim();

	        if (!usedCouponCodes.add(couponCode)) {
	            throw new RuntimeException("같은 쿠폰은 한 번만 사용할 수 있습니다.");
	        }

	        if (couponItem.getC_code() == null || couponItem.getC_code().trim().isEmpty()) {
	            throw new RuntimeException("쿠폰 적용 상품 정보가 올바르지 않습니다.");
	        }

	        couponCodeMap.put(couponItem.getC_code().trim(), couponCode);
	        
		}
		
		return couponCodeMap;
	}
	
	private int calculateDeliveryTotal(List<PaymentItem> paymentItems) throws Exception {
	    Map<String, Integer> companyProductTotalMap = new HashMap<>();
	    Map<String, Integer> companyDeliveryMap = new HashMap<>();

	    for (PaymentItem item : paymentItems) {
	        FurnitureDTO furniture = getFurnitureOrThrow(item.cart.getF_code());
	        String companyId = furniture.getC_id();

	        companyProductTotalMap.put(
	            companyId,
	            companyProductTotalMap.getOrDefault(companyId, 0) + item.productTotal
	        );

	        companyDeliveryMap.put(
	            companyId,
	            Math.max(
	                companyDeliveryMap.getOrDefault(companyId, 0),
	                Math.max(0, furniture.getF_deliveryPrice())
	            )
	        );
	    }

	    int deliveryTotal = 0;

	    for (String companyId : companyProductTotalMap.keySet()) {
	        int companyProductTotal = companyProductTotalMap.get(companyId);

	        if (companyProductTotal < FREE_DELIVERY_LIMIT) {
	            deliveryTotal += companyDeliveryMap.getOrDefault(companyId, 0);
	        }
	    }

	    return deliveryTotal;
	}
	
	private int applyCoupons(
	        String id,
	        Map<String, String> couponCodeMap,
	        List<PaymentItem> paymentItems
	) throws Exception {
	    int totalCouponDiscount = 0;

	    for (PaymentItem item : paymentItems) {
	        String couponCode = couponCodeMap.get(item.cart.getC_code());

	        if (couponCode == null) {
	            continue;
	        }

	        CouponDTO coupon = couponMapper.getValidUserCoupon(id, couponCode);

	        if (coupon == null) {
	            throw new RuntimeException("사용할 수 없는 쿠폰입니다.");
	        }

	        if (!canApplyCouponToItem(coupon, item.cart.getF_code())) {
	            throw new RuntimeException("해당 상품에 적용할 수 없는 쿠폰입니다.");
	        }

	        int discount = calculateCouponDiscount(coupon, item.productTotal);

	        item.couponCode = couponCode;
	        item.couponDiscount = discount;

	        totalCouponDiscount += discount;
	    }

	    return totalCouponDiscount;
	}
	
	private int calculateCouponDiscount(CouponDTO coupon, int itemProductTotal) {
	    int discount = itemProductTotal * Math.max(0, coupon.getDiscount()) / 100;

	    if (coupon.getCoupon_max() > 0) {
	        discount = Math.min(discount, coupon.getCoupon_max());
	    }

	    return Math.min(discount, itemProductTotal);
	}
	
	private String getCouponCompanyId(String couponCatagory) {
	    if (couponCatagory == null) {
	        return "";
	    }

	    String[] parts = couponCatagory.split("_");

	    if (parts.length < 3) {
	        return couponCatagory;
	    }

	    StringBuilder companyId = new StringBuilder();

	    for (int i = 0; i < parts.length - 2; i++) {
	        if (i > 0) {
	            companyId.append("_");
	        }

	        companyId.append(parts[i]);
	    }

	    return companyId.toString();
	}
	
	private boolean canApplyCouponToItem(CouponDTO coupon, String f_code) throws Exception {
	    String couponType = coupon.getCoupon_type() == null ? "all" : coupon.getCoupon_type();
	    String couponCatagory = coupon.getCoupon_catagory();

	    if ("all".equals(couponType)) {
	        return true;
	    }

	    if (couponCatagory == null || couponCatagory.trim().isEmpty()) {
	        return false;
	    }

	    FurnitureDTO furniture = getFurnitureOrThrow(f_code);

	    if ("company".equals(couponType)) {
	    	return normalizeCouponValue(getCouponCompanyId(couponCatagory))
	    	        .equals(normalizeCouponValue(furniture.getC_id()));
	    }

	    if ("catagory".equals(couponType)) {
	        String targetCategory = normalizeCouponValue(couponCatagory);

	        return targetCategory.equals(normalizeCouponValue(furniture.getF_catagory1()))
	            || targetCategory.equals(normalizeCouponValue(furniture.getF_catagory2()))
	            || targetCategory.equals(normalizeCouponValue(furniture.getF_catagory3()))
	            || targetCategory.equals(normalizeCouponValue(furniture.getF_catagory4()))
	            || targetCategory.equals(normalizeCouponValue(furniture.getF_catagory5()));
	    }
	    
	    return false;
	}
	
	private FurnitureDTO getFurnitureOrThrow(String f_code) throws Exception {
	    FurnitureDTO furniture = furnitureMapper.getReadData(f_code);

	    if (furniture == null) {
	        throw new RuntimeException("상품 정보를 찾을 수 없습니다.");
	    }

	    return furniture;
	}
	
	private void decreaseWalletIfEnough(String id, int money) throws Exception {
	    int result = walletMapper.decreaseIfEnough(id, money);

	    if (result != 1) {
	        throw new RuntimeException("지갑 잔액이 부족합니다.");
	    }
	}
	
	@Transactional
	public void pay(String id, PaymentDTO dto) throws Exception {
		if (dto.getC_codeList() == null || dto.getC_codeList().isEmpty()) {
			throw new RuntimeException("결제할 상품이 없습니다.");
		}

		int usePoint = dto.getUse_point();
		
		Map<String, String> couponCodeMap = getCouponCodeMap(dto.getCouponList());

		if (usePoint < 0) {
			throw new RuntimeException("사용 포인트가 올바르지 않습니다.");
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

			if (!isEditableCart(cart, id)) {
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

		int deliveryTotal = calculateDeliveryTotal(paymentItems);
		int couponDiscount = applyCoupons(id, couponCodeMap, paymentItems);

		int originalTotal = productTotal + deliveryTotal;
		
		if (usePoint + couponDiscount > originalTotal) {
		    throw new RuntimeException("할인 금액은 결제 금액보다 클 수 없습니다.");
		}
		allocatePaymentAmount(paymentItems, productTotal, deliveryTotal, usePoint);

		int finalPayTotal = 0;
		for (PaymentItem item : paymentItems) {
			finalPayTotal += item.payTotal;
		}

		decreaseWalletIfEnough(id, finalPayTotal);

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
			
			if (item.couponCode != null) {
			    int couponResult = couponMapper.useCoupon(id, item.couponCode);

			    if (couponResult != 1) {
			        throw new RuntimeException("쿠폰 사용 처리에 실패했습니다.");
			    }
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
	    int pointBaseTotal = 0;

	    for (int i = 0; i < paymentItems.size(); i++) {
	        PaymentItem item = paymentItems.get(i);
	        boolean last = i == paymentItems.size() - 1;

	        int itemDelivery = last
	            ? deliveryTotal - allocatedDelivery
	            : deliveryTotal * item.productTotal / productTotal;

	        allocatedDelivery += itemDelivery;

	        item.originalTotal = item.productTotal + itemDelivery;
	        item.pointBaseTotal = Math.max(0, item.originalTotal - item.couponDiscount);

	        pointBaseTotal += item.pointBaseTotal;
	    }

	    int allocatedUsePoint = 0;

	    for (int i = 0; i < paymentItems.size(); i++) {
	        PaymentItem item = paymentItems.get(i);
	        boolean last = i == paymentItems.size() - 1;

	        int itemUsePoint = last
	            ? usePoint - allocatedUsePoint
	            : pointBaseTotal == 0 ? 0 : usePoint * item.pointBaseTotal / pointBaseTotal;

	        allocatedUsePoint += itemUsePoint;

	        item.usePoint = itemUsePoint;
	        item.payTotal = Math.max(0, item.pointBaseTotal - itemUsePoint);
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
		List<CartDTO> orderList = cartMapper.getMyOrders(id);
		
		if (orderList == null || orderList.isEmpty()) {
			return orderList;
		}
		
		for(CartDTO order : orderList) {
			order.setOptions(cartOptionMapper.getByCartCode(order.getC_code()));
			order.setFurniture(furnitureMapper.getReadData(order.getF_code()));
		
			if (order.getF_dstatus() == 5) {
				FurnitureReviewDTO review = 
						furnitureReviewMapper.getReviewByCartCode(order.getC_code());
				
				order.setReviewed(review != null);
				order.setReview(review);
			}
			
			
            OrderClaimDTO claim =
                orderClaimMapper.getByCartCode(order.getC_code(), id);

            if (claim != null) {
                order.setClaimed(true);
                order.setClaim_type(claim.getClaim_type());
                order.setClaim_status(claim.getClaim_status());
                order.setClaim_code(claim.getClaim_code());
                order.setClaim_reason(claim.getClaim_reason());
            }
	        
			
		}
		
		return orderList;
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
		private String couponCode;
		private int originalTotal;
		private int pointBaseTotal;

		private PaymentItem(
			CartDTO cart,
			List<CartOptionDTO> optionList,
			int productTotal
		) {
			this.cart = cart;
			this.optionList = optionList;
			this.productTotal = productTotal;
		}
	}
	
	private boolean isEditableCart(CartDTO cart, String id) {
	    return cart != null
	        && id.equals(cart.getId());
	}
	
	public Map<String, Object> checkStock(String id, List<String> c_codes) throws Exception {
		List<StockCheckDTO> shortageItems = new ArrayList<>();
		
		if (c_codes == null || c_codes.isEmpty()) {
		    throw new RuntimeException("확인할 상품이 없습니다.");
		}
		
		for(String c_code : c_codes) {
			CartDTO cart = cartMapper.getReadData(c_code);

			if (!isEditableCart(cart, id)) {
			    throw new RuntimeException("확인할 수 없는 장바구니 상품입니다.");
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

