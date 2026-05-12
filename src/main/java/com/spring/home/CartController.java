package com.spring.home;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spring.home.dto.CartDTO;
import com.spring.home.dto.CartOptionDTO;
import com.spring.home.service.CartService;
import com.spring.home.util.JwtUtil;

@RestController
@RequestMapping("/cart")
public class CartController {

	@Resource
	private CartService cartService;
	
	@Resource
	private JwtUtil jwtUtil;
	
	private String getTokenUserId(String authorization) {
		if(authorization == null || !authorization.startsWith("Bearer ")) {
			return null;
		}
		
		try {
			String token = authorization.substring(7);
			return jwtUtil.getId(token);
		}catch (Exception e) {
			System.out.println("토큰 처리 오류: "+ e.getMessage());
			return null;
		}
	}
	
	@PostMapping("/add")
	public ResponseEntity<?> addCart(
	        @RequestHeader(value = "Authorization", required = false) String authorization,
	        @RequestBody Map<String, Object> body) throws Exception {

	    String id = getTokenUserId(authorization);

	    if (id == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

	    @SuppressWarnings("unchecked")
	    Map<String, Object> cartMap = (Map<String, Object>) body.get("cart");

	    @SuppressWarnings("unchecked")
	    List<Map<String, Object>> optionMaps =
	            (List<Map<String, Object>>) body.get("options");

	    CartDTO cartDTO = new CartDTO();

	    cartDTO.setId(id);
	    cartDTO.setF_code((String) cartMap.get("f_code"));
	    cartDTO.setF_count(toInt(cartMap.get("f_count")));
	    cartDTO.setF_addr((String) cartMap.get("f_addr"));
	    cartDTO.setF_name((String) cartMap.get("f_name"));
	    cartDTO.setF_tel((String) cartMap.get("f_tel"));
	    cartDTO.setF_price(toInt(cartMap.get("f_price")));
	    cartDTO.setF_point(toInt(cartMap.get("f_point")));

	    List<CartOptionDTO> optionList = new ArrayList<>();

	    if (optionMaps != null) {
	        for (Map<String, Object> optionMap : optionMaps) {
	            if (optionMap == null) continue;

	            CartOptionDTO optionDTO = new CartOptionDTO();

	            optionDTO.setCo_select((String) optionMap.get("co_select"));
	            optionDTO.setCo_text((String) optionMap.get("co_text"));
	            optionDTO.setCo_count(toInt(optionMap.get("co_count")));
	            optionDTO.setCo_price(toInt(optionMap.get("co_price")));

	            optionList.add(optionDTO);
	        }
	    }

	    cartService.insertData(cartDTO, optionList);

	    Map<String, Object> result = new HashMap<>();
	    result.put("message", "장바구니에 담았습니다.");

	    return ResponseEntity.ok(result);
	}

	
	@GetMapping
	public ResponseEntity<?> getMyCart(
			@RequestHeader(value = "Authorization", required = false) String authorization
	) throws Exception {

		String id = getTokenUserId(authorization);

		if (id == null) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
		}

		List<CartDTO> cartList = cartService.getMyCart(id);

		return ResponseEntity.ok(cartList);
	}

	@GetMapping("/options")
	public ResponseEntity<?> getCartOptions(String c_code) throws Exception {
		List<CartOptionDTO> options = cartService.getOptions(c_code);
		return ResponseEntity.ok(options);
	}

	@DeleteMapping
	public ResponseEntity<?> deleteCart(
	        @RequestHeader(value = "Authorization", required = false) String authorization,
	        String c_code
	) throws Exception {

	    String id = getTokenUserId(authorization);

	    if (id == null) {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인이 필요합니다.");
	    }

	    cartService.deleteData(c_code);

	    Map<String, Object> result = new HashMap<>();
	    result.put("message", "삭제되었습니다.");

	    return ResponseEntity.ok(result);
	}

	private int toInt(Object value) {
		if (value == null) return 0;

		if (value instanceof Number) {
			return ((Number) value).intValue();
		}

		return Integer.parseInt(String.valueOf(value));
	}
	

}
