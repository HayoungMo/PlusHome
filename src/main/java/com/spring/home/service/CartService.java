package com.spring.home.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CartOptionDTO;
import com.spring.home.dto.OptionsDTO;
import com.spring.home.mapper.CartMapper;
import com.spring.home.mapper.CartOptionMapper;
import com.spring.home.mapper.OptionsMapper;
import com.spring.home.util.furnitureCode;

@Service
public class CartService {

	@Autowired
	private CartMapper cartMapper;
	
	@Autowired
	private CartOptionMapper cartOptionMapper;
	
	@Autowired
	private OptionsMapper optionsMapper;
	
	private void validateRequiredOptions(String f_code, List<CartOptionDTO> optionsList) throws Exception {
	    List<OptionsDTO> originalOptions = optionsMapper.getListByFcode(f_code);

	    if (originalOptions == null || originalOptions.isEmpty()) {
	        return;
	    }

	    Set<String> requiredGroups = new HashSet<>();

	    for (OptionsDTO option : originalOptions) {
	        if (!"Y".equals(option.getO_important())) {
	            continue;
	        }

	        String select = option.getO_select();

	        if (select != null && !select.trim().isEmpty()) {
	            requiredGroups.add(select.trim());
	        }
	    }

	    if (requiredGroups.isEmpty()) {
	        return;
	    }

	    Set<String> selectedGroups = new HashSet<>();

	    if (optionsList != null) {
	        for (CartOptionDTO option : optionsList) {
	            if (option == null) continue;

	            String select = option.getCo_select();

	            if (select != null && !select.trim().isEmpty()) {
	                selectedGroups.add(select.trim());
	            }
	        }
	    }

	    for (String requiredGroup : requiredGroups) {
	        if (!selectedGroups.contains(requiredGroup)) {
	            throw new RuntimeException("필수 옵션을 선택해주세요.");
	        }
	    }
	}
	
	public String insertData(CartDTO cartDTO, List<CartOptionDTO> optionsList) throws Exception {
	    String c_code = furnitureCode.generateCartCode();

	    cartDTO.setC_code(c_code);
	    cartDTO.setF_status("N");

	    validateRequiredOptions(cartDTO.getF_code(), optionsList);
	    
	    cartMapper.insertData(cartDTO);

	    if(optionsList != null && !optionsList.isEmpty()) {
	        for (CartOptionDTO optionDTO : optionsList) {
	            if(optionDTO == null) continue;

	            optionDTO.setC_code(c_code);
	            optionDTO.setId(cartDTO.getId());
	            optionDTO.setF_code(cartDTO.getF_code());
	            optionDTO.setCo_count(cartDTO.getF_count());

	            cartOptionMapper.insertData(optionDTO);
	        }
	    }

	    return c_code;
	}

	
	public List<CartDTO> getMyCart(String id) throws Exception{
		return cartMapper.getMyCart(id);
	}
	
	public int getAvailablePoint(String id) throws Exception {
		return cartMapper.getAvailablePoint(id);
	}

	public void updateData(CartDTO dto) throws Exception {
		cartMapper.updateData(dto);
	}

	public List<CartOptionDTO> getOptions(String id, String c_code) throws Exception {
		validateCartOwnerForRead(id, c_code);
	    return cartOptionMapper.getByCartCode(c_code);
	}

	@Transactional
	public void deleteData(String id, String c_code) throws Exception {
	    validateCartOwner(id, c_code);

	    cartOptionMapper.deleteData(c_code);

	    int result = cartMapper.deleteData(id, c_code);

	    if (result != 1) {
	        throw new RuntimeException("장바구니 삭제에 실패했습니다.");
	    }
	}
	
	private CartDTO validateCartOwner(String id, String c_code) throws Exception{
		CartDTO cart = cartMapper.getReadData(c_code);
		
		if(cart == null || !id.equals(cart.getId()) || !"N".equals(cart.getF_status())) {
			throw new RuntimeException("요청할 수 없는 장바구니 상품입니다.");
		}
		
		return cart;
	}
	
	private CartDTO validateCartOwnerForRead(String id, String c_code) throws Exception {
	    CartDTO cart = cartMapper.getReadData(c_code);

	    if (cart == null || !id.equals(cart.getId())) {
	        throw new RuntimeException("조회할 수 없는 장바구니 상품입니다.");
	    }

	    return cart;
	}
	
	public void updateCartCount(String id, String c_code, int f_count) throws Exception {
		if (f_count <= 0) {
			throw new RuntimeException("수량이 올바르지 않습니다.");
		}

		CartDTO cart = cartMapper.getReadData(c_code);

		if (cart == null || !id.equals(cart.getId()) || !"N".equals(cart.getF_status())) {
			throw new RuntimeException("수정 가능한 장바구니 상품이 아닙니다.");
		}

		int result = cartMapper.updateCartCount(c_code, id, f_count);

		if (result != 1) {
			throw new RuntimeException("수량 변경에 실패했습니다.");
		}
	}
	
}
