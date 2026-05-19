package com.spring.home.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CartOptionDTO;
import com.spring.home.mapper.CartMapper;
import com.spring.home.mapper.CartOptionMapper;
import com.spring.home.util.furnitureCode;

@Service
public class CartService {

	@Autowired
	private CartMapper cartMapper;
	
	@Autowired
	private CartOptionMapper cartOptionMapper;
	
	public String insertData(CartDTO cartDTO, List<CartOptionDTO> optionsList) throws Exception {
	    String c_code = furnitureCode.generateCartCode();

	    cartDTO.setC_code(c_code);
	    cartDTO.setF_status("N");

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
	
	public List<CartOptionDTO> getOptions(String c_code) throws Exception{
		return cartOptionMapper.getByCartCode(c_code);
	}

	public int getAvailablePoint(String id) throws Exception {
		return cartMapper.getAvailablePoint(id);
	}

	public void updateData(CartDTO dto) throws Exception {
		cartMapper.updateData(dto);
	}

	public void deleteData(String c_code) throws Exception {
		cartMapper.deleteData(c_code);
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
