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

	public void updateData(CartDTO dto) throws Exception {
		cartMapper.updateData(dto);
	}

	public void deleteData(String c_code) throws Exception {
		cartMapper.deleteData(c_code);
	}
	
}
